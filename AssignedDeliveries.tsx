import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, MapPin, Phone, QrCode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Waybill {
  id: string;
  tracking_id: string;
  receiver_name: string;
  receiver_phone: string;
  receiver_address: string;
  package_details: string;
  status: string;
  estimated_delivery: string;
}

interface AssignedDeliveriesProps {
  onSelectWaybill: (waybillId: string) => void;
  onScanQR: () => void;
  onViewTracking?: (waybillId: string) => void;
}

const AssignedDeliveries = ({ onSelectWaybill, onScanQR, onViewTracking }: AssignedDeliveriesProps) => {
  const [deliveries, setDeliveries] = useState<Waybill[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDeliveries();

    // Subscribe to real-time updates
    const channel = supabase
      .channel("driver-waybills")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "waybills",
        },
        () => {
          fetchDeliveries();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchDeliveries = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("waybills")
        .select("*")
        .eq("driver_id", user.id)
        .neq("status", "delivered")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDeliveries(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch deliveries",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-500",
      "in-transit": "bg-blue-500",
      "out-for-delivery": "bg-purple-500",
      delivered: "bg-green-500",
    };
    return colors[status] || "bg-gray-500";
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading deliveries...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Assigned Deliveries</h2>
        <Button onClick={onScanQR} size="lg" className="gap-2">
          <QrCode className="h-5 w-5" />
          Scan QR
        </Button>
      </div>

      {deliveries.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No deliveries assigned yet
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {deliveries.map((delivery) => (
            <Card key={delivery.id} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{delivery.receiver_name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      #{delivery.tracking_id}
                    </p>
                  </div>
                  <Badge className={getStatusColor(delivery.status)}>
                    {delivery.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <p className="text-sm">{delivery.receiver_address}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <p className="text-sm">{delivery.receiver_phone}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <p className="text-sm">{delivery.package_details}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => onSelectWaybill(delivery.id)}
                    className="flex-1"
                    size="lg"
                  >
                    Update Status & Upload Proof
                  </Button>
                  {onViewTracking && (
                    <Button
                      onClick={() => onViewTracking(delivery.id)}
                      variant="outline"
                      size="lg"
                      className="gap-2"
                    >
                      <MapPin className="h-4 w-4" />
                      Track
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssignedDeliveries;
