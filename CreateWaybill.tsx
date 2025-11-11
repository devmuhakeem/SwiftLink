import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { QRCodeSVG } from "qrcode.react";
import { nanoid } from "nanoid";
import { Download } from "lucide-react";

interface CreateWaybillProps {
  onSuccess: () => void;
}

const CreateWaybill = ({ onSuccess }: CreateWaybillProps) => {
  const [loading, setLoading] = useState(false);
  const [generatedWaybill, setGeneratedWaybill] = useState<any>(null);
  const [formData, setFormData] = useState({
    senderName: "",
    senderPhone: "",
    senderAddress: "",
    receiverName: "",
    receiverPhone: "",
    receiverAddress: "",
    packageDetails: "",
    packageWeight: "",
    deliveryType: "standard",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const trackingId = `SW-${nanoid(10).toUpperCase()}`;
      const qrCodeData = JSON.stringify({ trackingId });

      const { data, error } = await supabase
        .from("waybills")
        .insert({
          tracking_id: trackingId,
          sender_id: user.id,
          sender_name: formData.senderName,
          sender_phone: formData.senderPhone,
          sender_address: formData.senderAddress,
          receiver_name: formData.receiverName,
          receiver_phone: formData.receiverPhone,
          receiver_address: formData.receiverAddress,
          package_details: formData.packageDetails,
          package_weight: formData.packageWeight,
          delivery_type: formData.deliveryType,
          qr_code: qrCodeData,
        })
        .select()
        .single();

      if (error) throw error;

      // Create initial tracking update
      await supabase.from("tracking_updates").insert({
        waybill_id: data.id,
        status: "pending",
        location: formData.senderAddress,
        notes: "Waybill created",
      });

      // Create notification
      await supabase.from("notifications").insert({
        user_id: user.id,
        waybill_id: data.id,
        message: `Waybill ${trackingId} created successfully`,
        type: "success",
      });

      setGeneratedWaybill(data);
      toast({
        title: "Waybill created successfully!",
        description: `Tracking ID: ${trackingId}`,
      });
    } catch (error: any) {
      toast({
        title: "Error creating waybill",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = () => {
    const svg = document.getElementById("qr-code");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `waybill-${generatedWaybill.tracking_id}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  if (generatedWaybill) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Waybill Generated Successfully!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className="inline-block p-4 bg-white rounded-lg">
                <QRCodeSVG
                  id="qr-code"
                  value={generatedWaybill.qr_code}
                  size={200}
                  level="H"
                />
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">Tracking ID:</p>
                <p className="text-2xl font-bold text-primary">{generatedWaybill.tracking_id}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold text-muted-foreground">From:</p>
                <p className="text-foreground">{generatedWaybill.sender_name}</p>
                <p className="text-muted-foreground">{generatedWaybill.sender_phone}</p>
              </div>
              <div>
                <p className="font-semibold text-muted-foreground">To:</p>
                <p className="text-foreground">{generatedWaybill.receiver_name}</p>
                <p className="text-muted-foreground">{generatedWaybill.receiver_phone}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <Button onClick={downloadQR} className="flex-1 gap-2">
                <Download className="h-4 w-4" />
                Download QR Code
              </Button>
              <Button onClick={onSuccess} variant="outline" className="flex-1">
                View All Deliveries
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Create New Waybill</h1>
        <p className="text-muted-foreground mt-1">Fill in the details to generate a digital waybill</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Sender Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="senderName">Full Name</Label>
                <Input
                  id="senderName"
                  required
                  value={formData.senderName}
                  onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="senderPhone">Phone Number</Label>
                <Input
                  id="senderPhone"
                  type="tel"
                  required
                  value={formData.senderPhone}
                  onChange={(e) => setFormData({ ...formData, senderPhone: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="senderAddress">Pickup Address</Label>
              <Textarea
                id="senderAddress"
                required
                value={formData.senderAddress}
                onChange={(e) => setFormData({ ...formData, senderAddress: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Receiver Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="receiverName">Full Name</Label>
                <Input
                  id="receiverName"
                  required
                  value={formData.receiverName}
                  onChange={(e) => setFormData({ ...formData, receiverName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="receiverPhone">Phone Number</Label>
                <Input
                  id="receiverPhone"
                  type="tel"
                  required
                  value={formData.receiverPhone}
                  onChange={(e) => setFormData({ ...formData, receiverPhone: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="receiverAddress">Delivery Address</Label>
              <Textarea
                id="receiverAddress"
                required
                value={formData.receiverAddress}
                onChange={(e) => setFormData({ ...formData, receiverAddress: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Package Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="packageDetails">Package Description</Label>
              <Textarea
                id="packageDetails"
                required
                placeholder="e.g., Electronics, Documents, Clothing"
                value={formData.packageDetails}
                onChange={(e) => setFormData({ ...formData, packageDetails: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="packageWeight">Weight (kg)</Label>
                <Input
                  id="packageWeight"
                  type="text"
                  placeholder="e.g., 2.5"
                  value={formData.packageWeight}
                  onChange={(e) => setFormData({ ...formData, packageWeight: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deliveryType">Delivery Type</Label>
                <select
                  id="deliveryType"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={formData.deliveryType}
                  onChange={(e) => setFormData({ ...formData, deliveryType: e.target.value })}
                >
                  <option value="standard">Standard</option>
                  <option value="express">Express</option>
                  <option value="same-day">Same Day</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? "Creating..." : "Generate Waybill"}
        </Button>
      </form>
    </div>
  );
};

export default CreateWaybill;
