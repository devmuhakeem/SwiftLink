import { Send, MapPin, PackageCheck } from "lucide-react";

const steps = [
  {
    icon: Send,
    title: "Send",
    description: "Create your digital waybill in minutes.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: MapPin,
    title: "Track",
    description: "Monitor your packages in real-time via QR or Tracking ID.",
    color: "text-secondary",
    bgColor: "bg-secondary/20",
  },
  {
    icon: PackageCheck,
    title: "Deliver",
    description: "Confirm delivery instantly — proof and peace of mind guaranteed.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-20 lg:py-32 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            How <span className="text-primary">SwiftLink</span> Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Three simple steps to transform your logistics
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12 relative">
          {/* Connection line for desktop */}
          <div className="hidden md:block absolute top-20 left-1/4 right-1/4 h-1 bg-gradient-to-r from-primary via-secondary to-primary opacity-20" />
          
          {steps.map((step, index) => (
            <div 
              key={step.title} 
              className="relative animate-slide-up"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className="bg-card rounded-3xl p-8 shadow-soft hover:shadow-elevated transition-smooth border border-border relative z-10">
                <div className={`w-16 h-16 ${step.bgColor} rounded-2xl flex items-center justify-center mb-6 mx-auto md:mx-0`}>
                  <step.icon className={`h-8 w-8 ${step.color}`} />
                </div>
                
                <div className="absolute top-6 right-6 text-5xl font-bold text-muted/10">
                  0{index + 1}
                </div>
                
                <h3 className="text-2xl font-bold mb-3 text-center md:text-left">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-center md:text-left">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
