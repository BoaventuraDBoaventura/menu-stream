import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type UserRole = "super_admin" | "restaurant_admin" | "staff" | null;

export const useUserRole = (userId?: string) => {
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchRole = async () => {
      try {
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userId)
          .single();

        if (error) {
          console.error("Error fetching user role:", error);
          setRole(null);
        } else {
          setRole(data?.role as UserRole);
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
        setRole(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, [userId]);

  return { role, loading, isSuperAdmin: role === "super_admin" };
};
