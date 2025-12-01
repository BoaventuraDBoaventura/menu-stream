import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

type Language = "pt" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  setActiveRestaurant: (restaurantId: string) => void;
  t: (key: string) => string;
}

const defaultContextValue: LanguageContextType = {
  language: "pt",
  setLanguage: () => {},
  setActiveRestaurant: () => {},
  t: (key: string) => key,
};

const LanguageContext = createContext<LanguageContextType>(defaultContextValue);

export const useLanguage = () => {
  return useContext(LanguageContext);
};

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>("pt");
  const [translations, setTranslations] = useState<Record<string, any>>({});
  const [activeRestaurantId, setActiveRestaurantId] = useState<string | null>(null);

  useEffect(() => {
    loadTranslations();
    loadUserLanguagePreference();
  }, []);

  useEffect(() => {
    if (activeRestaurantId) {
      loadRestaurantLanguage(activeRestaurantId);
    }
  }, [activeRestaurantId]);

  const loadTranslations = async () => {
    try {
      const pt = await import("@/locales/pt");
      const en = await import("@/locales/en");
      setTranslations({
        pt: pt.default,
        en: en.default,
      });
    } catch (error) {
      console.error("Error loading translations:", error);
    }
  };

  const loadUserLanguagePreference = async () => {
    // First check localStorage for saved preference
    const savedLang = localStorage.getItem("preferredLanguage");
    if (savedLang && (savedLang === "pt" || savedLang === "en")) {
      setLanguageState(savedLang as Language);
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user's first restaurant
      const { data: restaurants } = await supabase
        .from("restaurants")
        .select("id, settings")
        .or(`owner_id.eq.${user.id}`)
        .limit(1);

      if (restaurants && restaurants.length > 0) {
        // Set the first restaurant as active
        setActiveRestaurantId(restaurants[0].id);
        const settings = restaurants[0].settings as { language?: string } | null;
        const userLang = settings?.language as Language;
        if (userLang && (userLang === "pt" || userLang === "en")) {
          setLanguageState(userLang);
        }
      }
    } catch (error) {
      console.error("Error loading language preference:", error);
    }
  };

  const loadRestaurantLanguage = async (restaurantId: string) => {
    try {
      const { data: restaurant } = await supabase
        .from("restaurants")
        .select("settings")
        .eq("id", restaurantId)
        .single();

      if (restaurant) {
        const settings = restaurant.settings as { language?: string } | null;
        const restaurantLang = settings?.language as Language;
        if (restaurantLang && (restaurantLang === "pt" || restaurantLang === "en")) {
          setLanguageState(restaurantLang);
        }
      }
    } catch (error) {
      console.error("Error loading restaurant language:", error);
    }
  };

  const setActiveRestaurant = (restaurantId: string) => {
    setActiveRestaurantId(restaurantId);
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("preferredLanguage", lang);
  };

  const t = (key: string): string => {
    const keys = key.split(".");
    let value: any = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === "object") {
        value = value[k];
      } else {
        return key;
      }
    }
    
    return typeof value === "string" ? value : key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, setActiveRestaurant, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
