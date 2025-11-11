import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminOverview from "@/components/admin/AdminOverview";
import WaybillManagement from "@/components/admin/WaybillManagement";
import RouteOptimization from "@/components/admin/RouteOptimization";
import DeliveryMap from "@/components/admin/DeliveryMap";
import UserManagement from "@/components/admin/UserManagement";

const AdminDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState("overview");
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      setUser(session.user);

      // Check if user has admin role
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .single();

      if (!roleData) {
        navigate("/dashboard");
        return;
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen w-full bg-background">
      <AdminSidebar activeView={activeView} setActiveView={setActiveView} />
      
      <main className="flex-1 p-6 lg:p-8">
        {activeView === "overview" && <AdminOverview />}
        {activeView === "waybills" && <WaybillManagement />}
        {activeView === "routes" && <RouteOptimization />}
        {activeView === "map" && <DeliveryMap />}
        {activeView === "users" && <UserManagement />}
      </main>
    </div>
  );
};

export default AdminDashboard;
