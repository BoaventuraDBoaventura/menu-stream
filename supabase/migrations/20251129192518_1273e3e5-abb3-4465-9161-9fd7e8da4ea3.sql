-- Add permissions column to restaurant_permissions table
ALTER TABLE public.restaurant_permissions 
ADD COLUMN permissions JSONB DEFAULT '{
  "menu_editor": true,
  "qr_codes": true,
  "orders": true,
  "kitchen": true,
  "settings": false
}'::jsonb;

COMMENT ON COLUMN public.restaurant_permissions.permissions IS 'Granular permissions for restaurant modules: menu_editor, qr_codes, orders, kitchen, settings';