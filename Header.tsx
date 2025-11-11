import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import swiftlinkLogo from "@/assets/swiftlink-logo.png";
import { User } from "@supabase/supabase-js";

const Header = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center">
          <img 
            src={swiftlinkLogo} 
            alt="SwiftLink Logo" 
            className="h-8 sm:h-10 md:h-11 lg:h-12 w-auto"
          />
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <a href="/#features" className="text-foreground hover:text-primary transition-smooth font-medium">
            Features
          </a>
          <a href="/#benefits" className="text-foreground hover:text-primary transition-smooth font-medium">
            Benefits
          </a>
          <a href="/#testimonials" className="text-foreground hover:text-primary transition-smooth font-medium">
            Testimonials
          </a>
          <button
            onClick={() => navigate("/track")}
            className="text-foreground hover:text-primary transition-smooth font-medium"
          >
            Track Package
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden sm:inline text-sm text-muted-foreground">
                {user.email}
              </span>
              <Button variant="ghost" onClick={handleSignOut} size="default">
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="ghost" 
                className="hidden sm:inline-flex"
                onClick={() => navigate("/auth")}
              >
                Sign In
              </Button>
              <Button 
                variant="secondary" 
                size="default"
                onClick={() => navigate("/auth")}
              >
                Get Started
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
