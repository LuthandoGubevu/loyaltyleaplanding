
import { db } from './config';
import { collection, addDoc, getDocs, serverTimestamp, query, orderBy, where, limit, doc, setDoc, getDoc, updateDoc, runTransaction, Timestamp } from 'firebase/firestore';

export type DemoRequest = {
    businessName: string;
    ownerName: string;
    email: string;
    phone?: string;
    message: string;
};

export type DemoRequestWithId = DemoRequest & {
    id: string;
    submittedAt: Date;
};

export type UserProfile = {
    email: string;
    role: 'staff' | 'admin' | 'customer';
    createdAt: Date;
    businessId?: string;
    firstName?: string;
    lastName?: string;
    dob?: Date;
    marketingOptIn?: boolean;
};

export async function createUserProfile(uid: string, data: Omit<UserProfile, 'createdAt'>) {
    try {
        await setDoc(doc(db, "users", uid), {
            ...data,
            createdAt: new Date(),
        });
    } catch (error) {
        console.error("Error creating user profile: ", error);
        throw new Error("Could not create user profile.");
    }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
        const userDocRef = doc(db, "users", uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            return {
                email: data.email,
                role: data.role || 'customer',
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
                businessId: data.businessId,
                firstName: data.firstName,
                lastName: data.lastName,
                dob: data.dob,
                marketingOptIn: data.marketingOptIn,
            };
        }
        console.warn("No such user document!");
        return null;
    } catch (error) {
        console.error("Error getting user profile: ", error);
        return null;
    }
}

export async function getUserRole(uid: string): Promise<'staff' | 'admin' | 'customer' | null> {
    const profile = await getUserProfile(uid);
    return profile?.role ?? null;
}

export async function addDemoRequest(request: DemoRequest) {
    try {
        await addDoc(collection(db, 'demo-requests'), {
            ...request,
            submittedAt: serverTimestamp(),
        });
    } catch (error) {
        console.error("Error adding document: ", error);
        throw new Error("Could not submit demo request.");
    }
}

export async function getDemoRequests(): Promise<DemoRequestWithId[]> {
    try {
        const q = query(collection(db, "demo-requests"), orderBy("submittedAt", "desc"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                businessName: data.businessName,
                ownerName: data.ownerName,
                email: data.email,
                phone: data.phone,
                message: data.message,
                submittedAt: data.submittedAt.toDate(),
            };
        });
    } catch (error) {
        console.error("Error getting documents: ", error);
        return [];
    }
}

// ---------------------------------------------------------------------------
// Businesses (staff onboards each client business here; an admin account gets
// linked to exactly one business, either at signup via a pending assignment,
// or later by staff).
// ---------------------------------------------------------------------------

export type BusinessPlan = 'Launch' | 'Growth' | 'Complete';
export type BusinessStatus = 'pending' | 'active' | 'inactive';

export type Business = {
    name: string;
    assignedAdminEmail: string;
    adminUid: string | null;
    status: BusinessStatus;
    plan: BusinessPlan;
    createdAt: Date;
    createdByUid: string;
    pointsPerScan: number;
    scanCooldownHours: number;
};

export type BusinessWithId = Business & { id: string };

export async function createBusiness(data: {
    name: string;
    assignedAdminEmail: string;
    plan: BusinessPlan;
    createdByUid: string;
}): Promise<string> {
    const docRef = await addDoc(collection(db, 'businesses'), {
        name: data.name,
        assignedAdminEmail: data.assignedAdminEmail.toLowerCase().trim(),
        adminUid: null,
        status: 'pending',
        plan: data.plan,
        createdByUid: data.createdByUid,
        createdAt: serverTimestamp(),
        pointsPerScan: 10,
        scanCooldownHours: 24,
    });
    return docRef.id;
}

function mapBusinessDoc(docSnap: any): BusinessWithId {
    const data = docSnap.data();
    return {
        id: docSnap.id,
        name: data.name,
        assignedAdminEmail: data.assignedAdminEmail,
        adminUid: data.adminUid ?? null,
        status: data.status,
        plan: data.plan,
        createdByUid: data.createdByUid,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
        pointsPerScan: data.pointsPerScan ?? 10,
        scanCooldownHours: data.scanCooldownHours ?? 24,
    };
}

