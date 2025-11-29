-- Add policy for restaurant owners to view team members' permissions
CREATE POLICY "Restaurant owners can view team permissions"
ON public.restaurant_permissions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.restaurants
    WHERE restaurants.id = restaurant_permissions.restaurant_id
    AND restaurants.owner_id = auth.uid()
  )
);