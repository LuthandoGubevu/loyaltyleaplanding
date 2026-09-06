
import { DemoRequest, addDemoRequest, getDemoRequests as getFirestoreDemoRequests } from "./firebase/firestore";

// All mock data has been wiped to prepare for real client onboarding.
// In a real application, this data would be fetched from a database or API.

export const mockLoyaltyData: { userId: string; stores: StoreLoyaltyData[] } = {
    userId: "demo_user",
    stores: []
  };

  export function getLoyaltyData() {
    // In a real app, this would fetch from a backend.
    return mockLoyaltyData;
  }

  export function getStoreById(storeId: string) {
    // In a real app, this would fetch a single store from a backend.
    return mockLoyaltyData.stores.find(store => store.id === storeId);
  }

  // These functions now interact with Firestore but are kept here
  // to minimize changes in the components that use them.
  export { addDemoRequest };
  export type { DemoRequest };
  export const getDemoRequests = getFirestoreDemoRequests;

  // The type definitions remain to ensure type safety throughout the app.
  export type StoreLoyaltyData = {
      id: string;
      name: string;
      logo: string;
      points: number;
      tier: string;
      nextReward: {
          title: string;
          requiredPoints: number;
      };
      activity: StoreActivity[];
  };

  export type StoreActivity = {
      date: string;
      action: string;
      points: string;
  };

