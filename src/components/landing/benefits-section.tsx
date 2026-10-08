
import { MaxWidthWrapper } from '@/components/max-width-wrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ScanLine, Settings2, ShieldCheck, BarChart3, Repeat } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Benefit {
  icon: LucideIcon;
  title: string;
  description: string;
}

const benefits: Benefit[] = [
  {
    icon: Users,
    title: 'Works for Every Customer',
    description: 'Smartphone users scan a QR code in their browser, with nothing to download. Customers without a smartphone or data just give their cellphone number.',
  },
  {
    icon: ScanLine,
    title: 'A Till Screen Built for Busy Counters',
    description: 'Show a QR code or look up a cellphone number, add a stamp and redeem rewards, all from one screen on any phone or tablet.',
  },
  {
    icon: Settings2,
    title: 'Your Rewards, Your Rules',
    description: 'Decide what earns a stamp, set a minimum spend, and offer several rewards, like a free muffin at 5 stamps and a free coffee at 10.',
  },
  {
    icon: ShieldCheck,
    title: 'Cheat-Proof Stamps',
    description: 'Each till QR code works once and expires after 60 seconds, so it can\'t be photographed and reused. You also choose how often a customer can earn a stamp.',
  },
  {
    icon: BarChart3,
    title: 'Every Visit on Record',
    description: 'Every stamp and reward is logged, so you can see who your regulars are and how your programme is performing.',
  },
  {
    icon: Repeat,
    title: 'Bring Customers Back',
    description: 'Give customers a reason to choose you again. Add new customers in seconds at the till, with their consent recorded under POPIA.',
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
            Everything a local business needs to run a loyalty programme, without expensive hardware or apps.
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
