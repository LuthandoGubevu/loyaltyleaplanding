
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
    name: 'Starter',
    price: 'R399',
    priceFrequency: '/month',
    description: 'For a small shop getting started with loyalty',
    features: [
      'Up to 250 members',
      'Up to 2 active rewards',
      'Till screen: QR code & cellphone number stamps',
      'Customer list & dashboard',
      'Reward cost tracking',
      'Email support',
    ],
    ctaText: 'Start your free month',
  },
  {
    name: 'Growth',
    price: 'R799',
    priceFrequency: '/month',
    description: 'See what your programme is doing for you',
    features: [
      'Up to 1,000 members',
      'Unlimited rewards',
      'Birthday rewards',
      'Analytics: weekly stamps, new members & rewards',
      'Busiest days & hours',
      'Top customers & upcoming birthdays',
      'Programme cost per month',
      'Priority email support',
    ],
    isRecommended: true,
    ctaText: 'Start your free month',
  },
  {
    name: 'Pro',
    price: 'R1,199',
    priceFrequency: '/month',
    description: 'Know who is slipping away and what loyalty costs you',
    features: [
      'Unlimited members',
      'Everything in Growth',
      'Return rate & lapsed customers',
      'Quiet times & how customers collect stamps',
      'Cost per visit & reward liability',
      'Reward performance & age groups',
      'CSV export of customers & stamp history',
      'Dedicated onboarding',
    ],
    ctaText: 'Start your free month',
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-16 md:py-24 bg-secondary/30">
      <MaxWidthWrapper>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Onboard Your Business, Unlock Your Customer Base
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            To get access to our network of shoppers, you first need to bring your business onto the Loyalty Leap platform. Our team will help you set up your loyalty programme, and your first month is free.
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
                  className={`w-full font-bold ${tier.isRecommended ? 'bg-[hsl(var(--pricing-recommended-badge-hsl))] hover:bg-[hsl(var(--pricing-recommended-badge-hsl))]/90 text-white' : 'bg-primary hover:bg-primary/90 text-primary-foreground'}`}
                  asChild
                >
                  <Link href="/book-a-demo">{tier.ctaText}</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
        <p className="mt-10 text-center text-sm text-muted-foreground">
          Your first month is free on every plan. All prices exclude VAT. Questions?{' '}
          <Link href="/book-a-demo" className="font-semibold text-primary hover:underline">
            Book a demo
          </Link>{' '}
          to see it in action.
        </p>
      </MaxWidthWrapper>
    </section>
  );
}
