-- Enable realtime for profiles table
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;

-- Enable realtime for restaurants table
ALTER TABLE public.restaurants REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.restaurants;