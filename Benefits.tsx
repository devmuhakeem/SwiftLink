import { Clock, Eye, Shield, FileCheck } from "lucide-react";
import marketVendor from "@/assets/market-vendor.jpg";
import courierLoading from "@/assets/courier-loading.jpg";

const benefits = [
  {
    icon: Clock,
    text: "Save time and eliminate paperwork",
  },
  {
    icon: Eye,
    text: "Gain full delivery visibility",
  },
  {
    icon: Shield,
    text: "Build customer trust through transparency",
  },
  {
    icon: FileCheck,
    text: "Simplify record-keeping for your business",
  },
];

const Benefits = () => {
  return (
    <section id="benefits" className="py-20 lg:py-32 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            SwiftLink Helps You<span className="text-primary">...</span>
          </h2>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Benefits Grid */}
          <div className="grid sm:grid-cols-2 gap-6 order-2 lg:order-1">
            {benefits.map((benefit, index) => (
              <div 
                key={benefit.text}
                className="bg-card rounded-2xl p-6 shadow-soft hover:shadow-elevated transition-smooth border border-border animate-slide-up"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="w-12 h-12 bg-secondary/20 rounded-xl flex items-center justify-center mb-4">
                  <benefit.icon className="h-6 w-6 text-primary" />
                </div>
                <p className="font-semibold text-foreground leading-relaxed">
                  {benefit.text}
                </p>
              </div>
            ))}
          </div>
          
          {/* Image */}
          <div className="order-1 lg:order-2 animate-scale-in">
            <div className="relative rounded-3xl overflow-hidden shadow-elevated">
              <img 
                src={marketVendor} 
                alt="Nigerian market vendor using smartphone" 
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
        
        {/* Second row with image on left */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-scale-in">
            <div className="relative rounded-3xl overflow-hidden shadow-elevated">
              <img 
                src={courierLoading} 
                alt="Courier loading parcels into tricycle" 
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
          
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-3xl font-bold">
              Designed for the <span className="text-primary">Nigerian Market</span>
            </h3>
            <p className="text-lg text-muted-foreground leading-relaxed">
              We understand the unique challenges of Nigerian MSMEs. From unreliable internet to the need for local payment methods, SwiftLink is built to work in your reality.
            </p>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-charcoal">✓</span>
                </div>
                <span className="text-foreground">Works with USSD — no smartphone required</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-charcoal">✓</span>
                </div>
                <span className="text-foreground">Available in multiple Nigerian languages</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-charcoal">✓</span>
                </div>
                <span className="text-foreground">Affordable pricing for small businesses</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Benefits;
