-- Enable full replica identity for orders table to capture all column changes
ALTER TABLE public.orders REPLICA IDENTITY FULL;