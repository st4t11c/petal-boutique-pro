import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const { t } = useLanguage();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.includes("type=recovery")) {
      // Not a recovery link
    }
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { toast.error(t("passwordsNoMatch")); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) toast.error(error.message);
    else { toast.success(t("passwordUpdated")); navigate("/"); }
    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8">
        <h1 className="text-2xl font-bold mb-6" style={{ fontFamily: "Space Grotesk" }}>{t("resetPassword")}</h1>
        <form onSubmit={handleReset} className="space-y-4">
          <input type="password" required placeholder={t("newPassword")} value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary" />
          <input type="password" required placeholder={t("confirmPassword")} value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full p-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary" />
          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl font-medium disabled:opacity-50">
            {loading ? "..." : t("updatePassword")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
