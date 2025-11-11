import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Route, MapPin, User } from "lucide-react";

interface Waybill {
  id: string;
  tracking_id: string;
  receiver_name: string;
  receiver_address: string;
  status: string;
  driver_id: string | null;
}

interface Driver {
  id: string;
  full_name: string;
}

const RouteOptimization = () => {
  const [waybills, setWaybills] = useState<Waybill[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [selectedWaybills, setSelectedWaybills] = useState<string[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const { toast } = useToast();
  const mapboxToken = "pk.eyJ1IjoiZGV2bXVoYWtlZW0iLCJhIjoiY21odTlteXlmMGJhbDJtc2R3dmV2ZWRjciJ9._h1WGLMJ3D4NhT9cG_2UUw";

  useEffect(() => {
    fetchData();
    
    const channel = supabase
      .channel("route-optimization")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "waybills" },
        () => fetchData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (!mapContainer.current) return;

    try {
      mapboxgl.accessToken = mapboxToken;

      if (!map.current) {
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: "mapbox://styles/mapbox/streets-v12",
          center: [7.4914, 9.0765], // Nigeria center
          zoom: 6,
        });
      }

      // Clear existing markers
      markers.current.forEach(marker => marker.remove());
      markers.current = [];

      // Add markers for selected waybills (mock coordinates for demo)
      selectedWaybills.forEach((waybillId, index) => {
        const waybill = waybills.find(w => w.id === waybillId);
        if (waybill) {
          // Mock coordinates - spread around Nigeria
          const lat = 9.0765 + (Math.random() - 0.5) * 4;
          const lng = 7.4914 + (Math.random() - 0.5) * 4;

          const marker = new mapboxgl.Marker({ 
            color: index === 0 ? "#415caa" : index === selectedWaybills.length - 1 ? "#e9e729" : "#dbddd8" 
          })
            .setLngLat([lng, lat])
            .setPopup(
              new mapboxgl.Popup().setHTML(
                `<div class="p-2">
                  <p class="font-semibold">${waybill.receiver_name}</p>
                  <p class="text-sm">${waybill.receiver_address}</p>
                  <p class="text-xs text-muted-foreground">${waybill.tracking_id}</p>
                </div>`
              )
            )
            .addTo(map.current!);

          markers.current.push(marker);
        }
      });

      // Fit bounds to show all markers
      if (markers.current.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        markers.current.forEach(marker => {
          bounds.extend(marker.getLngLat());
        });
        map.current?.fitBounds(bounds, { padding: 50 });
      }
    } catch (error) {
      console.error("Map initialization error:", error);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [selectedWaybills, waybills]);

  const fetchData = async () => {
    // Fetch approved waybills without driver assignment
    const { data: waybillsData } = await supabase
      .from("waybills")
      .select("*")
      .eq("status", "approved")
      .is("driver_id", null)
      .order("created_at", { ascending: false });

    // Fetch drivers
    const { data: driversData } = await supabase
      .from("user_roles")
      .select("user_id, profiles(id, user_id, full_name)")
      .eq("role", "driver");

    if (waybillsData) setWaybills(waybillsData);
    if (driversData) {
      const formattedDrivers = driversData
        .filter(d => d.profiles)
        .map(d => ({
          id: d.user_id,
          full_name: (d.profiles as any).full_name || "Unknown Driver",
        }));
      setDrivers(formattedDrivers);
    }
  };

  const toggleWaybillSelection = (waybillId: string) => {
    setSelectedWaybills(prev =>
      prev.includes(waybillId)
        ? prev.filter(id => id !== waybillId)
        : [...prev, waybillId]
    );
  };

  const handleAssignRoute = async () => {
    if (!selectedDriver || selectedWaybills.length === 0) {
      toast({
        title: "Selection Required",
        description: "Please select a driver and at least one delivery",
        variant: "destructive",
      });
      return;
    }

    try {
      // Assign all selected waybills to the driver
      const updates = selectedWaybills.map(async (waybillId) => {
        const { error: waybillError } = await supabase
          .from("waybills")
          .update({ 
            driver_id: selectedDriver,
            status: "in-transit"
          })
          .eq("id", waybillId);

        if (waybillError) throw waybillError;

        // Create tracking update
        await supabase.from("tracking_updates").insert({
          waybill_id: waybillId,
          status: "in-transit",
          notes: "Route assigned by admin - optimized delivery sequence",
        });
      });

      await Promise.all(updates);

      toast({
        title: "Route Assigned",
        description: `${selectedWaybills.length} deliveries assigned to driver`,
      });

      setSelectedWaybills([]);
      setSelectedDriver(null);
      fetchData();
    } catch (error) {
      console.error("Assignment error:", error);
      toast({
        title: "Assignment Failed",
        description: "Failed to assign route",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Route Optimization</h1>
        <p className="text-muted-foreground mt-1">
          Assign multiple deliveries to drivers with optimized routes
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map View */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Route Visualization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              ref={mapContainer}
              className="w-full h-[500px] rounded-lg bg-muted"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Selected: {selectedWaybills.length} deliveries
            </p>
          </CardContent>
        </Card>

        {/* Assignment Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Route className="h-5 w-5" />
              Route Assignment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Driver Selection */}
            <div>
              <label className="text-sm font-semibold mb-2 block">
                Select Driver
              </label>
              <div className="space-y-2">
                {drivers.map((driver) => (
                  <Button
                    key={driver.id}
                    variant={selectedDriver === driver.id ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setSelectedDriver(driver.id)}
                  >
                    <User className="h-4 w-4 mr-2" />
                    {driver.full_name}
                  </Button>
                ))}
                {drivers.length === 0 && (
                  <p className="text-sm text-muted-foreground">No drivers available</p>
                )}
              </div>
            </div>

            {/* Assign Button */}
            <Button
              className="w-full"
              onClick={handleAssignRoute}
              disabled={!selectedDriver || selectedWaybills.length === 0}
            >
              Assign Route ({selectedWaybills.length})
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Available Waybills */}
      <Card>
        <CardHeader>
          <CardTitle>Available Deliveries</CardTitle>
          <p className="text-sm text-muted-foreground">
            Select deliveries to create an optimized route
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {waybills.map((waybill) => (
              <div
                key={waybill.id}
                className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  selectedWaybills.includes(waybill.id)
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => toggleWaybillSelection(waybill.id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-foreground">
                      {waybill.receiver_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {waybill.receiver_address}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {waybill.tracking_id}
                    </p>
                  </div>
                  <Badge variant="secondary">Ready</Badge>
                </div>
              </div>
            ))}
            {waybills.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No deliveries available for assignment
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RouteOptimization;
