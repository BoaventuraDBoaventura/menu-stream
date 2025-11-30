-- Add max_restaurants column to user_roles table
ALTER TABLE public.user_roles
ADD COLUMN max_restaurants INTEGER DEFAULT NULL;

-- NULL means unlimited, 0 means no restaurants allowed
COMMENT ON COLUMN public.user_roles.max_restaurants IS 'Maximum number of restaurants this user can create. NULL = unlimited';