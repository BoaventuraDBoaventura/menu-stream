
-- Garantir que projeto@hostdomain.cloud seja super_admin
UPDATE user_roles
SET role = 'super_admin'
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'projeto@hostdomain.cloud'
);
