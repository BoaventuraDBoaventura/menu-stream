-- Create payment_methods table
CREATE TABLE public.payment_methods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

-- Anyone can view enabled payment methods for active restaurants
CREATE POLICY "Anyone can view enabled payment methods"
ON public.payment_methods
FOR SELECT
USING (
  is_enabled = true 
  AND EXISTS (
    SELECT 1 FROM public.restaurants r 
    WHERE r.id = payment_methods.restaurant_id 
    AND r.is_active = true
  )
);

-- Restaurant staff with permission can manage payment methods
CREATE POLICY "Restaurant staff with permission can manage payment methods"
ON public.payment_methods
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.restaurants r
    WHERE r.id = payment_methods.restaurant_id
    AND (
      r.owner_id = auth.uid()
      OR has_restaurant_permission(auth.uid(), r.id)
      OR is_super_admin(auth.uid())
    )
  )
);

-- Create index for performance
CREATE INDEX idx_payment_methods_restaurant_id ON public.payment_methods(restaurant_id);

-- Insert default payment methods for existing restaurants
INSERT INTO public.payment_methods (restaurant_id, name, is_enabled, position)
SELECT 
  id,
  unnest(ARRAY['Dinheiro', 'Cartão de Crédito', 'Cartão de Débito', 'PIX']),
  true,
  generate_series(0, 3)
FROM public.restaurants;