-- Add user deletion tracking to listings table
ALTER TABLE public.listings 
ADD COLUMN deleted_by_user boolean DEFAULT false,
ADD COLUMN deleted_at timestamp with time zone,
ADD COLUMN deletion_reason text;

-- Create index for better performance when filtering deleted listings
CREATE INDEX idx_listings_deleted_by_user ON public.listings(deleted_by_user);

-- Update view policies to exclude user-deleted listings from normal views
DROP POLICY IF EXISTS "Users can view listings from their business" ON public.listings;

CREATE POLICY "Users can view listings from their business" ON public.listings
FOR SELECT USING (
  (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'backoffice'::app_role)) OR 
  (auth.uid() = user_id) OR 
  (
    deleted_by_user = false AND 
    status = 'published' AND 
    NOT disabled_by_admin AND
    (( SELECT profiles.business_id FROM profiles WHERE (profiles.user_id = auth.uid())) = ( SELECT profiles.business_id FROM profiles WHERE (profiles.user_id = listings.user_id)))
  )
);