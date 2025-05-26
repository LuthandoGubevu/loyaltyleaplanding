import { MaxWidthWrapper } from '@/components/max-width-wrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, BarChart3, Smartphone, Repeat, Settings2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Benefit {
  icon: LucideIcon;
  title: string;
  description: string;
}

const benefits: Benefit[] = [
  {
    icon: Smartphone,
    title: 'No App Required',
    description: 'Customers access their loyalty status via a simple web link – no downloads needed.',
  },
  {
    icon: BarChart3,
    title: 'Real-Time Customer Analytics',
    description: 'Gain valuable insights into customer behavior and purchase patterns.',
  },
  {
    icon: CheckCircle2, // Placeholder, might need a branding icon
    title: 'Fully Branded Loyalty Websites',
    description: 'Maintain your brand consistency with a customizable loyalty portal.',
  },
  {
    icon: Repeat,
    title: 'Increases Repeat Purchases',
    description: 'Incentivize customers to return more often and spend more.',
  },
  {
    icon: Settings2,
    title: 'Customizable for Any Industry',
    description: 'Tailor rewards and tiers to fit your specific business needs perfectly.',
  },
];

export function BenefitsSection() {
  return (
    <section id="benefits" className="py-16 md:py-24 bg-secondary/30">
      <MaxWidthWrapper>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Unlock Growth with Powerful Features
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Loyalty Leap is packed with features designed to help your small business thrive.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit) => (
            <Card key={benefit.title} className="bg-card shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl group hover:scale-105">
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className="p-3 bg-[hsl(var(--primary))]/10 rounded-lg">
                  <benefit.icon className="w-7 h-7 text-[hsl(var(--primary))]" />
                </div>
                <CardTitle className="text-xl font-semibold text-foreground">{benefit.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </MaxWidthWrapper>
    </section>
  );
}
