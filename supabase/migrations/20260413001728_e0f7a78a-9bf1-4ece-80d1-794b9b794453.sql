
-- 1. Fix orders SELECT policy: restrict to owners/staff
DROP POLICY IF EXISTS "View orders" ON public.orders;

CREATE POLICY "View orders"
ON public.orders
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM restaurants r
    WHERE r.id = orders.restaurant_id
    AND (
      r.owner_id = auth.uid()
      OR has_restaurant_permission(auth.uid(), r.id)
      OR is_super_admin(auth.uid())
    )
  )
);

-- 2. Create RPC for unauthenticated customer order lookup
CREATE OR REPLACE FUNCTION public.get_customer_orders(
  _restaurant_id uuid,
  _customer_name text
)
RETURNS SETOF orders
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT *
  FROM public.orders
  WHERE restaurant_id = _restaurant_id
    AND customer_name = _customer_name
    AND created_at >= (CURRENT_DATE)::timestamptz
  ORDER BY created_at DESC;
$$;

-- 3. Fix menu-items storage UPDATE policy
DROP POLICY IF EXISTS "Authenticated users can update menu item images" ON storage.objects;
DROP POLICY IF EXISTS "menu_items_update" ON storage.objects;

CREATE POLICY "menu_items_update_owner"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'menu-items'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM restaurants WHERE owner_id = auth.uid()
  )
);

-- 4. Fix menu-items storage DELETE policy
DROP POLICY IF EXISTS "Authenticated users can delete menu item images" ON storage.objects;
DROP POLICY IF EXISTS "menu_items_delete" ON storage.objects;

CREATE POLICY "menu_items_delete_owner"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'menu-items'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM restaurants WHERE owner_id = auth.uid()
  )
);
