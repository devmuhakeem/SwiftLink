import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Wifi, WifiOff } from "lucide-react";
import AssignedDeliveries from "@/components/driver/AssignedDeliveries";
import QRScanner from "@/components/driver/QRScanner";
import ProofOfDeliveryUpload from "@/components/driver/ProofOfDeliveryUpload";
import RouteSimulation from "@/components/driver/RouteSimulation";
import LiveTracking from "@/components/dashboard/LiveTracking";
import GPSTracker from "@/components/driver/GPSTracker";
import { Button } from "@/components/ui/button";
import { Truck, MapPin } from "lucide-react";

const DriverDashboard = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [selectedWaybill, setSelectedWaybill] = useState<string | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [activeView, setActiveView] = useState<"deliveries" | "tracking">("deliveries");
  const [trackingWaybillId, setTrackingWaybillId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleViewTracking = (waybillId: string) => {
    setTrackingWaybillId(waybillId);
    setActiveView("tracking");
  };

  useEffect(() => {
    // Check if user is authenticated and has driver role
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .single();

      if (roleData?.role !== "driver") {
        toast({
          title: "Access Denied",
          description: "This page is only accessible to drivers",
          variant: "destructive",
        });
        navigate("/dashboard");
      }
    };

    checkAuth();
  }, [navigate, toast]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "Back Online",
        description: "Your connection has been restored. Data will sync automatically.",
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "Offline Mode",
        description: "You're offline. Changes will sync when connection returns.",
        variant: "destructive",
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [toast]);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header with offline indicator */}
      <header className="sticky top-0 z-50 bg-primary text-primary-foreground p-4 shadow-md">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div>
            <h1 className="text-xl font-bold">Driver Dashboard</h1>
            <p className="text-xs opacity-90">
              {activeView === "tracking" ? "Track Delivery" : "Your assigned deliveries"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <Button
                variant={activeView === "deliveries" ? "secondary" : "outline"}
                size="sm"
                onClick={() => setActiveView("deliveries")}
                className="flex items-center gap-1 h-8 text-xs"
              >
                <Truck className="h-3 w-3" />
                Deliveries
              </Button>
              <Button
                variant={activeView === "tracking" ? "secondary" : "outline"}
                size="sm"
                onClick={() => setActiveView("tracking")}
                className="flex items-center gap-1 h-8 text-xs"
              >
                <MapPin className="h-3 w-3" />
                Track
              </Button>
            </div>
            <div className="flex items-center gap-2">
              {isOnline ? (
                <Wifi className="h-5 w-5 text-green-400" />
              ) : (
                <WifiOff className="h-5 w-5 text-destructive" />
              )}
              <span className="text-sm">
                {isOnline ? "Online" : "Offline"}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-6">
        {activeView === "deliveries" ? (
          <>
            {/* QR Scanner Modal */}
            {showScanner && (
              <QRScanner
                onScan={(trackingId) => {
                  setSelectedWaybill(trackingId);
                  setShowScanner(false);
                }}
                onClose={() => setShowScanner(false)}
              />
            )}

            {/* GPS Tracker */}
            <GPSTracker waybillId={trackingWaybillId} />

            {/* Route Simulation */}
            <RouteSimulation />

            {/* Assigned Deliveries */}
            <AssignedDeliveries
              onSelectWaybill={setSelectedWaybill}
              onScanQR={() => setShowScanner(true)}
              onViewTracking={handleViewTracking}
            />

            {/* Proof of Delivery Upload */}
            {selectedWaybill && (
              <ProofOfDeliveryUpload
                waybillId={selectedWaybill}
                onComplete={() => {
                  setSelectedWaybill(null);
                  toast({
                    title: "Delivery Completed",
                    description: "Proof of delivery uploaded successfully",
                  });
                }}
                onCancel={() => setSelectedWaybill(null)}
              />
            )}
          </>
        ) : (
          <LiveTracking waybillId={trackingWaybillId} />
        )}
      </main>
    </div>
  );
};

export default DriverDashboard;
