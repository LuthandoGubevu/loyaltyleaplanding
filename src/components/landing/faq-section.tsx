import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { MaxWidthWrapper } from '@/components/max-width-wrapper';
import Link from 'next/link';

const faqs = [
  {
    question: "Is Loyalty Leap suitable for my type of business?",
    answer: "Yes. Loyalty Leap works for any business with repeat customers, including cafés, salons, restaurants, florists and retail stores. You decide what earns a stamp and which rewards customers can unlock.",
  },
  {
    question: "Do my customers need to download an app or own a smartphone?",
    answer: "No. Customers with a smartphone use Loyalty Leap in their web browser to scan the QR code at your till; there's nothing to download. Customers without a smartphone or data simply give their cellphone number, and your staff add the stamp for them.",
  },
  {
    question: "What do I need at the till?",
    answer: "Any smartphone, tablet or computer with an internet connection and a web browser. You log in, open the Till screen, and you're ready to add stamps.",
  },
  {
    question: "How do you stop customers from cheating?",
    answer: "The QR code on your till screen only appears when staff tap \"Show QR\", works once, and expires after 60 seconds, so a photo of it is useless. You can also set how many hours must pass before the same customer earns another stamp.",
  },
  {
    question: "Does it work with my POS or cash register?",
    answer: "Loyalty Leap runs alongside any POS or cash register, and customers can pay with cash, card or EFT. Staff add stamps from the Till screen, so no POS integration is needed.",
  },
  {
    question: "What about my customers' personal information?",
    answer: "Staff only add a customer after the customer agrees to join, and that consent is recorded, in line with POPIA. Each business can only see its own customers.",
  },
  {
    question: "What kind of support do you offer?",
    answer: "All plans include email support. Growth includes priority email support, and Pro includes dedicated onboarding and phone support.",
  },
];

export function FaqSection() {
  return (
    <section id="faq" className="py-16 md:py-24 bg-background">
      <MaxWidthWrapper>
        <div className="grid md:grid-cols-3 gap-12">
          <div className="md:col-span-1">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Find answers to common questions about Loyalty Leap. If you don't see your question here, feel free to reach out.
            </p>
            <Button size="lg" asChild className="mt-8 bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link href="/book-a-demo">Book A Demo Call</Link>
            </Button>
          </div>
          <div className="md:col-span-2">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem value={`item-${index}`} key={index} className="border-b border-border">
                  <AccordionTrigger className="text-left py-4 text-lg font-medium hover:no-underline text-[hsl(var(--deep-blue-hsl))] data-[state=open]:text-[hsl(var(--primary))]">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="pt-1 pb-4 text-base text-muted-foreground bg-background">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </MaxWidthWrapper>
    </section>
  );
}
