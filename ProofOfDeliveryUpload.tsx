import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Upload, Camera, X } from "lucide-react";

interface ProofOfDeliveryUploadProps {
  waybillId: string;
  onComplete: () => void;
  onCancel: () => void;
}

const ProofOfDeliveryUpload = ({ waybillId, onComplete, onCancel }: ProofOfDeliveryUploadProps) => {
  const [status, setStatus] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please select a file smaller than 5MB",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSubmit = async () => {
    if (!status) {
      toast({
        title: "Status Required",
        description: "Please select a delivery status",
        variant: "destructive",
      });
      return;
    }

    if (!waybillId) {
      toast({
        title: "Error",
        description: "Invalid waybill ID",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      let proofUrl = null;

      // Upload proof of delivery if file is selected
      if (selectedFile) {
        const fileExt = selectedFile.name.split(".").pop();
        const fileName = `${waybillId}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from("proof-of-delivery")
          .upload(fileName, selectedFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("proof-of-delivery")
          .getPublicUrl(fileName);

        proofUrl = urlData.publicUrl;
      }

      // Update waybill status
      const updates: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (proofUrl) {
        updates.proof_of_delivery_url = proofUrl;
      }

      if (status === "delivered") {
        updates.delivered_at = new Date().toISOString();
      }

      const { error: updateError } = await supabase
        .from("waybills")
        .update(updates)
        .eq("id", waybillId);

      if (updateError) throw updateError;

      // Create tracking update
      const { data: { user } } = await supabase.auth.getUser();
      const { error: trackingError } = await supabase
        .from("tracking_updates")
        .insert({
          waybill_id: waybillId,
          status,
          notes,
          created_at: new Date().toISOString(),
        });

      if (trackingError) throw trackingError;

      // Create notification for sender
      const { data: waybillData } = await supabase
        .from("waybills")
        .select("sender_id, tracking_id")
        .eq("id", waybillId)
        .single();

      if (waybillData) {
        await supabase.from("notifications").insert({
          user_id: waybillData.sender_id,
          type: "delivery_update",
          message: `Waybill #${waybillData.tracking_id} status updated to: ${status}`,
          waybill_id: waybillId,
        });
      }

      toast({
        title: "Success",
        description: "Delivery status updated successfully",
      });
      onComplete();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update delivery",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="border-2 border-primary">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Update Delivery Status</CardTitle>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="status">Delivery Status *</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger id="status" className="h-14 text-lg">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="in-transit">In Transit</SelectItem>
              <SelectItem value="out-for-delivery">Out for Delivery</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="failed">Failed Delivery</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes (Optional)</Label>
          <Textarea
            id="notes"
            placeholder="Add any additional notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="text-base"
          />
        </div>

        <div className="space-y-2">
          <Label>Proof of Delivery (Optional)</Label>
          <div className="space-y-3">
            {selectedFile ? (
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <Camera className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm flex-1">{selectedFile.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedFile(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <label htmlFor="fileUpload">
                  <div className="flex flex-col items-center gap-2 p-6 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground text-center">
                      Upload Photo
                    </span>
                  </div>
                  <input
                    id="fileUpload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
                <label htmlFor="cameraCapture">
                  <div className="flex flex-col items-center gap-2 p-6 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                    <Camera className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground text-center">
                      Take Photo
                    </span>
                  </div>
                  <input
                    id="cameraCapture"
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-4">
          <Button
            variant="outline"
            size="lg"
            onClick={onCancel}
            disabled={uploading}
          >
            Cancel
          </Button>
          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={uploading || !status}
          >
            {uploading ? "Updating..." : "Submit"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProofOfDeliveryUpload;
