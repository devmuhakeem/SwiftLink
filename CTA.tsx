import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar } from "lucide-react";

const CTA = () => {
  return (
    <section className="py-20 lg:py-32 relative overflow-hidden">
      {/* Background with gradient */}
      <div className="absolute inset-0 gradient-hero" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItMnptMC0ydjJoLTJ2LTJoMnptMiAwaDJ2Mmg0djJoLTZ2LTR6bTAgMHYtNGgydjRoLTJ6bTItNGg0djJoLTR2LTJ6bS00LTJoMnYyaC0ydi0yem0wLTRoNHYyaC00di0yem0yLTJoMnYyaC0ydi0yem0tOCAyaDJ2MmgtMnYtMnptMCA0aDR2Mmgtd3YtMmgyem0tMiAyaC0ydjJoLTJ2LTJoMnYtMmgydjJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-10" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-6">
            Start Delivering Smarter — <br />
            Go Digital with SwiftLink Today
          </h2>
          
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Join thousands of Nigerian businesses already transforming their logistics with SwiftLink
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg" className="group text-lg h-16 px-12">
              Get Started
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="outline-white" size="lg" className="group text-lg h-16 px-12">
              <Calendar className="mr-2 h-5 w-5" />
              Book a Demo
            </Button>
          </div>
          
          <div className="mt-12 pt-12 border-t border-white/20">
            <p className="text-white/80 mb-4">Trusted by leading Nigerian businesses</p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              <div className="text-white font-semibold text-lg">Jumia</div>
              <div className="text-white font-semibold text-lg">Konga</div>
              <div className="text-white font-semibold text-lg">Paystack</div>
              <div className="text-white font-semibold text-lg">Flutterwave</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
