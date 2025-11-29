-- Allow anyone to view active restaurants by slug (for public menu access)
CREATE POLICY "Anyone can view active restaurants by slug"
ON public.restaurants
FOR SELECT
USING (is_active = true);