export async function getBusinesses(): Promise<BusinessWithId[]> {
    try {
        const q = query(collection(db, 'businesses'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(mapBusinessDoc);
    } catch (error) {
        console.error("Error getting businesses: ", error);
        return [];
    }
}

export async function getBusiness(businessId: string): Promise<BusinessWithId | null> {
    try {
        const docSnap = await getDoc(doc(db, 'businesses', businessId));
        if (!docSnap.exists()) return null;
        return mapBusinessDoc(docSnap);
    } catch (error) {
        console.error("Error getting business: ", error);
        return null;
    }
}

export async function findPendingBusinessByEmail(email: string): Promise<BusinessWithId | null> {
    try {
        const q = query(
            collection(db, 'businesses'),
            where('assignedAdminEmail', '==', email.toLowerCase().trim()),
            where('adminUid', '==', null),
            limit(1)
        );
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) return null;
        return mapBusinessDoc(querySnapshot.docs[0]);
    } catch (error) {
        console.error("Error finding pending business: ", error);
        return null;
    }
}

export async function claimBusiness(businessId: string, uid: string) {
    await updateDoc(doc(db, 'businesses', businessId), {
        adminUid: uid,
        status: 'active',
    });
}

export async function updateBusinessStatus(businessId: string, status: BusinessStatus) {
    await updateDoc(doc(db, 'businesses', businessId), { status });
}

export async function updateBusinessPointsConfig(businessId: string, pointsPerScan: number) {
    await updateDoc(doc(db, 'businesses', businessId), { pointsPerScan });
}

// ---------------------------------------------------------------------------
// Scans (a customer scans a business's QR code and earns points). Enforced
// almost entirely by firestore.rules, not this client code: a customer can
// only ever increment their own membership doc by exactly the business's
// configured pointsPerScan, and only once scanCooldownHours has elapsed
// since their last scan there. This code exists to make that one write
// (plus its paired scan-log entry) atomic and to translate a rules
// rejection into a friendly message instead of a raw error.
// ---------------------------------------------------------------------------

export type Membership = {
    points: number;
    lastScanAt: Date;
    joinedAt: Date;
};

export async function getMembership(businessId: string, uid: string): Promise<Membership | null> {
    try {
        const docSnap = await getDoc(doc(db, 'businesses', businessId, 'members', uid));
        if (!docSnap.exists()) return null;
        const data = docSnap.data();
        return {
            points: data.points,
            lastScanAt: data.lastScanAt?.toDate ? data.lastScanAt.toDate() : data.lastScanAt,
            joinedAt: data.joinedAt?.toDate ? data.joinedAt.toDate() : data.joinedAt,
        };
    } catch (error) {
        console.error("Error getting membership: ", error);
        return null;
    }
}

export type ScanResult =
    | { status: 'awarded'; pointsAwarded: number; newTotal: number }
    | { status: 'cooldown'; retryAfter: Date }
    | { status: 'error'; message: string };

export async function recordScan(businessId: string, uid: string): Promise<ScanResult> {
    const businessRef = doc(db, 'businesses', businessId);
    const memberRef = doc(db, 'businesses', businessId, 'members', uid);
    const scanRef = doc(collection(db, 'businesses', businessId, 'scans'));

    try {
        return await runTransaction(db, async (transaction) => {
            const [businessSnap, memberSnap] = await Promise.all([
                transaction.get(businessRef),
                transaction.get(memberRef),
            ]);

            if (!businessSnap.exists()) {
                return { status: 'error', message: 'This store could not be found.' } as ScanResult;
            }

            const business = businessSnap.data();
            const pointsPerScan: number = business.pointsPerScan ?? 10;
            const cooldownHours: number = business.scanCooldownHours ?? 24;
            // Client-side "now" is only used to pre-check the cooldown for a
            // fast, friendly response. The actual write below uses
            // serverTimestamp() so the committed value matches request.time,
            // which is what firestore.rules independently verifies.
            const approxNowMs = Date.now();

            if (memberSnap.exists()) {
                const member = memberSnap.data();
                const lastScanAt: Timestamp = member.lastScanAt;
                const retryAfterMs = lastScanAt.toMillis() + cooldownHours * 60 * 60 * 1000;
                if (approxNowMs < retryAfterMs) {
                    return { status: 'cooldown', retryAfter: new Date(retryAfterMs) } as ScanResult;
                }

                const newTotal = member.points + pointsPerScan;
                transaction.update(memberRef, { points: newTotal, lastScanAt: serverTimestamp() });
                transaction.set(scanRef, { customerUid: uid, pointsAwarded: pointsPerScan, scannedAt: serverTimestamp() });
                return { status: 'awarded', pointsAwarded: pointsPerScan, newTotal } as ScanResult;
            }

            transaction.set(memberRef, { points: pointsPerScan, lastScanAt: serverTimestamp(), joinedAt: serverTimestamp() });
            transaction.set(scanRef, { customerUid: uid, pointsAwarded: pointsPerScan, scannedAt: serverTimestamp() });
            return { status: 'awarded', pointsAwarded: pointsPerScan, newTotal: pointsPerScan } as ScanResult;
        });
    } catch (error: any) {
        // A rules rejection here almost always means the cooldown window
        // hasn't actually elapsed (a race with the check above) rather than
        // a real error, so it reads as the same friendly cooldown message.
        console.error("Error recording scan: ", error);
        if (error?.code === 'permission-denied') {
            return { status: 'cooldown', retryAfter: new Date() };
        }
        return { status: 'error', message: 'Something went wrong recording your scan. Please try again.' };
    }
}
