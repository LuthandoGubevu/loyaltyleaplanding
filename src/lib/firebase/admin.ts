import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { isStaffEmail, type Role } from '@/lib/roles';

// Credentials, in order of preference:
// - FIREBASE_SERVICE_ACCOUNT_KEY: the service account JSON (needed on hosts
//   outside Google Cloud, e.g. Netlify);
// - otherwise Application Default Credentials: automatic on Firebase App
//   Hosting; locally, point FIRESTORE_EMULATOR_HOST /
//   FIREBASE_AUTH_EMULATOR_HOST at the emulators or set
//   GOOGLE_APPLICATION_CREDENTIALS.
function createAdminApp() {
  const projectId = process.env.GCLOUD_PROJECT ?? 'loyaltyleap-e166f';
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (serviceAccountKey) {
    return initializeApp({ credential: cert(JSON.parse(serviceAccountKey)), projectId });
  }
  return initializeApp({ projectId });
}

const adminApp = getApps().length ? getApp() : createAdminApp();

export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);

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
  } catch {
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
  return user as RequestUser & { businessId: string };
}

export function errorResponse(error: unknown): Response {
  if (error instanceof ApiError) {
    return Response.json({ error: error.message }, { status: error.status });
  }
  console.error(error);
  return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
}
