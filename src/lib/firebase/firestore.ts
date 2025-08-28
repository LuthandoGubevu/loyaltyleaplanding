
import { db } from './config';
import { collection, addDoc, getDocs, serverTimestamp, query, orderBy } from 'firebase/firestore';

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
