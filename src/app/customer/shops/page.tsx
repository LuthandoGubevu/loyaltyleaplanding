
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

const mockShops = [
  {
    name: "The Cozy Cafe",
    category: "Cafe",
    description: "Artisanal coffee, fresh pastries, and a warm atmosphere.",
    imageUrl: "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?q=80&w=600&h=400&fit=crop",
    imageHint: "cozy cafe",
  },
  {
    name: "Modern Cuts Salon",
    category: "Salon",
    description: "Stay stylish with our expert hair and beauty services.",
    imageUrl: "https://placehold.co/600x400.png",
    imageHint: "modern salon",
  },
  {
    name: "Bloom & Grow Florist",
    category: "Retail",
    description: "Beautiful bouquets and arrangements for every occasion.",
    imageUrl: "https://placehold.co/600x400.png",
    imageHint: "flower shop",
  },
  {
    name: "Urban Threads Boutique",
    category: "Apparel",
    description: "Curated fashion and accessories from independent designers.",
    imageUrl: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?q=80&w=600&h=400&fit=crop",
    imageHint: "clothing boutique",
  },
  {
    name: "The Gilded Page",
    category: "Bookstore",
    description: "Find your next great read in our cozy, independent bookstore.",
    imageUrl: "https://images.unsplash.com/photo-1550399105-c4db5fb85c18?q=80&w=600&h=400&fit=crop",
    imageHint: "bookstore interior",
  },
  {
    name: "FreshFusion Juicery",
    category: "Health",
    description: "Healthy juices, smoothies, and bowls made with fresh ingredients.",
    imageUrl: "https://placehold.co/600x400.png",
    imageHint: "juice bar",
  },
];

export default function ShopsPage() {
  return (
    <div className="flex-1 p-4 md:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Explore Shops</CardTitle>
          <CardDescription>
            Discover all the great places where you can earn and redeem points.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockShops.map((shop) => (
            <Card key={shop.name} className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="relative w-full h-48">
                    <Image
                        src={shop.imageUrl}
                        alt={`Image of ${shop.name}`}
                        fill
                        className="object-cover"
                        data-ai-hint={shop.imageHint}
                    />
                </div>
              <CardHeader>
                <CardTitle>{shop.name}</CardTitle>
                <CardDescription>{shop.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <Badge variant="secondary">{shop.category}</Badge>
              </CardContent>
              <CardFooter>
                 <Button variant="outline" className="w-full">
                    View Details
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
