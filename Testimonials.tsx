import { Quote } from "lucide-react";

const testimonials = [
  {
    name: "Muhammed AbdulAkeem",
    role: "Small Business Owner",
    location: "Bauchi",
    quote: "SwiftLink made it easy to manage my deliveries and track packages even with low internet. It's fast and reliable.",
  },
  {
    name: "Noble Miracle",
    role: "Logistics Operator",
    location: "Lagos",
    quote: "Before SwiftLink, waybills were always a mess. Now everything is digital — with QR tracking and instant alerts.",
  },
  {
    name: "Hawau",
    role: "Market Trader",
    location: "Ibadan",
    quote: "I love that I can use my voice to create waybills. It feels like having an assistant by my side!",
  },
];

const Testimonials = () => {
  return (
    <section id="testimonials" className="py-20 lg:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Trusted by <span className="text-primary">Nigerian MSMEs</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See how business owners across Nigeria use SwiftLink daily
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={testimonial.name}
              className="bg-muted/50 rounded-3xl p-8 border border-border hover:border-primary/30 transition-smooth shadow-soft hover:shadow-elevated animate-scale-in"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <Quote className="h-10 w-10 text-secondary mb-6" />
              
              <p className="text-foreground leading-relaxed mb-6 text-lg">
                "{testimonial.quote}"
              </p>
              
              <div className="pt-6 border-t border-border">
                <div className="font-bold text-foreground">{testimonial.name}</div>
                <div className="text-sm text-muted-foreground">
                  {testimonial.role} • {testimonial.location}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
