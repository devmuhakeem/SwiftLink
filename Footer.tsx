import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import swiftlinkLogo from "@/assets/swiftlink-logo.png";

const Footer = () => {
  return (
    <footer className="bg-charcoal text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Logo and Tagline */}
          <div className="lg:col-span-2">
            <img 
              src={swiftlinkLogo} 
              alt="SwiftLink Logo" 
              className="h-12 w-auto mb-6 brightness-0 invert"
            />
            <p className="text-white/80 mb-6 max-w-md leading-relaxed">
              Smart Waybill. Swift Delivery. Empowering Nigerian MSMEs with digital logistics solutions.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-secondary transition-smooth group">
                <Facebook className="h-5 w-5 text-white group-hover:text-charcoal" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-secondary transition-smooth group">
                <Instagram className="h-5 w-5 text-white group-hover:text-charcoal" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-secondary transition-smooth group">
                <Linkedin className="h-5 w-5 text-white group-hover:text-charcoal" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-secondary transition-smooth group">
                <Twitter className="h-5 w-5 text-white group-hover:text-charcoal" />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <a href="#features" className="text-white/70 hover:text-secondary transition-smooth">
                  Features
                </a>
              </li>
              <li>
                <a href="#benefits" className="text-white/70 hover:text-secondary transition-smooth">
                  Benefits
                </a>
              </li>
              <li>
                <a href="#testimonials" className="text-white/70 hover:text-secondary transition-smooth">
                  Testimonials
                </a>
              </li>
              <li>
                <a href="#" className="text-white/70 hover:text-secondary transition-smooth">
                  Pricing
                </a>
              </li>
            </ul>
          </div>
          
          {/* Legal */}
          <div>
            <h3 className="font-bold text-lg mb-4">Legal</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-white/70 hover:text-secondary transition-smooth">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="text-white/70 hover:text-secondary transition-smooth">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="text-white/70 hover:text-secondary transition-smooth">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-white/70 hover:text-secondary transition-smooth">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-white/70 hover:text-secondary transition-smooth">
                  Sign In
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/60 text-sm">
              © 2025 SwiftLink. All rights reserved.
            </p>
            <p className="text-secondary font-semibold">
              Smart Waybill. Swift Delivery. 🇳🇬
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
