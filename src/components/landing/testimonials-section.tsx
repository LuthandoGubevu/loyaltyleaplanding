import Image from 'next/image';
import { Star } from 'lucide-react';
import { MaxWidthWrapper } from '@/components/max-width-wrapper';
import { Card, CardContent } from '@/components/ui/card';

interface Testimonial {
  quote: string;
  name: string;
  title: string;
  stars: number;
}

const testimonials: Testimonial[] = [
  {
    quote: "I love how easy it is to earn points! I got a free coffee last week just for my regular visits.",
    name: "Alex S.",
    title: "Loyal Customer",
    stars: 5,
  },
  {
    quote: "Finally, a rewards program that doesn't require another app on my phone. The web portal is super convenient.",
    name: "Jordan B.",
    title: "Frequent Shopper",
    stars: 5,
  },
  {
    quote: "It's so satisfying to watch my points add up and get real rewards. It makes me want to shop local more often.",
    name: "Taylor K.",
    title: "Valued Patron",
    stars: 4,
  },
];

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-16 md:py-24 bg-[hsl(var(--testimonials-bg-hsl))]">
      <MaxWidthWrapper>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[hsl(var(--testimonials-text-val))]">
            Loved by Customers Like You
          </h2>
          <p className="mt-4 text-lg text-[hsl(var(--testimonials-text-val))] opacity-80 max-w-2xl mx-auto">
            Hear from happy customers enjoying the rewards at their favorite local spots.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-background shadow-lg rounded-xl overflow-hidden flex flex-col">
              <CardContent className="p-6 flex-grow flex flex-col">
                <div className="flex mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i < testimonial.stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <p className="text-[hsl(var(--testimonials-text-val))] italic mb-6 flex-grow">"{testimonial.quote}"</p>
                <div className="flex items-center mt-auto pt-4 border-t border-border">
                  <div>
                    <p className="font-semibold text-[hsl(var(--testimonials-text-val))]">{testimonial.name}</p>
                    <p className="text-sm text-[hsl(var(--testimonials-text-val))] opacity-70">{testimonial.title}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </MaxWidthWrapper>
    </section>
  );
}
