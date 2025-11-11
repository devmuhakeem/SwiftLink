-- Update waybills RLS policies to ensure admins can do everything
-- Drop existing admin policies if they exist
DROP POLICY IF EXISTS "Admins can view all waybills" ON public.waybills;
DROP POLICY IF EXISTS "Admins can assign drivers to waybills" ON public.waybills;
DROP POLICY IF EXISTS "Admins can update all waybills" ON public.waybills;

-- Create comprehensive admin policies
CREATE POLICY "Admins can view all waybills"
ON public.waybills
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update all waybills"
ON public.waybills
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert waybills"
ON public.waybills
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Update tracking_updates policies for admins
CREATE POLICY "Admins can view all tracking updates"
ON public.tracking_updates
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert tracking updates"
ON public.tracking_updates
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));