import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import heroImage from "@/assets/hero-delivery-rider.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/10" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left animate-fade-in">
            <div className="inline-block mb-6 px-4 py-2 bg-secondary/20 rounded-full">
              <span className="text-sm font-semibold text-primary">🇳🇬 Made for Nigerian MSMEs</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 leading-tight">
              <span className="text-primary">Waybill made easier</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto lg:mx-0">
              Empowering Nigerian MSMEs to send, track, and manage deliveries — digitally, reliably, and in real time.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button variant="hero" size="lg" className="group">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" size="lg" className="group">
                <Play className="mr-2 h-5 w-5" />
                Learn More
              </Button>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-6 mt-12 pt-12 border-t border-border">
              <div>
                <div className="text-3xl font-bold text-primary">5000+</div>
                <div className="text-sm text-muted-foreground">MSMEs Served</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">24/7</div>
                <div className="text-sm text-muted-foreground">Support</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">99.9%</div>
                <div className="text-sm text-muted-foreground">Uptime</div>
              </div>
            </div>
          </div>
          
          {/* Right Image */}
          <div className="relative animate-scale-in">
            <div className="relative rounded-3xl overflow-hidden shadow-elevated">
              <img 
                src={heroImage} 
                alt="Nigerian delivery rider with package" 
                className="w-full h-auto object-cover"
              />
              {/* Overlay gradient for better text visibility if needed */}
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/20 to-transparent" />
            </div>
            
            {/* Floating card */}
            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-elevated max-w-xs hidden lg:block">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                  <span className="text-2xl">📦</span>
                </div>
                <div>
                  <div className="font-bold text-charcoal">Track in Real-Time</div>
                  <div className="text-sm text-muted-foreground">Via QR or USSD *34745#</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-secondary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
    </section>
  );
};

export default Hero;
