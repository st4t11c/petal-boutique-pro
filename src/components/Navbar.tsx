import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Menu, X, Sun, Moon, Bell, User, Settings, Package, Shield, LogOut, ChevronDown, Palette } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { useTheme, themes } from "@/contexts/ThemeContext";
import { useNotifications } from "@/contexts/NotificationContext";

const Navbar = () => {
  const { user, isAdmin, signOut } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const { itemCount } = useCart();
  const { isDark, toggleDark, themeId, setThemeId } = useTheme();
  const { notifications, unreadCount, markAllRead } = useNotifications();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setUserMenuOpen(false);
    navigate("/");
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl"
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold tracking-wider" style={{ fontFamily: "Space Grotesk" }}>
          <span className="text-primary">THE</span> <span className="text-foreground">SHOP</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t("home")}</Link>
          <Link to="/products" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t("products")}</Link>

          {/* Lang toggle */}
          <button onClick={() => setLang(lang === "en" ? "sq" : "en")}
            className="text-xs font-bold px-2 py-1 rounded border border-border hover:border-primary transition-colors">
            {lang === "en" ? "SHQIP" : "ENGLISH"}
          </button>

          {/* Theme picker */}
          <div className="relative">
            <button onClick={() => setThemeOpen(!themeOpen)} className="p-2 rounded-lg hover:bg-secondary transition-colors">
              <Palette className="w-4 h-4 text-muted-foreground" />
            </button>
            <AnimatePresence>
              {themeOpen && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }} className="absolute right-0 top-12 bg-card border border-border rounded-xl p-3 shadow-2xl w-48 z-50">
                  <p className="text-xs text-muted-foreground mb-2 font-semibold">{t("themes")}</p>
                  <div className="grid grid-cols-4 gap-2">
                    {themes.map((th) => (
                      <button key={th.id} onClick={() => { setThemeId(th.id); setThemeOpen(false); }}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${themeId === th.id ? "border-foreground scale-110" : "border-transparent"}`}
                        style={{ backgroundColor: th.color }} title={th.name} />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Dark/Light toggle */}
          <button onClick={toggleDark} className="p-2 rounded-lg hover:bg-secondary transition-colors">
            {isDark ? <Sun className="w-4 h-4 text-primary" /> : <Moon className="w-4 h-4 text-primary" />}
          </button>

          {/* Cart */}
          <Link to="/cart" className="relative p-2">
            <ShoppingCart className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
            {itemCount > 0 && (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {itemCount}
              </motion.span>
            )}
          </Link>

          {/* Notifications */}
          {user && (
            <div className="relative">
              <button onClick={() => { setNotifOpen(!notifOpen); if (!notifOpen) markAllRead(); }} className="relative p-2">
                <Bell className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs w-4 h-4 rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              <AnimatePresence>
                {notifOpen && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 top-12 bg-card border border-border rounded-xl shadow-2xl w-72 max-h-80 overflow-y-auto z-50">
                    <div className="p-3 border-b border-border">
                      <p className="font-semibold text-sm">{t("notifications")}</p>
                    </div>
                    {notifications.length === 0 ? (
                      <p className="p-4 text-sm text-muted-foreground">{t("noNotifications")}</p>
                    ) : (
                      notifications.slice(0, 10).map((n) => (
                        <div key={n.id} className={`p-3 border-b border-border last:border-0 ${!n.read ? "bg-primary/5" : ""}`}>
                          <p className="text-sm font-medium">{n.title}</p>
                          <p className="text-xs text-muted-foreground">{n.message}</p>
                        </div>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* User menu */}
          {user ? (
            <div className="relative">
              <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary transition-colors">
                <User className="w-4 h-4 text-primary" />
                <ChevronDown className={`w-3 h-3 text-muted-foreground transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div initial={{ opacity: 0, scale: 0.95, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }} className="absolute right-0 top-12 bg-card border border-border rounded-xl shadow-2xl w-56 py-2 z-50">
                    <p className="px-4 py-2 text-xs text-muted-foreground truncate">{user.email}</p>
                    <div className="border-t border-border my-1" />
                    {isAdmin && (
                      <>
                        <DropLink icon={<Package className="w-4 h-4" />} to="/dashboard" label={t("dashboard")} onClick={() => setUserMenuOpen(false)} />
                        <DropLink icon={<Shield className="w-4 h-4" />} to="/user-management" label={t("userManagement")} onClick={() => setUserMenuOpen(false)} />
                      </>
                    )}
                    <DropLink icon={<ShoppingCart className="w-4 h-4" />} to="/my-orders" label={t("myOrders")} onClick={() => setUserMenuOpen(false)} />
                    <DropLink icon={<Settings className="w-4 h-4" />} to="/settings" label={t("settings")} onClick={() => setUserMenuOpen(false)} />
                    <div className="border-t border-border my-1" />
                    <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-destructive hover:bg-secondary transition-colors">
                      <LogOut className="w-4 h-4" /> {t("signOut")}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link to="/auth" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
              {t("signIn")}
            </Link>
          )}
        </div>

        {/* Mobile burger */}
        <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} className="md:hidden border-t border-border bg-background overflow-hidden">
            <div className="p-4 space-y-3">
              <Link to="/" className="block py-2 text-foreground" onClick={() => setMobileOpen(false)}>{t("home")}</Link>
              <Link to="/products" className="block py-2 text-foreground" onClick={() => setMobileOpen(false)}>{t("products")}</Link>
              <Link to="/cart" className="block py-2 text-foreground" onClick={() => setMobileOpen(false)}>{t("cart")} ({itemCount})</Link>
              {user ? (
                <>
                  {isAdmin && <Link to="/dashboard" className="block py-2 text-foreground" onClick={() => setMobileOpen(false)}>{t("dashboard")}</Link>}
                  {isAdmin && <Link to="/user-management" className="block py-2 text-foreground" onClick={() => setMobileOpen(false)}>{t("userManagement")}</Link>}
                  <Link to="/my-orders" className="block py-2 text-foreground" onClick={() => setMobileOpen(false)}>{t("myOrders")}</Link>
                  <Link to="/settings" className="block py-2 text-foreground" onClick={() => setMobileOpen(false)}>{t("settings")}</Link>
                  <button onClick={() => { handleSignOut(); setMobileOpen(false); }} className="block py-2 text-destructive">{t("signOut")}</button>
                </>
              ) : (
                <Link to="/auth" className="block py-2 text-primary font-medium" onClick={() => setMobileOpen(false)}>{t("signIn")}</Link>
              )}
              <div className="flex items-center gap-3 pt-2 border-t border-border">
                <button onClick={() => setLang(lang === "en" ? "sq" : "en")} className="text-xs font-bold px-2 py-1 border border-border rounded">{lang === "en" ? "SHQIP" : "EN"}</button>
                <button onClick={toggleDark} className="p-1">{isDark ? <Sun className="w-4 h-4 text-primary" /> : <Moon className="w-4 h-4 text-primary" />}</button>
                <div className="flex gap-1">
                  {themes.slice(0, 4).map((th) => (
                    <button key={th.id} onClick={() => setThemeId(th.id)} className={`w-5 h-5 rounded-full ${themeId === th.id ? "ring-2 ring-foreground" : ""}`}
                      style={{ backgroundColor: th.color }} />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

const DropLink: React.FC<{ icon: React.ReactNode; to: string; label: string; onClick: () => void }> = ({ icon, to, label, onClick }) => {
  const navigate = useNavigate();
  return (
    <button onClick={() => { navigate(to); onClick(); }}
      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors">
      {icon} {label}
    </button>
  );
};

export default Navbar;
