import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardOverview from "@/components/dashboard/DashboardOverview";
import CreateWaybill from "@/components/dashboard/CreateWaybill";
import DeliveriesList from "@/components/dashboard/DeliveriesList";
import LiveTracking from "@/components/dashboard/LiveTracking";
import NotificationsPanel from "@/components/dashboard/NotificationsPanel";
import ProfileView from "@/components/dashboard/ProfileView";

const SenderDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [activeView, setActiveView] = useState<"dashboard" | "create" | "deliveries" | "tracking" | "notifications" | "profile">("dashboard");
  const [selectedWaybillId, setSelectedWaybillId] = useState<string | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (!session) {
          navigate("/auth");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleViewTracking = (waybillId: string) => {
    setSelectedWaybillId(waybillId);
    setActiveView("tracking");
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar activeView={activeView} setActiveView={setActiveView} />
      
      <main className="flex-1 p-6 lg:p-8">
        {activeView === "dashboard" && <DashboardOverview onCreateNew={() => setActiveView("create")} />}
        {activeView === "create" && <CreateWaybill onSuccess={() => setActiveView("deliveries")} />}
        {activeView === "deliveries" && <DeliveriesList onViewTracking={handleViewTracking} />}
        {activeView === "tracking" && <LiveTracking waybillId={selectedWaybillId} />}
        {activeView === "notifications" && <NotificationsPanel />}
        {activeView === "profile" && <ProfileView />}
      </main>
    </div>
  );
};

export default SenderDashboard;
