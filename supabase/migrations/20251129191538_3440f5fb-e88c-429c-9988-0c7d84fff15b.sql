-- Remove the problematic policy that allows all authenticated users to view active restaurants
DROP POLICY IF EXISTS "Anyone can view active restaurants by slug" ON public.restaurants;