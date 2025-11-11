import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface TrackingUpdate {
  id: string;
  waybill_id: string;
  latitude: number;
  longitude: number;
  status: string;
  created_at: string;
  waybills: {
    tracking_id: string;
    receiver_name: string;
  };
}

const DeliveryMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [trackingData, setTrackingData] = useState<TrackingUpdate[]>([]);
  const { toast } = useToast();
  const mapboxToken = "pk.eyJ1IjoiZGV2bXVoYWtlZW0iLCJhIjoiY21odTlteXlmMGJhbDJtc2R3dmV2ZWRjciJ9._h1WGLMJ3D4NhT9cG_2UUw";

  useEffect(() => {
    if (!mapContainer.current) return;

    fetchTrackingData();

    const channel = supabase
      .channel("tracking-updates")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tracking_updates",
        },
        () => {
          fetchTrackingData();
        }
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

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/light-v11",
        center: [7.4914, 9.0820], // Nigeria center
        zoom: 6,
      });

      map.current.addControl(new mapboxgl.NavigationControl(), "top-right");
    } catch (error) {
      console.error("Map initialization error:", error);
      toast({
        title: "Map Error",
        description: "Failed to initialize map",
        variant: "destructive",
      });
    }

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    if (!map.current || trackingData.length === 0) return;

    // Clear existing markers
    const markers = document.getElementsByClassName("mapboxgl-marker");
    while (markers[0]) {
      markers[0].remove();
    }

    // Add markers for each tracking update
    trackingData.forEach((update) => {
      if (update.latitude && update.longitude) {
        const el = document.createElement("div");
        el.className = "custom-marker";
        el.style.width = "30px";
        el.style.height = "30px";
        el.style.borderRadius = "50%";
        el.style.backgroundColor = update.status === "delivered" ? "#22c55e" : "#3b82f6";
        el.style.border = "3px solid white";
        el.style.boxShadow = "0 2px 4px rgba(0,0,0,0.3)";

        new mapboxgl.Marker(el)
          .setLngLat([update.longitude, update.latitude])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(
              `<div class="p-2">
                <p class="font-semibold">${update.waybills.tracking_id}</p>
                <p class="text-sm">To: ${update.waybills.receiver_name}</p>
                <p class="text-xs text-gray-600">${update.status}</p>
              </div>`
            )
          )
          .addTo(map.current!);
      }
    });
  }, [trackingData]);

  const fetchTrackingData = async () => {
    try {
      const { data, error } = await supabase
        .from("tracking_updates")
        .select(
          `
          id,
          waybill_id,
          latitude,
          longitude,
          status,
          created_at,
          waybills (
            tracking_id,
            receiver_name
          )
        `
        )
        .not("latitude", "is", null)
        .not("longitude", "is", null)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get unique latest updates per waybill
      const uniqueUpdates = data?.reduce((acc: TrackingUpdate[], curr) => {
        if (!acc.find((item) => item.waybill_id === curr.waybill_id)) {
          acc.push(curr as TrackingUpdate);
        }
        return acc;
      }, []);

      setTrackingData(uniqueUpdates || []);
    } catch (error) {
      console.error("Error fetching tracking data:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Live Delivery Map</h1>
        <p className="text-muted-foreground">
          Real-time tracking of all active deliveries
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div ref={mapContainer} className="h-[600px] w-full rounded-lg" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Deliveries ({trackingData.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {trackingData.length > 0 ? (
            <div className="space-y-2">
              {trackingData.slice(0, 5).map((update) => (
                <div
                  key={update.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{update.waybills.tracking_id}</p>
                    <p className="text-sm text-muted-foreground">
                      To: {update.waybills.receiver_name}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-primary/10 rounded-full">
                    {update.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">
              No active deliveries with GPS data
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DeliveryMap;
