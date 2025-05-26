
import { MaxWidthWrapper } from '@/components/max-width-wrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Smartphone, BarChart3, Palette, Repeat, Settings2, Server } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Benefit {
  icon: LucideIcon;
  title: string;
  description: string;
}

const benefits: Benefit[] = [
  {
    icon: Smartphone,
    title: 'Seamless QR & Web Access',
    description: 'Customers engage via QR codes or web links—no app needed. A fully functional, accessible loyalty system.',
  },
  {
    icon: BarChart3,
    title: 'Insightful Customer Analytics',
    description: 'Leverage real-time data and customer insights (data mining) to understand behavior and personalize offers.',
  },
  {
    icon: Palette,
    title: 'Your Brand, Your Portal',
    description: 'Maintain brand consistency with a customizable, white-labeled customer loyalty portal.',
  },
  {
    icon: Repeat,
    title: 'Boost Sales & Retention',
    description: 'Incentivize repeat purchases and foster loyalty, unlocking upselling opportunities and long-term customer value.',
  },
  {
    icon: Settings2,
    title: 'Flexible & Customizable',
    description: 'Tailor rewards, tiers, and the platform to fit your specific business needs, regardless of industry.',
  },
  {
    icon: Server,
    title: 'Reliable Infrastructure & Updates',
    description: 'Count on secure hosting, robust databases, dedicated support, and continuous platform improvements.',
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
                <div className="p-3 bg-primary/10 rounded-lg">
                  <benefit.icon className="w-7 h-7 text-primary" />
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
