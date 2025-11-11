-- Allow public read access to waybills by tracking_id
CREATE POLICY "Public can view waybills by tracking_id"
ON public.waybills
FOR SELECT
USING (tracking_id IS NOT NULL);

-- Allow public read access to tracking updates for public waybills
CREATE POLICY "Public can view tracking updates by tracking_id"
ON public.tracking_updates
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.waybills
    WHERE waybills.id = tracking_updates.waybill_id
    AND waybills.tracking_id IS NOT NULL
  )
);

-- Allow public to confirm delivery (update status to delivered)
CREATE POLICY "Public can confirm delivery"
ON public.waybills
FOR UPDATE
USING (tracking_id IS NOT NULL AND status = 'in-transit')
WITH CHECK (status = 'delivered');

-- Allow public to submit feedback via tracking_updates
CREATE POLICY "Public can submit feedback"
ON public.tracking_updates
FOR INSERT
WITH CHECK (
  status = 'feedback' AND
  EXISTS (
    SELECT 1 FROM public.waybills
    WHERE waybills.id = tracking_updates.waybill_id
    AND waybills.tracking_id IS NOT NULL
  )
);