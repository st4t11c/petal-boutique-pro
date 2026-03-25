import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Navigate } from "react-router-dom";
import { Shield, Edit2, Trash2, X } from "lucide-react";
import { toast } from "sonner";

const UserManagement = () => {
  const { user, isAdmin } = useAuth();
  const { t } = useLanguage();
  const qc = useQueryClient();
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editForm, setEditForm] = useState({ first_name: "", last_name: "", username: "", role: "user" as "admin" | "user" });

  if (!user || !isAdmin) return <Navigate to="/" />;

  const { data: profiles = [] } = useQuery({
    queryKey: ["all-profiles"],
    queryFn: async () => {
      const { data: profs } = await supabase.from("profiles").select("*");
      const { data: roles } = await supabase.from("user_roles").select("*");
      return (profs || []).map((p) => ({
        ...p,
        role: roles?.find((r) => r.user_id === p.user_id)?.role || "user",
        role_id: roles?.find((r) => r.user_id === p.user_id)?.id,
      }));
    },
  });

  const startEdit = (p: any) => {
    setEditingUser(p);
    setEditForm({ first_name: p.first_name || "", last_name: p.last_name || "", username: p.username || "", role: p.role || "user" });
  };

  const saveUser = async () => {
    if (!editingUser) return;
    try {
      await supabase.from("profiles").update({
        first_name: editForm.first_name,
        last_name: editForm.last_name,
        username: editForm.username,
      }).eq("user_id", editingUser.user_id);

      if (editForm.role !== editingUser.role) {
        if (editingUser.role_id) {
          await supabase.from("user_roles").update({ role: editForm.role }).eq("id", editingUser.role_id);
        } else {
          await supabase.from("user_roles").insert({ user_id: editingUser.user_id, role: editForm.role });
        }
      }

      qc.invalidateQueries({ queryKey: ["all-profiles"] });
      toast.success("User updated!");
      setEditingUser(null);
    } catch (err: any) { toast.error(err.message); }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    await supabase.from("profiles").delete().eq("user_id", userId);
    await supabase.from("user_roles").delete().eq("user_id", userId);
    qc.invalidateQueries({ queryKey: ["all-profiles"] });
    toast.success("User removed!");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6" style={{ fontFamily: "Space Grotesk" }}>{t("userManagement")}</h1>

      <div className="space-y-3">
        {profiles.map((p, i) => (
          <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            onClick={() => startEdit(p)}
            className="bg-card border border-border rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:border-primary/50 transition-colors">
            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{p.first_name || p.username || "Unnamed"} {p.last_name || ""}</p>
              <p className={`text-xs ${p.role === "admin" ? "text-primary" : "text-muted-foreground"}`}>{p.role}</p>
            </div>
            <button onClick={(e) => { e.stopPropagation(); startEdit(p); }} className="p-2 hover:bg-secondary rounded-lg"><Edit2 className="w-4 h-4" /></button>
            <button onClick={(e) => { e.stopPropagation(); deleteUser(p.user_id); }} className="p-2 hover:bg-destructive/10 rounded-lg text-destructive"><Trash2 className="w-4 h-4" /></button>
          </motion.div>
        ))}
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingUser && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setEditingUser(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-card border border-border rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">{t("edit")} {t("user")}</h2>
                <button onClick={() => setEditingUser(null)} className="p-1 hover:bg-secondary rounded-lg"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm mb-1">{t("firstName")}</label>
                  <input value={editForm.first_name} onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                    className="w-full p-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm mb-1">{t("lastName")}</label>
                  <input value={editForm.last_name} onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                    className="w-full p-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm mb-1">{t("username")}</label>
                  <input value={editForm.username} onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                    className="w-full p-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm mb-1">{t("role")}</label>
                  <select value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value as "admin" | "user" })}
                    className="w-full p-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary">
                    <option value="user">{t("user")}</option>
                    <option value="admin">{t("admin")}</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={saveUser} className="flex-1 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium">{t("save")}</button>
                <button onClick={() => setEditingUser(null)} className="flex-1 py-2.5 border border-border rounded-xl text-sm">{t("cancel")}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserManagement;
