-- Create platform settings table
CREATE TABLE IF NOT EXISTS public.platform_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform_name TEXT NOT NULL DEFAULT 'PratoDigital',
  support_email TEXT DEFAULT 'suporte@pratodigital.com',
  enable_registration BOOLEAN DEFAULT true,
  require_email_verification BOOLEAN DEFAULT false,
  maintenance_mode BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read platform settings
CREATE POLICY "Anyone can view platform settings"
  ON public.platform_settings
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Only super admins can update platform settings
CREATE POLICY "Super admins can update platform settings"
  ON public.platform_settings
  FOR UPDATE
  TO authenticated
  USING (public.is_super_admin(auth.uid()));

-- Policy: Only super admins can insert platform settings
CREATE POLICY "Super admins can insert platform settings"
  ON public.platform_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_super_admin(auth.uid()));

-- Insert default settings (only one row should exist)
INSERT INTO public.platform_settings (platform_name, support_email)
VALUES ('PratoDigital', 'suporte@pratodigital.com')
ON CONFLICT DO NOTHING;

-- Create trigger for updated_at
CREATE TRIGGER update_platform_settings_updated_at
  BEFORE UPDATE ON public.platform_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();