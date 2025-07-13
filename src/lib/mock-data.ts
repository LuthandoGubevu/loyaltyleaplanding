
export const mockLoyaltyData = {
    userId: "demo_user",
    stores: [
      {
        id: "cozy-cafe",
        name: "The Cozy Cafe",
        logo: "/logos/cafe.png",
        points: 80,
        tier: "Bronze",
        nextReward: {
          title: "Free Muffin",
          requiredPoints: 100
        },
        activity: [
          { date: "2025-07-01", action: "Earned", points: "+20" },
          { date: "2025-06-30", action: "Redeemed: Free Coffee", points: "-50" },
          { date: "2025-06-25", action: "Earned", points: "+40" },
          { date: "2025-06-20", action: "Earned", points: "+20" },
        ]
      },
      {
        id: "bloom-and-grow",
        name: "Bloom & Grow Florist",
        logo: "/logos/florist.png",
        points: 120,
        tier: "Silver",
        nextReward: {
          title: "R50 Off Next Purchase",
          requiredPoints: 150
        },
        activity: [
          { date: "2025-07-02", action: "Earned", points: "+30" },
          { date: "2025-06-15", action: "Earned", points: "+90" },
        ]
      },
      {
        id: "modern-cuts",
        name: "Modern Cuts Salon",
        logo: "/logos/salon.png",
        points: 450,
        tier: "Gold",
        nextReward: {
          title: "25% Off Next Haircut",
          requiredPoints: 500
        },
        activity: [
          { date: "2025-06-28", action: "Earned", points: "+150" },
          { date: "2025-06-10", action: "Earned", points: "+150" },
          { date: "2025-05-20", action: "Earned", points: "+150" },
        ]
      },
      {
        id: "urban-threads",
        name: "Urban Threads Boutique",
        logo: "/logos/apparel.png",
        points: 30,
        tier: "Bronze",
        nextReward: {
          title: "R25 Off T-Shirt",
          requiredPoints: 100
        },
        activity: [
          { date: "2025-06-18", action: "Earned", points: "+30" },
        ]
      }
    ]
  };
  
  export function getLoyaltyData() {
    return mockLoyaltyData;
  }
  
  export function getStoreById(storeId: string) {
    return mockLoyaltyData.stores.find(store => store.id === storeId);
  }
  
  export type StoreLoyaltyData = (typeof mockLoyaltyData.stores)[0];
  export type StoreActivity = (typeof mockLoyaltyData.stores)[0]['activity'][0];
  
