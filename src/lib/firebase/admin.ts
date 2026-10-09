import { initializeApp, getApps, getApp, cert, type App, type ServiceAccount } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { isStaffEmail, type Role } from '@/lib/roles';

// Thrown when the server can't set up its Firebase connection. Reported to
// the browser as a 503 with a short reason code; the full error goes to the
// server log (Netlify function log). The key itself is never echoed.
class FirebaseSetupError extends Error {
  constructor(public reason: 'firebase-key-invalid' | 'firebase-credentials', cause?: unknown) {
    super(reason);
    this.cause = cause;
  }
}

// Accepts the service account JSON as pasted from the downloaded file, also
// when it is wrapped in quotes, base64-encoded, or its private key's line
// breaks were pasted as literal "\n".
export function parseServiceAccount(raw: string): ServiceAccount {
  let text = raw.trim();
  if (text.startsWith('"')) {
    // The JSON was stored as a quoted JSON string.
    try {
      const unquoted = JSON.parse(text);
      if (typeof unquoted === 'string') text = unquoted.trim();
    } catch {
      text = text.slice(1, -1).trim();
    }
  } else if (text.startsWith("'") && text.endsWith("'")) {
    text = text.slice(1, -1).trim();
  }
  if (!text.startsWith('{')) {
    text = Buffer.from(text, 'base64').toString('utf8').trim();
  }
  const json = JSON.parse(text);
  const privateKey: unknown = json.private_key;
  if (typeof json.project_id !== 'string' || typeof json.client_email !== 'string' || typeof privateKey !== 'string') {
    throw new Error('Service account JSON is missing project_id, client_email or private_key.');
  }
  return {
    projectId: json.project_id,
    clientEmail: json.client_email,
    privateKey: privateKey.includes('\\n') ? privateKey.replace(/\\n/g, '\n') : privateKey,
  };
}

// Credentials, in order of preference:
// - FIREBASE_SERVICE_ACCOUNT_KEY: the service account JSON (needed on hosts
//   outside Google Cloud, e.g. Netlify);
// - otherwise Application Default Credentials: automatic on Firebase App
//   Hosting; locally, point FIRESTORE_EMULATOR_HOST /
//   FIREBASE_AUTH_EMULATOR_HOST at the emulators or set
//   GOOGLE_APPLICATION_CREDENTIALS.
// Set up on first use, so a bad key surfaces as a handled error rather than
// crashing every route when the module loads.
let app: App | null = null;

function getAdminApp(): App {
  if (app) return app;
  if (getApps().length) return (app = getApp());
  const projectId = process.env.GCLOUD_PROJECT ?? 'loyaltyleap-e166f';
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (serviceAccountKey) {
    let credential;
    try {
      const account = parseServiceAccount(serviceAccountKey);
      credential = cert(account);
    } catch (error) {
      throw new FirebaseSetupError('firebase-key-invalid', error);
    }
    return (app = initializeApp({ credential, projectId }));
  }
  return (app = initializeApp({ projectId }));
}

// Forwards to the real client, created on first use.
function lazy<T extends object>(create: () => T): T {
  let instance: T | null = null;
  return new Proxy({} as T, {
    get(_, prop) {
      instance ??= create();
      const value = (instance as any)[prop];
      return typeof value === 'function' ? value.bind(instance) : value;
    },
  });
}

export const adminAuth: Auth = lazy(() => getAuth(getAdminApp()));
export const adminDb: Firestore = lazy(() => getFirestore(getAdminApp()));

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export type RequestUser = {
  uid: string;
  email: string | null;
  role: Role;
  businessId: string | null;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
};

export async function requireUser(req: Request, allowedRoles: Role[]): Promise<RequestUser> {
  const header = req.headers.get('authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw new ApiError(401, 'Please log in again.');

  let decoded;
  try {
    decoded = await adminAuth.verifyIdToken(token);
  } catch (error) {
    if (setupFailureReason(error)) throw error;
    throw new ApiError(401, 'Your session has expired. Please log in again.');
  }

  const snap = await adminDb.collection('users').doc(decoded.uid).get();
  const data = snap.data() ?? {};
  const role: Role = isStaffEmail(decoded.email) ? 'staff' : (data.role ?? 'customer');
  if (!allowedRoles.includes(role)) throw new ApiError(403, 'You do not have access to this.');

  return {
    uid: decoded.uid,
    email: decoded.email ?? null,
    role,
    businessId: data.businessId ?? null,
    firstName: data.firstName ?? null,
    lastName: data.lastName ?? null,
    phone: data.phone ?? null,
  };
}

export async function requireAdminBusiness(req: Request): Promise<RequestUser & { businessId: string }> {
  const user = await requireUser(req, ['admin']);
  if (!user.businessId) throw new ApiError(403, 'Your account is not linked to a business yet.');
  // The business's own adminUid is the source of truth; a profile claiming a
  // businessId is not enough on its own.
  const business = await adminDb.collection('businesses').doc(user.businessId).get();
  if (business.data()?.adminUid !== user.uid) {
    throw new ApiError(403, 'Your account is not the admin of this business.');
  }
  return user as RequestUser & { businessId: string };
}

function setupFailureReason(error: unknown): FirebaseSetupError['reason'] | null {
  if (error instanceof FirebaseSetupError) return error.reason;
  const message = error instanceof Error ? error.message : String(error);
  if (/default credentials|invalid_grant|Failed to parse private key|credential implementation|PERMISSION_DENIED|UNAUTHENTICATED/i.test(message)) {
    return 'firebase-credentials';
  }
  return null;
}

export function errorResponse(error: unknown): Response {
  if (error instanceof ApiError) {
    return Response.json({ error: error.message }, { status: error.status });
  }
  const reason = setupFailureReason(error);
  if (reason) {
    console.error(`Firebase server setup failed (${reason}):`, error instanceof FirebaseSetupError ? error.cause : error);
    return Response.json(
      { error: `The server can't connect to the database (${reason}). Check FIREBASE_SERVICE_ACCOUNT_KEY in Netlify.`, reason },
      { status: 503 },
    );
  }
  console.error(error);
  return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
}
