import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

type Language = "pt" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>("pt");
  const [translations, setTranslations] = useState<Record<string, any>>({});

  useEffect(() => {
    loadTranslations();
    loadUserLanguagePreference();
  }, []);

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
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user's first restaurant
      const { data: restaurants } = await supabase
        .from("restaurants")
        .select("settings")
        .or(`owner_id.eq.${user.id}`)
        .limit(1);

      if (restaurants && restaurants.length > 0) {
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
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
