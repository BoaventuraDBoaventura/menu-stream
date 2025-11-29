-- Drop existing restrictive policy for insert on restaurant_permissions
DROP POLICY IF EXISTS "Super admins can manage all permissions" ON public.restaurant_permissions;

-- Create separate policies for better granularity
-- Super admins can do everything
CREATE POLICY "Super admins can manage all permissions"
ON public.restaurant_permissions
FOR ALL
TO authenticated
USING (public.is_super_admin(auth.uid()));

-- Restaurant owners can insert permissions for their restaurants
CREATE POLICY "Restaurant owners can add team members"
ON public.restaurant_permissions
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.restaurants
    WHERE restaurants.id = restaurant_permissions.restaurant_id
    AND restaurants.owner_id = auth.uid()
  )
);

-- Restaurant owners can update permissions for their restaurants
CREATE POLICY "Restaurant owners can update team permissions"
ON public.restaurant_permissions
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.restaurants
    WHERE restaurants.id = restaurant_permissions.restaurant_id
    AND restaurants.owner_id = auth.uid()
  )
);

-- Restaurant owners can delete permissions for their restaurants
CREATE POLICY "Restaurant owners can remove team members"
ON public.restaurant_permissions
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.restaurants
    WHERE restaurants.id = restaurant_permissions.restaurant_id
    AND restaurants.owner_id = auth.uid()
  )
);