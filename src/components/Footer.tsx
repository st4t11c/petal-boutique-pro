import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { MapPin, Mail, Phone } from "lucide-react";

const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

const Footer = () => {
  const { t } = useLanguage();
  const { data: settings } = useQuery({
    queryKey: ["shop-settings"],
    queryFn: async () => {
      const { data } = await supabase.from("shop_settings").select("*").limit(1).single();
      return data;
    },
  });

  const isCurrentlyOpen = () => {
    if (!settings?.working_hours_json) return false;
    const hours = settings.working_hours_json as Record<string, { open: string; close: string; is_open: boolean }>;
    const now = new Date();
    const dayName = days[now.getDay() === 0 ? 6 : now.getDay() - 1];
    const dayHours = hours[dayName];
    if (!dayHours?.is_open) return false;
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    return currentTime >= dayHours.open && currentTime <= dayHours.close;
  };

  const open = isCurrentlyOpen();

  return (
    <footer className="border-t border-border bg-card/50 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-3" style={{ fontFamily: "Space Grotesk" }}>
              <span className="text-primary">THE</span> SHOP
            </h3>
            <p className="text-sm text-muted-foreground">{settings?.description || "Premium curated products"}</p>
            <div className="mt-3 flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${open ? "bg-green-500" : "bg-red-500"}`} />
              <span className={`text-sm font-medium ${open ? "text-green-500" : "text-red-500"}`}>
                {open ? t("opened") : t("closed")}
              </span>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-sm">{t("workingHours")}</h4>
            {settings?.working_hours_json && (
              <div className="space-y-1">
                {days.map((day) => {
                  const h = (settings.working_hours_json as Record<string, any>)[day];
                  return (
                    <div key={day} className="flex justify-between text-xs text-muted-foreground">
                      <span className="capitalize">{t(day)}</span>
                      <span>{h?.is_open ? `${h.open} - ${h.close}` : t("closed")}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-sm">{t("connectedAccounts")}</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              {settings?.location && (
                <div className="flex items-center gap-2"><MapPin className="w-4 h-4" />{settings.location}</div>
              )}
              {settings?.contact_email && (
                <div className="flex items-center gap-2"><Mail className="w-4 h-4" />{settings.contact_email}</div>
              )}
              {settings?.contact_phone && (
                <div className="flex items-center gap-2"><Phone className="w-4 h-4" />{settings.contact_phone}</div>
              )}
            </div>
          </div>
        </div>
        <div className="border-t border-border mt-6 pt-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} THE SHOP. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
