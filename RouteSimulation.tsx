import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation } from "lucide-react";

const RouteSimulation = () => {
  const [currentLocation, setCurrentLocation] = useState({
    lat: 6.5244,
    lng: 3.3792,
    address: "Victoria Island, Lagos",
  });

  useEffect(() => {
    // Simulate location updates every 10 seconds
    const interval = setInterval(() => {
      setCurrentLocation((prev) => ({
        ...prev,
        lat: prev.lat + (Math.random() - 0.5) * 0.001,
        lng: prev.lng + (Math.random() - 0.5) * 0.001,
      }));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            Current Location
          </CardTitle>
          <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500">
            Active
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center relative overflow-hidden">
          {/* Simple map placeholder */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-green-100" />
          <div className="relative z-10 text-center space-y-2">
            <MapPin className="h-12 w-12 mx-auto text-primary animate-pulse" />
            <div className="space-y-1">
              <p className="font-semibold">{currentLocation.address}</p>
              <p className="text-sm text-muted-foreground">
                {currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}
              </p>
            </div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground text-center">
          Route simulation active • Location updates every 10s
        </p>
      </CardContent>
    </Card>
  );
};

export default RouteSimulation;
