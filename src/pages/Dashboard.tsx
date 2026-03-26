import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { Navigate } from "react-router-dom";
import { Package, ShoppingCart, DollarSign, AlertTriangle, Search, Check, X, Plus, Edit2, Trash2, Upload, Link as LinkIcon, ImagePlus } from "lucide-react";
import { toast } from "sonner";

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const { t } = useLanguage();
  const { addNotification } = useNotifications();
  const qc = useQueryClient();
  const [tab, setTab] = useState<"overview" | "products" | "orders">("overview");
  const [orderSearch, setOrderSearch] = useState("");
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [imageMode, setImageMode] = useState<"url" | "upload">("url");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [additionalFiles, setAdditionalFiles] = useState<File[]>([]);
  const [pf, setPf] = useState({ name: "", description: "", price: "", stock: "", category: "Uncategorized", badge: "", image_url: "", is_active: true });

  if (!user || !isAdmin) return <Navigate to="/" />;

  const { data: products = [] } = useQuery({ queryKey: ["products-all"], queryFn: async () => { const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false }); return data || []; }});
  const { data: orders = [] } = useQuery({ queryKey: ["orders"], queryFn: async () => { const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false }); return data || []; }});
  const { data: categories = [] } = useQuery({ queryKey: ["categories"], queryFn: async () => { const { data } = await supabase.from("categories").select("*"); return data || []; }});

  const totalRevenue = orders.filter((o) => o.status === "approved" || o.status === "delivered").reduce((s, o) => s + o.total, 0);
  const lowStockItems = products.filter((p) => p.stock <= 5 && p.stock > 0);

  const filteredOrders = orders.filter((o) =>
    o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
    o.customer_name.toLowerCase().includes(orderSearch.toLowerCase()) ||
    o.customer_email.toLowerCase().includes(orderSearch.toLowerCase())
  );

  const updateOrderStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("orders").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, { status }) => {
      qc.invalidateQueries({ queryKey: ["orders"] });
      addNotification({ title: status === "approved" ? t("orderApproved") : t("orderDenied"), message: `${t("status")}: ${t(status)}`, type: status === "approved" ? "approval" : "denial" });
      toast.success(t("orderUpdated"));
    },
  });

  const uploadFile = async (file: File): Promise<string> => {
    const ext = file.name.split(".").pop();
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file);
    if (error) throw error;
    const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(path);
    return urlData.publicUrl;
  };

  const handleSaveProduct = async () => {
    try {
      let imageUrl = pf.image_url;
      if (imageMode === "upload" && imageFile) {
        imageUrl = await uploadFile(imageFile);
      }

      const productData = { name: pf.name, description: pf.description || null, price: parseFloat(pf.price), stock: parseInt(pf.stock), category: pf.category, badge: pf.badge || null, image_url: imageUrl || null, is_active: pf.is_active };

      let productId: string;
      if (editingProduct) {
        const { error } = await supabase.from("products").update(productData).eq("id", editingProduct.id);
        if (error) throw error;
        productId = editingProduct.id;
      } else {
        const { data, error } = await supabase.from("products").insert(productData).select().single();
        if (error) throw error;
        productId = data.id;
      }

      // Upload additional images
      if (additionalFiles.length > 0) {
        const existingImages = editingProduct
          ? (await supabase.from("product_images").select("sort_order").eq("product_id", productId).order("sort_order", { ascending: false }).limit(1)).data
          : [];
        let sortOrder = existingImages?.[0]?.sort_order ?? 0;

        for (const file of additionalFiles) {
          const url = await uploadFile(file);
          sortOrder++;
          await supabase.from("product_images").insert({ product_id: productId, image_url: url, sort_order: sortOrder });
        }
      }

      qc.invalidateQueries({ queryKey: ["products-all"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      toast.success(editingProduct ? t("productUpdated") : t("productAdded"));
      resetForm();
    } catch (err: any) { toast.error(err.message); }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm(t("deleteProductConfirm"))) return;
    await supabase.from("products").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["products-all"] });
    qc.invalidateQueries({ queryKey: ["products"] });
    toast.success(t("productDeleted"));
  };

  const resetForm = () => { setShowProductForm(false); setEditingProduct(null); setImageFile(null); setAdditionalFiles([]); setImageMode("url"); setPf({ name: "", description: "", price: "", stock: "", category: "Uncategorized", badge: "", image_url: "", is_active: true }); };

  const startEdit = (p: any) => { setEditingProduct(p); setPf({ name: p.name, description: p.description || "", price: String(p.price), stock: String(p.stock), category: p.category, badge: p.badge || "", image_url: p.image_url || "", is_active: p.is_active }); setShowProductForm(true); setAdditionalFiles([]); };

  const tabs = [
    { id: "overview", label: t("overview") },
    { id: "products", label: t("productManagement") },
    { id: "orders", label: t("orders") },
  ] as const;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6" style={{ fontFamily: "Space Grotesk" }}>{t("dashboard")}</h1>

      <div className="flex gap-2 mb-6 overflow-x-auto">
        {tabs.map((tb) => (
          <button key={tb.id} onClick={() => setTab(tb.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${tab === tb.id ? "bg-primary text-primary-foreground" : "bg-card border border-border hover:bg-secondary"}`}>
            {tb.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: <Package className="w-6 h-6" />, label: t("totalProducts"), value: products.length },
            { icon: <ShoppingCart className="w-6 h-6" />, label: t("totalOrders"), value: orders.length },
            { icon: <DollarSign className="w-6 h-6" />, label: t("totalRevenue"), value: `$${totalRevenue.toFixed(2)}` },
            { icon: <AlertTriangle className="w-6 h-6" />, label: t("lowStockItems"), value: lowStockItems.length },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="bg-card border border-border rounded-2xl p-5">
              <div className="text-primary mb-2">{s.icon}</div>
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className="text-2xl font-bold mt-1">{s.value}</p>
            </motion.div>
          ))}
        </div>
      )}

      {tab === "products" && (
        <div>
          <button onClick={() => { resetForm(); setShowProductForm(true); }}
            className="mb-4 px-4 py-2 bg-primary text-primary-foreground rounded-xl flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> {t("addProduct")}
          </button>

          {showProductForm && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-2xl p-6 mb-6 space-y-3">
              <h3 className="font-semibold">{editingProduct ? t("editProduct") : t("addProduct")}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input placeholder={t("productName")} value={pf.name} onChange={(e) => setPf({ ...pf, name: e.target.value })}
                  className="p-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary" />
                <input placeholder={t("price")} type="number" value={pf.price} onChange={(e) => setPf({ ...pf, price: e.target.value })}
                  className="p-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary" />
                <input placeholder={t("stock")} type="number" value={pf.stock} onChange={(e) => setPf({ ...pf, stock: e.target.value })}
                  className="p-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary" />
                <select value={pf.category} onChange={(e) => setPf({ ...pf, category: e.target.value })}
                  className="p-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary">
                  <option>Uncategorized</option>
                  {categories.map((c) => <option key={c.id}>{c.name}</option>)}
                </select>
                <input placeholder={t("badge")} value={pf.badge} onChange={(e) => setPf({ ...pf, badge: e.target.value })}
                  className="p-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary" />
              </div>
              <textarea placeholder={t("description")} value={pf.description} onChange={(e) => setPf({ ...pf, description: e.target.value })}
                className="w-full p-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary" rows={2} />

              {/* Main image */}
              <div className="flex gap-2">
                <button onClick={() => setImageMode("url")} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs ${imageMode === "url" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
                  <LinkIcon className="w-3 h-3" /> URL
                </button>
                <button onClick={() => setImageMode("upload")} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs ${imageMode === "upload" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
                  <Upload className="w-3 h-3" /> {t("uploadImage")}
                </button>
              </div>
              {imageMode === "url" ? (
                <input placeholder={t("imageUrl")} value={pf.image_url} onChange={(e) => setPf({ ...pf, image_url: e.target.value })}
                  className="w-full p-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary" />
              ) : (
                <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="w-full p-2.5 bg-background border border-border rounded-xl text-sm" />
              )}

              {/* Additional images */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-1">
                  <ImagePlus className="w-4 h-4 text-primary" /> {t("addImages")}
                </label>
                <input type="file" accept="image/*" multiple onChange={(e) => setAdditionalFiles(Array.from(e.target.files || []))}
                  className="w-full p-2.5 bg-background border border-border rounded-xl text-sm" />
                {additionalFiles.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">{additionalFiles.length} {t("productImages").toLowerCase()}</p>
                )}
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={pf.is_active} onChange={(e) => setPf({ ...pf, is_active: e.target.checked })} /> {t("active")}
              </label>

              <div className="flex gap-2">
                <button onClick={handleSaveProduct} className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm">{t("save")}</button>
                <button onClick={resetForm} className="px-4 py-2 border border-border rounded-xl text-sm">{t("cancel")}</button>
              </div>
            </motion.div>
          )}

          <div className="space-y-2">
            {products.map((p) => (
              <div key={p.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-secondary rounded-lg overflow-hidden shrink-0">
                  {p.image_url ? <img src={p.image_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-muted-foreground"><Package className="w-5 h-5" /></div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground">${p.price} · {t("stock")}: {p.stock}</p>
                </div>
                <button onClick={() => startEdit(p)} className="p-2 hover:bg-secondary rounded-lg"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => deleteProduct(p.id)} className="p-2 hover:bg-destructive/10 rounded-lg text-destructive"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "orders" && (
        <div>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={orderSearch} onChange={(e) => setOrderSearch(e.target.value)} placeholder={t("searchByIdNameEmail")}
              className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:border-primary" />
          </div>
          <div className="space-y-3">
            {filteredOrders.map((order) => (
              <motion.div key={order.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="bg-card border border-border rounded-xl p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div>
                    <p className="font-medium text-sm">#{order.id.slice(0, 8)}</p>
                    <p className="text-xs text-muted-foreground">{order.customer_name} · {order.customer_email}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${order.status === "approved" ? "bg-green-500/20 text-green-500" : order.status === "denied" ? "bg-red-500/20 text-red-500" : "bg-yellow-500/20 text-yellow-500"}`}>
                    {t(order.status)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-primary font-bold">${order.total}</p>
                  <div className="flex gap-2">
                    {order.status === "pending" && (
                      <>
                        <button onClick={() => updateOrderStatus.mutate({ id: order.id, status: "approved" })}
                          className="flex items-center gap-1 px-3 py-1.5 bg-green-500/20 text-green-500 rounded-lg text-xs hover:bg-green-500/30">
                          <Check className="w-3 h-3" /> {t("approve")}
                        </button>
                        <button onClick={() => updateOrderStatus.mutate({ id: order.id, status: "denied" })}
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-500/20 text-red-500 rounded-lg text-xs hover:bg-red-500/30">
                          <X className="w-3 h-3" /> {t("deny")}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
