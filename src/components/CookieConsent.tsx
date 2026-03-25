import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const CookieConsent = () => {
  const { t } = useLanguage();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) setTimeout(() => setShow(true), 1500);
  }, []);

  const handleConsent = (accepted: boolean) => {
    localStorage.setItem("cookieConsent", accepted ? "accepted" : "declined");
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4"
        >
          <div className="container mx-auto max-w-2xl bg-card border border-border rounded-2xl p-4 shadow-2xl flex flex-col sm:flex-row items-center gap-4">
            <Cookie className="w-8 h-8 text-primary shrink-0" />
            <div className="flex-1 text-center sm:text-left">
              <p className="font-semibold text-sm">{t("cookieTitle")}</p>
              <p className="text-xs text-muted-foreground">{t("cookieDesc")}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleConsent(false)} className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-secondary transition-colors">
                {t("decline")}
              </button>
              <button onClick={() => handleConsent(true)} className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
                {t("accept")}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;
