import { MaxWidthWrapper } from '@/components/max-width-wrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, QrCode, Award, Gift, ChevronRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Step {
  icon: LucideIcon;
  title: string;
  description: string;
  iconColorClass: string;
}

const steps: Step[] = [
  {
    icon: ShoppingCart,
    title: 'Make a Purchase',
    description: 'Customers shop as usual and pay however they like: cash, card or EFT.',
    iconColorClass: 'text-[hsl(var(--primary))]', // Coral Red
  },
  {
    icon: QrCode,
    title: 'Collect a Stamp',
    description: 'They scan the one-time QR code on the till screen, or simply give staff their cellphone number.',
    iconColorClass: 'text-[hsl(var(--accent))]', // Slate Purple
  },
  {
    icon: Award,
    title: 'Watch Stamps Add Up',
    description: 'Each shop sets its own rewards, like a free coffee after 10 stamps.',
    iconColorClass: 'text-[hsl(var(--soft-reddish-orange-hsl))]', // Soft Reddish Orange
  },
  {
    icon: Gift,
    title: 'Redeem at the Till',
    description: 'Staff see when a reward is ready and redeem it in one tap.',
    iconColorClass: 'text-[hsl(var(--deep-blue-hsl))]', // Deep Blue
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-background">
      <MaxWidthWrapper>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Simple Steps to Lasting Loyalty
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            A digital stamp card that works for every customer, whether they have a smartphone or not.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch">
          {steps.map((step, index) => (
            <div key={step.title} className="flex flex-col items-center text-center group">
              <Card className="w-full h-full flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl">
                <CardHeader className="items-center">
                  <div className={`p-4 bg-primary/10 rounded-full mb-4 ${step.iconColorClass.replace('text-', 'bg-').replace(']', '/10]')} transition-transform duration-300 group-hover:scale-110`}>
                    <step.icon className={`w-10 h-10 ${step.iconColorClass}`} strokeWidth={1.5} />
                  </div>
                  <CardTitle className="text-xl font-semibold text-foreground">{step.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
              {index < steps.length - 1 && (
                <ChevronRight className="hidden lg:block text-muted-foreground w-12 h-12 absolute top-1/2 -translate-y-1/2 right-[-2rem] opacity-50 group-hover:opacity-100 transition-opacity" />
              )}
            </div>
          ))}
        </div>
      </MaxWidthWrapper>
    </section>
  );
}
