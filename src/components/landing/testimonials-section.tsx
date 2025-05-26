import Image from 'next/image';
import { Star } from 'lucide-react';
import { MaxWidthWrapper } from '@/components/max-width-wrapper';
import { Card, CardContent } from '@/components/ui/card';

interface Testimonial {
  quote: string;
  name: string;
  title: string;
  avatarUrl: string;
  logoUrl?: string;
  stars: number;
  companyName: string;
}

const testimonials: Testimonial[] = [
  {
    quote: "Loyalty Leap transformed how we connect with customers. Repeat business is up 30%!",
    name: "Sarah M.",
    title: "Owner, The Cozy Cafe",
    avatarUrl: "https://placehold.co/80x80.png",
    logoUrl: "https://placehold.co/100x40.png?text=Cafe+Logo",
    stars: 5,
    companyName: "The Cozy Cafe",
  },
  {
    quote: "Finally, a loyalty program that's easy for us and our clients. The branded site is a huge plus.",
    name: "John B.",
    title: "Stylist, Modern Cuts Salon",
    avatarUrl: "https://placehold.co/80x80.png",
    logoUrl: "https://placehold.co/100x40.png?text=Salon+Logo",
    stars: 5,
    companyName: "Modern Cuts Salon",
  },
  {
    quote: "The analytics are incredibly helpful. We now understand our customers better than ever.",
    name: "Lisa K.",
    title: "Manager, Bloom & Grow Florist",
    avatarUrl: "https://placehold.co/80x80.png",
    logoUrl: "https://placehold.co/100x40.png?text=Florist+Logo",
    stars: 4,
    companyName: "Bloom & Grow Florist",
  },
];

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-16 md:py-24 bg-[hsl(var(--testimonials-bg-hsl))]">
      <MaxWidthWrapper>
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[hsl(var(--testimonials-text-val))]">
            Loved by Businesses Like Yours
          </h2>
          <p className="mt-4 text-lg text-[hsl(var(--testimonials-text-val))] opacity-80 max-w-2xl mx-auto">
            Hear from small business owners who are growing with Loyalty Leap.
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
                  <Image
                    src={testimonial.avatarUrl}
                    alt={testimonial.name}
                    width={48}
                    height={48}
                    className="rounded-full mr-4"
                    data-ai-hint="business owner avatar"
                  />
                  <div>
                    <p className="font-semibold text-[hsl(var(--testimonials-text-val))]">{testimonial.name}</p>
                    <p className="text-sm text-[hsl(var(--testimonials-text-val))] opacity-70">{testimonial.title}</p>
                  </div>
                  {testimonial.logoUrl && (
                     <Image
                        src={testimonial.logoUrl}
                        alt={`${testimonial.companyName} logo`}
                        width={80}
                        height={32}
                        className="ml-auto object-contain"
                        data-ai-hint="company logo"
                      />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </MaxWidthWrapper>
    </section>
  );
}
