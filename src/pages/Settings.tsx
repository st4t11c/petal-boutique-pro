import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Navigate } from "react-router-dom";
import { User, Lock, Clock, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

const Settings = () => {
  const { user, isAdmin } = useAuth();
  const { t } = useLanguage();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState("profile");

  const [profile, setProfile] = useState({ first_name: "", last_name: "", username: "", phone: "" });
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [hours, setHours] = useState<Record<string, { open: string; close: string; is_open: boolean }>>({});
  const [contact, setContact] = useState({ contact_email: "", contact_phone: "", location: "" });

  const { data: profileData } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("user_id", user!.id).single();
      return data;
    },
    enabled: !!user,
  });

  const { data: shopSettings } = useQuery({
    queryKey: ["shop-settings"],
    queryFn: async () => {
      const { data } = await supabase.from("shop_settings").select("*").limit(1).single();
      return data;
    },
  });

  useEffect(() => {
    if (profileData) setProfile({ first_name: profileData.first_name || "", last_name: profileData.last_name || "", username: profileData.username || "", phone: profileData.phone || "" });
  }, [profileData]);

  useEffect(() => {
    if (shopSettings?.working_hours_json) setHours(shopSettings.working_hours_json as any);
    if (shopSettings) setContact({ contact_email: shopSettings.contact_email || "", contact_phone: shopSettings.contact_phone || "", location: shopSettings.location || "" });
  }, [shopSettings]);

  if (!user) return <Navigate to="/auth" />;

  const saveProfile = async () => {
    const { error } = await supabase.from("profiles").update(profile).eq("user_id", user.id);
    if (error) toast.error(error.message);
    else { toast.success(t("profileUpdated")); qc.invalidateQueries({ queryKey: ["profile"] }); }
  };

  const changePassword = async () => {
    if (passwords.new !== passwords.confirm) { toast.error(t("passwordsNoMatch")); return; }
    const { error } = await supabase.auth.updateUser({ password: passwords.new });
    if (error) toast.error(error.message);
    else { toast.success(t("passwordUpdated")); setPasswords({ current: "", new: "", confirm: "" }); }
  };

  const saveHours = async () => {
    if (!shopSettings) return;
    const { error } = await supabase.from("shop_settings").update({ working_hours_json: hours as any }).eq("id", shopSettings.id);
    if (error) toast.error(error.message);
    else { toast.success(t("hoursUpdated")); qc.invalidateQueries({ queryKey: ["shop-settings"] }); }
  };

  const saveContact = async () => {
    if (!shopSettings) return;
    const { error } = await supabase.from("shop_settings").update(contact).eq("id", shopSettings.id);
    if (error) toast.error(error.message);
    else { toast.success(t("profileUpdated")); qc.invalidateQueries({ queryKey: ["shop-settings"] }); }
  };

  const sidebarItems = [
    { id: "profile", label: t("profile"), icon: <User className="w-4 h-4" /> },
    { id: "security", label: t("security"), icon: <Lock className="w-4 h-4" /> },
    ...(isAdmin ? [
      { id: "hours", label: t("workingHours"), icon: <Clock className="w-4 h-4" /> },
      { id: "contact", label: t("contactUs"), icon: <MessageSquare className="w-4 h-4" /> },
    ] : []),
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6" style={{ fontFamily: "Space Grotesk" }}>{t("settings")}</h1>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-56 shrink-0">
          <div className="bg-card border border-border rounded-xl p-2 space-y-1">
            {sidebarItems.map((item) => (
              <button key={item.id} onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${activeTab === item.id ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}>
                {item.icon} {item.label}
              </button>
            ))}
          </div>
        </div>

        <motion.div key={activeTab} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
          className="flex-1 bg-card border border-border rounded-2xl p-6">
          {activeTab === "profile" && (
            <div className="space-y-4 max-w-md">
              <h2 className="text-lg font-semibold">{t("profile")}</h2>
              <div>
                <label className="block text-sm mb-1">{t("firstName")}</label>
                <input value={profile.first_name} onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                  className="w-full p-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm mb-1">{t("lastName")}</label>
                <input value={profile.last_name} onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                  className="w-full p-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm mb-1">{t("username")}</label>
                <input value={profile.username} onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                  className="w-full p-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm mb-1">{t("phone")}</label>
                <input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full p-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary" />
              </div>
              <button onClick={saveProfile} className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium">{t("save")}</button>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-4 max-w-md">
              <h2 className="text-lg font-semibold">{t("security")}</h2>
              <div>
                <label className="block text-sm mb-1">{t("currentPassword")}</label>
                <input type="password" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                  className="w-full p-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm mb-1">{t("newPassword")}</label>
                <input type="password" value={passwords.new} onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                  className="w-full p-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm mb-1">{t("confirmPassword")}</label>
                <input type="password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                  className="w-full p-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary" />
              </div>
              <button onClick={changePassword} className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium">{t("save")}</button>
            </div>
          )}

          {activeTab === "hours" && isAdmin && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">{t("workingHours")}</h2>
              {days.map((day) => (
                <div key={day} className="flex items-center gap-4 flex-wrap">
                  <label className="flex items-center gap-2 w-28">
                    <input type="checkbox" checked={hours[day]?.is_open ?? false}
                      onChange={(e) => setHours({ ...hours, [day]: { ...hours[day], is_open: e.target.checked } })} />
                    <span className="text-sm capitalize">{t(day)}</span>
                  </label>
                  <input type="time" value={hours[day]?.open || "09:00"} onChange={(e) => setHours({ ...hours, [day]: { ...hours[day], open: e.target.value } })}
                    className="p-2 bg-background border border-border rounded-lg text-sm" disabled={!hours[day]?.is_open} />
                  <span className="text-muted-foreground">—</span>
                  <input type="time" value={hours[day]?.close || "17:00"} onChange={(e) => setHours({ ...hours, [day]: { ...hours[day], close: e.target.value } })}
                    className="p-2 bg-background border border-border rounded-lg text-sm" disabled={!hours[day]?.is_open} />
                </div>
              ))}
              <button onClick={saveHours} className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium">{t("save")}</button>
            </div>
          )}

          {activeTab === "contact" && isAdmin && (
            <div className="space-y-4 max-w-md">
              <h2 className="text-lg font-semibold">{t("contactUs")}</h2>
              <div>
                <label className="block text-sm mb-1">{t("email")}</label>
                <input value={contact.contact_email} onChange={(e) => setContact({ ...contact, contact_email: e.target.value })}
                  className="w-full p-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm mb-1">{t("phone")}</label>
                <input value={contact.contact_phone} onChange={(e) => setContact({ ...contact, contact_phone: e.target.value })}
                  className="w-full p-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm mb-1">{t("address")}</label>
                <input value={contact.location} onChange={(e) => setContact({ ...contact, location: e.target.value })}
                  className="w-full p-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary" />
              </div>
              <button onClick={saveContact} className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium">{t("save")}</button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
