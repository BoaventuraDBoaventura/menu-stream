-- Drop the previous policy that doesn't work for the use case
DROP POLICY IF EXISTS "Restaurant owners can view team member profiles" ON public.profiles;

-- Allow restaurant admins and owners to view all profiles (needed for team management)
CREATE POLICY "Restaurant admins can view all profiles"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('restaurant_admin', 'super_admin')
  )
);