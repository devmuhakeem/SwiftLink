import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Package, MapPin, User, Phone, CheckCircle, Star, Search } from "lucide-react";

interface Waybill {
  id: string;
  tracking_id: string;
  status: string;
  sender_name: string;
  sender_phone: string;
  receiver_name: string;
  receiver_phone: string;
  receiver_address: string;
  package_details: string;
  estimated_delivery: string;
  delivered_at: string | null;
  created_at: string;
}

interface TrackingUpdate {
  id: string;
  status: string;
  location: string;
  notes: string;
  created_at: string;
}

const ReceiverTracking = () => {
  const { trackingId: urlTrackingId } = useParams();
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState(urlTrackingId || "");
  const [waybill, setWaybill] = useState<Waybill | null>(null);
  const [trackingUpdates, setTrackingUpdates] = useState<TrackingUpdate[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [confirming, setConfirming] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (urlTrackingId) {
      setSearchInput(urlTrackingId);
      fetchTrackingData(urlTrackingId);
    }
  }, [urlTrackingId]);

  const fetchTrackingData = async (trackingId: string) => {
    if (!trackingId.trim()) {
      toast({
        title: "Tracking ID Required",
        description: "Please enter a tracking ID",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setSearched(true);
    setWaybill(null);
    setTrackingUpdates([]);

    try {
      const { data: waybillData, error: waybillError } = await supabase
        .from("waybills")
        .select("*")
        .eq("tracking_id", trackingId.trim())
        .maybeSingle();

      if (waybillError) throw waybillError;

      if (!waybillData) {
        toast({
          title: "Not Found",
          description: "No parcel found with this tracking ID",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      setWaybill(waybillData);

      const { data: updatesData, error: updatesError } = await supabase
        .from("tracking_updates")
        .select("*")
        .eq("waybill_id", waybillData.id)
        .order("created_at", { ascending: false });

      if (updatesError) throw updatesError;

      setTrackingUpdates(updatesData || []);

      // Update URL with tracking ID
      navigate(`/track/${trackingId.trim()}`, { replace: true });
    } catch (error) {
      console.error("Error fetching tracking data:", error);
      toast({
        title: "Error",
        description: "Unable to load tracking information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTrackingData(searchInput);
  };

  const handleConfirmDelivery = async () => {
    if (!waybill) return;

    setConfirming(true);
    try {
      const { error } = await supabase
        .from("waybills")
        .update({
          status: "delivered",
          delivered_at: new Date().toISOString(),
        })
        .eq("id", waybill.id);

      if (error) throw error;

      toast({
        title: "Delivery Confirmed",
        description: "Thank you for confirming receipt!",
      });

      if (waybill.tracking_id) {
        fetchTrackingData(waybill.tracking_id);
      }
    } catch (error) {
      console.error("Error confirming delivery:", error);
      toast({
        title: "Error",
        description: "Unable to confirm delivery",
        variant: "destructive",
      });
    } finally {
      setConfirming(false);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!waybill || rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a rating before submitting",
        variant: "destructive",
      });
      return;
    }

    try {
      // Store feedback in tracking_updates as a note
      const { error } = await supabase.from("tracking_updates").insert({
        waybill_id: waybill.id,
        status: "feedback",
        notes: `Rating: ${rating}/5 - ${feedback}`,
      });

      if (error) throw error;

      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback!",
      });

      setRating(0);
      setFeedback("");
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        title: "Error",
        description: "Unable to submit feedback",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "outline",
      "in-transit": "default",
      delivered: "secondary",
      cancelled: "destructive",
    };

    return (
      <Badge variant={variants[status] || "outline"}>
        {status.replace("-", " ").toUpperCase()}
      </Badge>
    );
  };


  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">SwiftLink Tracking</h1>
          <p className="text-muted-foreground">Track your delivery in real-time</p>

          {/* Search Form */}
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleSearch} className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Enter your tracking ID"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" disabled={loading}>
                  <Search className="mr-2 h-4 w-4" />
                  {loading ? "Searching..." : "Track"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Show message if searched but no waybill found */}
        {searched && !waybill && !loading && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                No parcel found. Please check your tracking ID and try again.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Show waybill details only if found */}
        {waybill && (
          <>

        {/* Tracking Status Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                {waybill.tracking_id}
              </CardTitle>
              {getStatusBadge(waybill.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Sender
                </h3>
                <p className="text-sm">{waybill.sender_name}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {waybill.sender_phone}
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Receiver
                </h3>
                <p className="text-sm">{waybill.receiver_name}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {waybill.receiver_phone}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Delivery Address
              </h3>
              <p className="text-sm">{waybill.receiver_address}</p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Package className="h-4 w-4" />
                Package Details
              </h3>
              <p className="text-sm">{waybill.package_details}</p>
            </div>

            {waybill.estimated_delivery && (
              <div className="space-y-2">
                <h3 className="font-semibold">Expected Delivery</h3>
                <p className="text-sm">
                  {new Date(waybill.estimated_delivery).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            )}

            {waybill.status === "in-transit" && (
              <Button
                onClick={handleConfirmDelivery}
                disabled={confirming}
                className="w-full"
                size="lg"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                {confirming ? "Confirming..." : "Confirm Delivery"}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Tracking History */}
        <Card>
          <CardHeader>
            <CardTitle>Tracking History</CardTitle>
          </CardHeader>
          <CardContent>
            {trackingUpdates.length > 0 ? (
              <div className="space-y-4">
                {trackingUpdates.map((update) => (
                  <div key={update.id} className="flex gap-4 pb-4 border-b last:border-b-0">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <MapPin className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="font-semibold">
                        {update.status.replace("-", " ").toUpperCase()}
                      </p>
                      {update.location && (
                        <p className="text-sm text-muted-foreground">{update.location}</p>
                      )}
                      {update.notes && (
                        <p className="text-sm text-muted-foreground">{update.notes}</p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {new Date(update.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">
                No tracking updates yet
              </p>
            )}
          </CardContent>
        </Card>

        {/* Feedback Section */}
        {waybill.status === "delivered" && (
          <Card>
            <CardHeader>
              <CardTitle>Rate Your Experience</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="transition-colors"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground"
                      }`}
                    />
                  </button>
                ))}
              </div>

              <Textarea
                placeholder="Share your feedback (optional)"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={4}
              />

              <Button onClick={handleSubmitFeedback} className="w-full" size="lg">
                Submit Feedback
              </Button>
            </CardContent>
          </Card>
        )}
        </>
        )}
      </div>
    </div>
  );
};

export default ReceiverTracking;
