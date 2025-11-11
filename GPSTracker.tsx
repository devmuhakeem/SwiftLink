import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGPSTracking } from "@/hooks/useGPSTracking";
import { MapPin, Navigation, Activity } from "lucide-react";

interface GPSTrackerProps {
  waybillId: string | null;
  onLocationUpdate?: (latitude: number, longitude: number) => void;
}

const GPSTracker = ({ waybillId, onLocationUpdate }: GPSTrackerProps) => {
  const [trackingEnabled, setTrackingEnabled] = useState(false);
  const { position, isTracking, error, requestPermission } = useGPSTracking({
    enabled: trackingEnabled,
    updateInterval: 30000, // Update every 30 seconds
    waybillId,
  });

  useEffect(() => {
    if (position && onLocationUpdate) {
      onLocationUpdate(position.latitude, position.longitude);
    }
  }, [position, onLocationUpdate]);

  const handleStartTracking = async () => {
    if (!waybillId) {
      return;
    }

    const hasPermission = await requestPermission();
    if (hasPermission) {
      setTrackingEnabled(true);
    }
  };

  const handleStopTracking = () => {
    setTrackingEnabled(false);
  };

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Navigation className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">GPS Tracking</h3>
          </div>
          {isTracking && (
            <Badge variant="default" className="flex items-center gap-1">
              <Activity className="h-3 w-3 animate-pulse" />
              Active
            </Badge>
          )}
        </div>

        {position && (
          <div className="space-y-2 mb-4 p-3 bg-background/50 rounded-lg">
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="h-4 w-4 text-primary mt-0.5" />
              <div>
                <p className="text-muted-foreground">Current Location</p>
                <p className="font-mono text-xs">
                  {position.latitude.toFixed(6)}, {position.longitude.toFixed(6)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Accuracy: ±{Math.round(position.accuracy)}m
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg mb-4">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {!waybillId && (
          <p className="text-sm text-muted-foreground mb-4">
            Select a delivery to start GPS tracking
          </p>
        )}

        <div className="flex gap-2">
          {!isTracking ? (
            <Button
              onClick={handleStartTracking}
              disabled={!waybillId}
              className="flex-1"
            >
              <Navigation className="h-4 w-4 mr-2" />
              Start Tracking
            </Button>
          ) : (
            <Button
              onClick={handleStopTracking}
              variant="outline"
              className="flex-1"
            >
              Stop Tracking
            </Button>
          )}
        </div>

        <p className="text-xs text-muted-foreground mt-3 text-center">
          Location updates every 30 seconds while tracking
        </p>
      </CardContent>
    </Card>
  );
};

export default GPSTracker;
