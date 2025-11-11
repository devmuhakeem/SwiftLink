import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { LayoutDashboard, Package, Map, Users, LogOut, Route } from "lucide-react";
import swiftlinkLogo from "@/assets/swiftlink-logo.png";

interface AdminSidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

const AdminSidebar = ({ activeView, setActiveView }: AdminSidebarProps) => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const menuItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "waybills", label: "Waybills", icon: Package },
    { id: "routes", label: "Route Optimization", icon: Route },
    { id: "map", label: "Live Map", icon: Map },
    { id: "users", label: "Users", icon: Users },
  ];

  return (
    <aside className="w-64 border-r border-border bg-card p-6 flex flex-col">
      <div className="mb-8">
        <img src={swiftlinkLogo} alt="SwiftLink" className="h-10 w-auto" />
        <p className="text-xs text-muted-foreground mt-2">Admin Portal</p>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={activeView === item.id ? "secondary" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveView(item.id)}
            >
              <Icon className="mr-2 h-4 w-4" />
              {item.label}
            </Button>
          );
        })}
      </nav>

      <Button
        variant="ghost"
        className="w-full justify-start mt-auto"
        onClick={handleSignOut}
      >
        <LogOut className="mr-2 h-4 w-4" />
        Sign Out
      </Button>
    </aside>
  );
};

export default AdminSidebar;
