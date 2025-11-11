import { Phone, Mic, FileText, Navigation, Bell, ClipboardCheck } from "lucide-react";

const features = [
  {
    icon: Phone,
    title: "USSD Access",
    description: "Get started with our USSD with no internet access, just dial *34745#.",
  },
  {
    icon: Mic,
    title: "Voice Assistive Technology",
    description: "Use voice commands to create or track your waybill.",
  },
  {
    icon: FileText,
    title: "Digital Waybills",
    description: "No more paper — manage shipments digitally and securely.",
  },
  {
    icon: Navigation,
    title: "Live GPS Tracking",
    description: "Follow your goods in real-time from pickup to delivery.",
  },
  {
    icon: Bell,
    title: "Instant Notifications",
    description: "Get automatic SMS and email alerts for every update.",
  },
  {
    icon: ClipboardCheck,
    title: "Proof of Delivery",
    description: "Receive verified delivery confirmation instantly.",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-20 lg:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Why <span className="text-primary">SwiftLink?</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Built to simplify logistics for small businesses across Nigeria
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div 
              key={feature.title}
              className="group bg-card rounded-2xl p-8 border border-border hover:border-primary/50 transition-smooth shadow-soft hover:shadow-elevated animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-secondary/30 transition-smooth">
                <feature.icon className="h-7 w-7 text-primary" />
              </div>
              
              <h3 className="text-xl font-bold mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
