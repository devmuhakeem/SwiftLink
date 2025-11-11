import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface GPSPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
}

interface UseGPSTrackingOptions {
  enabled: boolean;
  updateInterval?: number; // in milliseconds
  waybillId?: string | null;
}

export const useGPSTracking = ({
  enabled,
  updateInterval = 30000, // 30 seconds default
  waybillId,
}: UseGPSTrackingOptions) => {
  const [position, setPosition] = useState<GPSPosition | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [watchId, setWatchId] = useState<number | null>(null);

  useEffect(() => {
    if (!enabled || !waybillId) {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        setWatchId(null);
      }
      setIsTracking(false);
      return;
    }

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      toast({
        title: "GPS Not Available",
        description: "Your device does not support GPS tracking",
        variant: "destructive",
      });
      return;
    }

    setIsTracking(true);

    // Watch position for real-time updates
    const id = navigator.geolocation.watchPosition(
      async (geoPosition) => {
        const newPosition = {
          latitude: geoPosition.coords.latitude,
          longitude: geoPosition.coords.longitude,
          accuracy: geoPosition.coords.accuracy,
        };

        setPosition(newPosition);
        setError(null);

        // Update location in database
        try {
          const { error: updateError } = await supabase
            .from("tracking_updates")
            .insert({
              waybill_id: waybillId,
              latitude: newPosition.latitude,
              longitude: newPosition.longitude,
              status: "in-transit",
              notes: `GPS update - accuracy: ${Math.round(newPosition.accuracy)}m`,
            });

          if (updateError) {
            console.error("Failed to update GPS location:", updateError);
          }
        } catch (err) {
          console.error("GPS update error:", err);
        }
      },
      (geoError) => {
        let errorMessage = "Failed to get location";
        switch (geoError.code) {
          case geoError.PERMISSION_DENIED:
            errorMessage = "Location permission denied";
            break;
          case geoError.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable";
            break;
          case geoError.TIMEOUT:
            errorMessage = "Location request timed out";
            break;
        }
        setError(errorMessage);
        console.error("GPS error:", errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: updateInterval,
      }
    );

    setWatchId(id);

    // Cleanup
    return () => {
      if (id !== null) {
        navigator.geolocation.clearWatch(id);
      }
    };
  }, [enabled, waybillId, updateInterval]);

  const requestPermission = async () => {
    try {
      const result = await navigator.permissions.query({ name: "geolocation" });
      
      if (result.state === "granted") {
        return true;
      } else if (result.state === "prompt") {
        // Will be prompted when watchPosition is called
        return true;
      } else {
        toast({
          title: "Location Permission Denied",
          description: "Please enable location access in your browser settings",
          variant: "destructive",
        });
        return false;
      }
    } catch (err) {
      console.error("Permission check error:", err);
      return false;
    }
  };

  return {
    position,
    isTracking,
    error,
    requestPermission,
  };
};
