
import { MaxWidthWrapper } from '@/components/max-width-wrapper';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import Link from 'next/link';

interface PricingTier {
  name: string;
  price: string;
  priceFrequency: string;
  description: string;
  features: string[];
  isRecommended?: boolean;
  ctaText: string;
}

const tiers: PricingTier[] = [
  {
    name: 'Custom',
    price: 'Let\'s Talk',
    priceFrequency: '',
    description: "We tailor solutions for each business",
    features: ['Basic QR code loyalty', 'Unlimited Customers', 'Email support', 'Customizable rewards', 'Customer analytics'],
    ctaText: 'Book A Demo Call',
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-16 md:py-24 bg-secondary/30">
      <MaxWidthWrapper>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Flexible Pricing for Every Business
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that’s right for you and start building customer loyalty today. No hidden fees.
          </p>
        </div>
        <div className="grid lg:grid-cols-3 gap-8 items-stretch justify-center">
          {tiers.map((tier) => (
            <Card
              key={tier.name}
              className={`flex flex-col shadow-lg rounded-xl ${tier.isRecommended ? 'border-2 border-[hsl(var(--pricing-recommended-badge-hsl))] relative ring-4 ring-[hsl(var(--pricing-recommended-badge-hsl))] ring-opacity-20' : 'border-border'} ${tiers.length === 1 ? 'lg:col-span-1 lg:max-w-md mx-auto' : ''}`}
            >
              {tier.isRecommended && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[hsl(var(--pricing-recommended-badge-hsl))] text-white px-4 py-1 text-sm font-semibold rounded-full shadow-md">
                  Recommended
                </div>
              )}
              <CardHeader className="pt-10">
                <CardTitle className="text-2xl font-bold text-foreground">{tier.name}</CardTitle>
                <div className="flex items-baseline my-4">
                  <span className="text-4xl font-extrabold text-foreground">{tier.price}</span>
                  {tier.priceFrequency && <span className="ml-1 text-muted-foreground">{tier.priceFrequency}</span>}
                </div>
                <CardDescription className="text-muted-foreground min-h-[3em]">{tier.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-2 shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="mt-6">
                <Button
                  size="lg"
                  className={`w-full ${tier.isRecommended ? 'bg-[hsl(var(--pricing-recommended-badge-hsl))] hover:bg-[hsl(var(--pricing-recommended-badge-hsl))]/90 text-white' : 'bg-primary hover:bg-primary/90 text-primary-foreground'}`}
                  asChild
                >
                  <Link href="/book-a-demo">{tier.ctaText}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </MaxWidthWrapper>
    </section>
  );
}
