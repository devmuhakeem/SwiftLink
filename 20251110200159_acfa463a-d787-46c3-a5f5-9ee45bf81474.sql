-- Add driver assignment to waybills
ALTER TABLE public.waybills 
ADD COLUMN driver_id uuid REFERENCES auth.users(id),
ADD COLUMN proof_of_delivery_url text;

-- Create storage bucket for proof of delivery
INSERT INTO storage.buckets (id, name, public)
VALUES ('proof-of-delivery', 'proof-of-delivery', false);

-- Storage policies for proof of delivery
CREATE POLICY "Drivers can upload proof of delivery"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'proof-of-delivery' AND
  has_role(auth.uid(), 'driver'::app_role)
);

CREATE POLICY "Drivers can view proof of delivery"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'proof-of-delivery' AND
  (has_role(auth.uid(), 'driver'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
);

CREATE POLICY "Senders can view their waybills proof of delivery"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'proof-of-delivery' AND
  EXISTS (
    SELECT 1 FROM public.waybills w
    WHERE w.sender_id = auth.uid()
    AND name LIKE w.id::text || '%'
  )
);

-- Update waybills policies for driver assignment
CREATE POLICY "Admins can assign drivers to waybills"
ON public.waybills
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Update tracking policies to allow drivers to create updates for assigned waybills
DROP POLICY IF EXISTS "Drivers can create tracking updates" ON public.tracking_updates;

CREATE POLICY "Drivers can create tracking updates for assigned waybills"
ON public.tracking_updates
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.waybills
    WHERE waybills.id = waybill_id
    AND waybills.driver_id = auth.uid()
  ) OR has_role(auth.uid(), 'admin'::app_role)
);