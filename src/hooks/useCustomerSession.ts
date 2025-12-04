import { useState, useEffect } from "react";

interface CustomerSession {
  customerName: string;
  customerPhone: string;
  restaurantId: string;
  tableToken: string;
  restaurantSlug: string;
}

const STORAGE_KEY = "customer_session";

export const useCustomerSession = () => {
  const [session, setSession] = useState<CustomerSession | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSession(JSON.parse(stored));
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const saveSession = (data: CustomerSession) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setSession(data);
  };

  const clearSession = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSession(null);
  };

  const getSession = (): CustomerSession | null => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  };

  return {
    session,
    saveSession,
    clearSession,
    getSession,
  };
};
