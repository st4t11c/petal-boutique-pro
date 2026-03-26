import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { lovable } from "@/integrations/lovable/index";

const Auth = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", firstName: "", lastName: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            data: { first_name: form.firstName, last_name: form.lastName },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast.success(t("checkEmailVerify"));
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });
        if (error) throw error;
        toast.success(t("welcomeBack"));
        navigate("/");
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!form.email) { toast.error(t("enterEmailFirst")); return; }
    const { error } = await supabase.auth.resetPasswordForEmail(form.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) toast.error(error.message);
    else toast.success(t("resetEmailSent"));
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-card border border-border rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-center mb-6" style={{ fontFamily: "Space Grotesk" }}>
          {isSignUp ? t("signUp") : t("signIn")}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input placeholder={t("firstName")} value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary" />
              </div>
              <div>
                <input placeholder={t("lastName")} value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary" />
              </div>
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="email" required placeholder={t("email")} value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary" />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type={showPw ? "text" : "password"} required placeholder={t("password")} value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full pl-10 pr-10 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary" />
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2">
              {showPw ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
            </button>
          </div>

          {!isSignUp && (
            <button type="button" onClick={handleForgotPassword} className="text-xs text-primary hover:underline">
              {t("forgotPassword")}
            </button>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
            {loading ? "..." : isSignUp ? t("signUp") : t("signIn")}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
          <div className="relative flex justify-center"><span className="bg-card px-3 text-xs text-muted-foreground">{t("orContinueWith")}</span></div>
        </div>

        <div className="flex gap-3">
          <button onClick={async () => { const { error } = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin }); if (error) toast.error(String(error)); }}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-border rounded-xl hover:bg-secondary transition-colors text-sm">
            <span className="font-bold text-lg">G</span> Google
          </button>
          <button onClick={async () => { const { error } = await lovable.auth.signInWithOAuth("apple", { redirect_uri: window.location.origin }); if (error) toast.error(String(error)); }}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-border rounded-xl hover:bg-secondary transition-colors text-sm">
            <span className="font-bold text-lg">🍎</span> Apple
          </button>
        </div>

        <div className="mt-4 text-center">
          <button onClick={() => setIsSignUp(!isSignUp)} className="text-sm text-muted-foreground hover:text-foreground">
            {isSignUp ? t("haveAccount") : t("noAccount")} <span className="text-primary font-medium">{isSignUp ? t("signIn") : t("signUp")}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
