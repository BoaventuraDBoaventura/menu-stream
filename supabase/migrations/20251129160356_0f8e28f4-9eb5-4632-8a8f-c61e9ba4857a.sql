-- Grant SELECT permissions on auth.users to authenticated users with super_admin role
-- This allows the admin panel to fetch user emails

-- Create a security definer function to list users for super admins
CREATE OR REPLACE FUNCTION public.get_all_users_for_admin()
RETURNS TABLE (
  id UUID,
  email TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  -- Only allow super admins to call this function
  IF NOT public.is_super_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Super admin role required';
  END IF;

  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.created_at
  FROM auth.users u
  ORDER BY u.created_at DESC;
END;
$$;