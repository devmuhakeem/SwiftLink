import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { format } from "date-fns";
import { MapPin, Package, Clock } from "lucide-react";

interface LiveTrackingProps {
  waybillId: string | null;
}

const LiveTracking = ({ waybillId }: LiveTrackingProps) => {
  const [waybill, setWaybill] = useState<any>(null);
  const [trackingUpdates, setTrackingUpdates] = useState<any[]>([]);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken] = useState("pk.eyJ1IjoiZGV2bXVoYWtlZW0iLCJhIjoiY21odTlteXlmMGJhbDJtc2R3dmV2ZWRjciJ9._h1WGLMJ3D4NhT9cG_2UUw");

  useEffect(() => {
    if (!waybillId) return;

    const fetchData = async () => {
      const { data: waybillData } = await supabase
        .from("waybills")
        .select("*")
        .eq("id", waybillId)
        .single();

      const { data: updatesData } = await supabase
        .from("tracking_updates")
        .select("*")
        .eq("waybill_id", waybillId)
        .order("created_at", { ascending: false });

      if (waybillData) setWaybill(waybillData);
      if (updatesData) setTrackingUpdates(updatesData);
    };

    fetchData();

    const channel = supabase
      .channel(`tracking-${waybillId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tracking_updates",
          filter: `waybill_id=eq.${waybillId}`,
        },
        () => fetchData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [waybillId]);

  useEffect(() => {
    if (!mapContainer.current || !trackingUpdates.length) return;

    try {
      mapboxgl.accessToken = mapboxToken;

      const validUpdates = trackingUpdates.filter(
        (update) => update.latitude && update.longitude
      );

      if (validUpdates.length > 0 && !map.current) {
        const latestUpdate = validUpdates[0];

        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: "mapbox://styles/mapbox/streets-v12",
          center: [Number(latestUpdate.longitude), Number(latestUpdate.latitude)],
          zoom: 12,
        });

        map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

        new mapboxgl.Marker({ color: "#415caa" })
          .setLngLat([Number(latestUpdate.longitude), Number(latestUpdate.latitude)])
          .setPopup(
            new mapboxgl.Popup().setHTML(
              `<div class="p-2">
                <p class="font-semibold">Current Location</p>
                <p class="text-xs">${latestUpdate.status}</p>
              </div>`
            )
          )
          .addTo(map.current);
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
  }, [trackingUpdates, mapboxToken]);

  if (!waybillId) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Select a waybill to track</p>
      </div>
    );
  }

  if (!waybill) {
    return <div>Loading...</div>;
  }

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Track Delivery</h1>
        <p className="text-muted-foreground mt-1">Real-time tracking for {waybill.tracking_id}</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{waybill.tracking_id}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {waybill.package_details}
              </p>
            </div>
            {getStatusBadge(waybill.status)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Package className="h-5 w-5 text-primary mt-1" />
              <div>
                <p className="font-semibold text-foreground">From</p>
                <p className="text-sm text-muted-foreground">{waybill.sender_name}</p>
                <p className="text-sm text-muted-foreground">{waybill.sender_address}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-primary mt-1" />
              <div>
                <p className="font-semibold text-foreground">To</p>
                <p className="text-sm text-muted-foreground">{waybill.receiver_name}</p>
                <p className="text-sm text-muted-foreground">{waybill.receiver_address}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Live Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              ref={mapContainer}
              className="w-full h-[400px] rounded-lg bg-muted flex items-center justify-center"
            >
              {trackingUpdates.some((u) => u.latitude && u.longitude) ? null : (
                <p className="text-muted-foreground">GPS tracking will appear here when available</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Tracking History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {trackingUpdates.map((update, index) => (
                <div key={update.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`h-3 w-3 rounded-full ${
                        index === 0 ? "bg-primary" : "bg-muted-foreground"
                      }`}
                    />
                    {index !== trackingUpdates.length - 1 && (
                      <div className="w-0.5 h-full bg-border mt-1" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="font-semibold text-foreground">
                      {update.status.replace("_", " ").toUpperCase()}
                    </p>
                    {update.location && (
                      <p className="text-sm text-muted-foreground">{update.location}</p>
                    )}
                    {update.notes && (
                      <p className="text-sm text-muted-foreground">{update.notes}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(update.created_at), "MMM dd, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LiveTracking;
