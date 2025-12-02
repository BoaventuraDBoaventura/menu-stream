import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface PlatformSettings {
  id: string;
  platform_name: string;
  support_email: string;
  enable_registration: boolean;
  require_email_verification: boolean;
  maintenance_mode: boolean;
}

export const usePlatformSettings = () => {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();

    // Subscribe to changes in platform settings
    const channel = supabase
      .channel('platform_settings_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'platform_settings'
        },
        () => {
          fetchSettings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("platform_settings")
        .select("*")
        .single();

      if (error) {
        console.error("Error fetching platform settings:", error);
        // Use default values if fetch fails
        setSettings({
          id: "",
          platform_name: "PratoDigital",
          support_email: "suporte@pratodigital.com",
          enable_registration: true,
          require_email_verification: false,
          maintenance_mode: false,
        });
      } else {
        setSettings(data);
      }
    } catch (error) {
      console.error("Error fetching platform settings:", error);
      setSettings({
        id: "",
        platform_name: "PratoDigital",
        support_email: "suporte@pratodigital.com",
        enable_registration: true,
        require_email_verification: false,
        maintenance_mode: false,
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<Omit<PlatformSettings, 'id'>>) => {
    if (!settings?.id) return { error: "No settings to update" };

    const { error } = await supabase
      .from("platform_settings")
      .update(updates)
      .eq("id", settings.id);

    if (!error) {
      await fetchSettings();
    }

    return { error };
  };

  return {
    settings,
    loading,
    updateSettings,
    platformName: settings?.platform_name || "PratoDigital",
  };
};
