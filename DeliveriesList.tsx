import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Eye } from "lucide-react";
import { format } from "date-fns";

interface DeliveriesListProps {
  onViewTracking: (waybillId: string) => void;
}

const DeliveriesList = ({ onViewTracking }: DeliveriesListProps) => {
  const [waybills, setWaybills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWaybills = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("waybills")
        .select("*")
        .eq("sender_id", user.id)
        .order("created_at", { ascending: false });

      if (data) {
        setWaybills(data);
      }
      setLoading(false);
    };

    fetchWaybills();

    const channel = supabase
      .channel("waybills-list")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "waybills",
        },
        () => fetchWaybills()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      pending: "secondary",
      in_transit: "default",
      delivered: "default",
      cancelled: "destructive",
    };

    return (
      <Badge variant={variants[status] || "default"}>
        {status.replace("_", " ").toUpperCase()}
      </Badge>
    );
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Deliveries</h1>
        <p className="text-muted-foreground mt-1">Track and manage all your waybills</p>
      </div>

      <div className="space-y-4">
        {waybills.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No waybills created yet</p>
            </CardContent>
          </Card>
        ) : (
          waybills.map((waybill) => (
            <Card key={waybill.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{waybill.tracking_id}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Created {format(new Date(waybill.created_at), "MMM dd, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                  {getStatusBadge(waybill.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">From</p>
                    <p className="text-foreground">{waybill.sender_name}</p>
                    <p className="text-sm text-muted-foreground">{waybill.sender_phone}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground">To</p>
                    <p className="text-foreground">{waybill.receiver_name}</p>
                    <p className="text-sm text-muted-foreground">{waybill.receiver_phone}</p>
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-sm font-semibold text-muted-foreground">Package</p>
                  <p className="text-foreground">{waybill.package_details}</p>
                  {waybill.package_weight && (
                    <p className="text-sm text-muted-foreground">Weight: {waybill.package_weight} kg</p>
                  )}
                </div>
                <Button
                  onClick={() => onViewTracking(waybill.id)}
                  className="w-full gap-2"
                >
                  <MapPin className="h-4 w-4" />
                  Track Delivery
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default DeliveriesList;
