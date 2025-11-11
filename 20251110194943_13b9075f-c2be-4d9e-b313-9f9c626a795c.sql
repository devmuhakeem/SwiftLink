-- Create waybills table
CREATE TABLE public.waybills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_id TEXT UNIQUE NOT NULL,
  sender_id UUID NOT NULL,
  sender_name TEXT NOT NULL,
  sender_phone TEXT NOT NULL,
  sender_address TEXT NOT NULL,
  receiver_name TEXT NOT NULL,
  receiver_phone TEXT NOT NULL,
  receiver_address TEXT NOT NULL,
  package_details TEXT NOT NULL,
  package_weight TEXT,
  delivery_type TEXT DEFAULT 'standard',
  status TEXT DEFAULT 'pending',
  qr_code TEXT,
  estimated_delivery TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tracking_updates table
CREATE TABLE public.tracking_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  waybill_id UUID REFERENCES public.waybills(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL,
  location TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  waybill_id UUID REFERENCES public.waybills(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.waybills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Waybills policies
CREATE POLICY "Senders can view their own waybills"
ON public.waybills FOR SELECT
USING (auth.uid() = sender_id);

CREATE POLICY "Senders can create waybills"
ON public.waybills FOR INSERT
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Drivers can view assigned waybills"
ON public.waybills FOR SELECT
USING (has_role(auth.uid(), 'driver'::app_role));

CREATE POLICY "Drivers can update waybills"
ON public.waybills FOR UPDATE
USING (has_role(auth.uid(), 'driver'::app_role));

CREATE POLICY "Admins can view all waybills"
ON public.waybills FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Tracking updates policies
CREATE POLICY "Users can view tracking for their waybills"
ON public.tracking_updates FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.waybills
    WHERE waybills.id = tracking_updates.waybill_id
    AND waybills.sender_id = auth.uid()
  )
  OR has_role(auth.uid(), 'driver'::app_role)
  OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Drivers can create tracking updates"
ON public.tracking_updates FOR INSERT
WITH CHECK (has_role(auth.uid(), 'driver'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Notifications policies
CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
ON public.notifications FOR INSERT
WITH CHECK (true);

-- Add trigger for updated_at
CREATE TRIGGER update_waybills_updated_at
BEFORE UPDATE ON public.waybills
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.waybills;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tracking_updates;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;