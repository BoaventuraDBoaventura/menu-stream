-- Allow restaurant owners to view profiles of their team members
CREATE POLICY "Restaurant owners can view team member profiles"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 
    FROM public.restaurant_permissions rp
    JOIN public.restaurants r ON r.id = rp.restaurant_id
    WHERE rp.user_id = profiles.id
    AND r.owner_id = auth.uid()
  )
);