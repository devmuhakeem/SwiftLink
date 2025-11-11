import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Search, CheckCircle, XCircle, UserPlus } from "lucide-react";

interface Waybill {
  id: string;
  tracking_id: string;
  sender_name: string;
  receiver_name: string;
  status: string;
  created_at: string;
  driver_id: string | null;
}

interface Driver {
  id: string;
  full_name: string;
}

const WaybillManagement = () => {
  const [waybills, setWaybills] = useState<Waybill[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchWaybills();
    fetchDrivers();

    const channel = supabase
      .channel("waybills-admin")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "waybills",
        },
        () => {
          fetchWaybills();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchWaybills = async () => {
    try {
      const { data, error } = await supabase
        .from("waybills")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setWaybills(data || []);
    } catch (error) {
      console.error("Error fetching waybills:", error);
      toast({
        title: "Error",
        description: "Failed to fetch waybills",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      const { data: rolesData, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "driver");

      if (rolesError) throw rolesError;

      const driverIds = rolesData.map((r) => r.user_id);

      if (driverIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("user_id, full_name")
          .in("user_id", driverIds);

        if (profilesError) throw profilesError;
        
        const formattedDrivers = profilesData?.map(profile => ({
          id: profile.user_id,
          full_name: profile.full_name || "Unnamed Driver"
        })) || [];
        
        setDrivers(formattedDrivers);
      }
    } catch (error) {
      console.error("Error fetching drivers:", error);
    }
  };

  const handleApprove = async (waybillId: string) => {
    try {
      const { error } = await supabase
        .from("waybills")
        .update({ status: "approved" })
        .eq("id", waybillId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Waybill approved successfully",
      });
    } catch (error) {
      console.error("Error approving waybill:", error);
      toast({
        title: "Error",
        description: "Failed to approve waybill",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (waybillId: string) => {
    try {
      const { error } = await supabase
        .from("waybills")
        .update({ status: "cancelled" })
        .eq("id", waybillId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Waybill rejected",
      });
    } catch (error) {
      console.error("Error rejecting waybill:", error);
      toast({
        title: "Error",
        description: "Failed to reject waybill",
        variant: "destructive",
      });
    }
  };

  const handleAssignDriver = async (waybillId: string, driverId: string) => {
    try {
      const { error } = await supabase
        .from("waybills")
        .update({ driver_id: driverId, status: "in-transit" })
        .eq("id", waybillId);

      if (error) throw error;

      // Create tracking update
      await supabase.from("tracking_updates").insert({
        waybill_id: waybillId,
        status: "in-transit",
        notes: "Driver assigned and delivery in transit",
      });

      toast({
        title: "Success",
        description: "Driver assigned successfully",
      });
    } catch (error) {
      console.error("Error assigning driver:", error);
      toast({
        title: "Error",
        description: "Failed to assign driver",
        variant: "destructive",
      });
    }
  };

  const filteredWaybills = waybills.filter(
    (w) =>
      w.tracking_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.sender_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      w.receiver_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "outline",
      approved: "default",
      "in-transit": "default",
      delivered: "secondary",
      cancelled: "destructive",
    };

    return <Badge variant={variants[status] || "outline"}>{status.toUpperCase()}</Badge>;
  };

  if (loading) {
    return <div>Loading waybills...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Waybill Management</h1>
        <p className="text-muted-foreground">
          Approve, reject, and assign waybills to drivers
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Waybills</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by tracking ID, sender, or receiver..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredWaybills.map((waybill) => (
          <Card key={waybill.id}>
            <CardContent className="pt-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{waybill.tracking_id}</span>
                    {getStatusBadge(waybill.status)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>
                      From: <span className="font-medium">{waybill.sender_name}</span>
                    </p>
                    <p>
                      To: <span className="font-medium">{waybill.receiver_name}</span>
                    </p>
                    <p>Created: {new Date(waybill.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {waybill.status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleApprove(waybill.id)}
                        variant="default"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleReject(waybill.id)}
                        variant="destructive"
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                    </>
                  )}

                  {(waybill.status === "approved" || waybill.status === "pending") &&
                    !waybill.driver_id && (
                      <div className="flex gap-2">
                        <Select
                          onValueChange={(driverId) =>
                            handleAssignDriver(waybill.id, driverId)
                          }
                        >
                          <SelectTrigger className="w-48">
                            <SelectValue placeholder="Assign Driver" />
                          </SelectTrigger>
                          <SelectContent>
                            {drivers.map((driver) => (
                              <SelectItem key={driver.id} value={driver.id}>
                                {driver.full_name || "Unnamed Driver"}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                  {waybill.driver_id && (
                    <Badge variant="secondary">
                      <UserPlus className="mr-1 h-3 w-3" />
                      Driver Assigned
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredWaybills.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">No waybills found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default WaybillManagement;
