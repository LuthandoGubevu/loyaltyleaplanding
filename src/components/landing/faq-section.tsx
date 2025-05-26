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
    answer: "Absolutely! Loyalty Leap is designed to be flexible and customizable for various small businesses, including salons, retail stores, cafes, restaurants, and more. You can tailor rewards and tiers to match your specific industry and customer base.",
  },
  {
    question: "Do my customers need to download an app?",
    answer: "No, one of the key benefits of Loyalty Leap is that it's app-free. Customers can easily access their loyalty status, points, and rewards through a simple web link on any smartphone or computer.",
  },
  {
    question: "How long does it take to set up Loyalty Leap?",
    answer: "Getting started with Loyalty Leap is quick and easy. Basic setup can be done in under an hour. Our team is also here to assist you if you need any help with customization or integration.",
  },
  {
    question: "Can I integrate Loyalty Leap with my existing POS system?",
    answer: "We offer various integration options, including API access for custom solutions on our higher-tier plans. For simpler setups, the QR code system works independently and seamlessly alongside any POS.",
  },
  {
    question: "What kind of support do you offer?",
    answer: "All our plans include email support. Our Growth and Custom plans come with priority support and dedicated account management to ensure you get the most out of Loyalty Leap.",
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
              <Link href="#contact">Contact Support</Link>
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
