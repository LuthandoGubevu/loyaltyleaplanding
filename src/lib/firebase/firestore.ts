
import { db } from './config';
import { collection, addDoc, getDocs, serverTimestamp, query, orderBy, where, limit, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { normalizePlan, type PlanId } from '@/lib/plans';

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
    phone?: string;
    dob?: Date;
    marketingOptIn?: boolean;
};

export async function createUserProfile(uid: string, data: Omit<UserProfile, 'createdAt'>) {
    // Firestore rejects undefined values, so optional fields the user left
    // blank (e.g. date of birth) are left out rather than saved as undefined.
    const fields = Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined));
    try {
        await setDoc(doc(db, "users", uid), {
            ...fields,
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
                phone: data.phone,
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

export type BusinessPlan = PlanId;
export type BusinessStatus = 'pending' | 'active' | 'inactive';

export type Business = {
    name: string;
    assignedAdminEmail: string;
    adminUid: string | null;
    status: BusinessStatus;
    plan: BusinessPlan;
    createdAt: Date;
    createdByUid: string;
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
        plan: normalizePlan(data.plan),
        createdByUid: data.createdByUid,
        createdAt: serverTimestamp(),
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
        plan: normalizePlan(data.plan),
        createdByUid: data.createdByUid,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
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
