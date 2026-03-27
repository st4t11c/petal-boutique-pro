import React, { createContext, useContext, useState } from "react";

const translations: Record<string, Record<string, string>> = {
  en: {
    home: "Home", products: "Products", cart: "Cart", dashboard: "Dashboard",
    settings: "Settings", myOrders: "My Orders", userManagement: "User Management",
    signIn: "Sign In", signUp: "Sign Up", signOut: "Sign Out", email: "Email",
    password: "Password", name: "Name", phone: "Phone", search: "Search",
    addToCart: "Add to Cart", checkout: "Checkout", total: "Total", quantity: "Quantity",
    price: "Price", category: "Category", description: "Description", inStock: "In Stock",
    outOfStock: "Out of Stock", lowStock: "Low Stock", pending: "Pending", approved: "Approved",
    denied: "Denied", ready: "Ready", delivered: "Delivered", orders: "Orders",
    revenue: "Revenue", profile: "Profile", security: "Security", workingHours: "Working Hours",
    contactUs: "Contact Us", firstName: "First Name", lastName: "Last Name",
    username: "Username", currentPassword: "Current Password", newPassword: "New Password",
    confirmPassword: "Confirm Password", save: "Save", cancel: "Cancel", delete: "Delete",
    edit: "Edit", add: "Add", remove: "Remove", close: "Close", open: "Open",
    monday: "Monday", tuesday: "Tuesday", wednesday: "Wednesday", thursday: "Thursday",
    friday: "Friday", saturday: "Saturday", sunday: "Sunday", role: "Role", admin: "Admin",
    user: "User", heroTitle: "THE SHOP", heroSubtitle: "Premium curated products for modern living",
    browseProducts: "Browse Products", shopNow: "Shop Now", notifications: "Notifications",
    noNotifications: "No notifications", orderApproved: "Order Approved", orderDenied: "Order Denied",
    newOrder: "New Order", cookieTitle: "We use cookies", cookieDesc: "This website uses cookies to enhance your experience.",
    accept: "Accept", decline: "Decline", themes: "Themes", delivery: "Delivery", pickup: "Pickup",
    customerName: "Customer Name", customerEmail: "Customer Email", address: "Address",
    notes: "Notes", placeOrder: "Place Order", orderSuccess: "Order placed successfully!",
    emptyCart: "Your cart is empty", continueShopping: "Continue Shopping",
    productManagement: "Product Management", addProduct: "Add Product", editProduct: "Edit Product",
    productName: "Product Name", stock: "Stock", badge: "Badge", imageUrl: "Image URL",
    uploadImage: "Upload Image", active: "Active", allProducts: "All Products",
    closed: "Closed", opened: "Opened", shopStatus: "Shop Status",
    forgotPassword: "Forgot Password?", resetPassword: "Reset Password",
    noAccount: "Don't have an account?", haveAccount: "Already have an account?",
    orContinueWith: "Or continue with", approve: "Approve", deny: "Deny",
    orderDetails: "Order Details", items: "Items", status: "Status", date: "Date",
    fulfillment: "Fulfillment", update: "Update", totalOrders: "Total Orders",
    totalRevenue: "Total Revenue", totalProducts: "Total Products", lowStockItems: "Low Stock Items",
    // New keys
    overview: "Overview", noOrdersYet: "No orders yet",
    premiumQuality: "Premium Quality", premiumQualityDesc: "Hand-picked products for the discerning customer",
    fastDelivery: "Fast Delivery", fastDeliveryDesc: "Quick and reliable delivery to your doorstep",
    securePayment: "Secure Payment", securePaymentDesc: "Multiple secure payment options available",
    updatePassword: "Update Password", newPasswordPlaceholder: "New Password",
    confirmPasswordPlaceholder: "Confirm Password",
    checkEmailVerify: "Check your email to verify your account!",
    welcomeBack: "Welcome back!", enterEmailFirst: "Please enter your email first",
    resetEmailSent: "Password reset email sent!",
    profileUpdated: "Profile updated!", passwordUpdated: "Password updated!",
    passwordsNoMatch: "Passwords don't match", hoursUpdated: "Working hours updated!",
    productUpdated: "Product updated!", productAdded: "Product added!",
    productDeleted: "Product deleted!", orderUpdated: "Order updated!",
    userUpdated: "User updated!", userRemoved: "User removed!",
    deleteUserConfirm: "Delete this user? This cannot be undone.",
    deleteProductConfirm: "Delete this product?",
    connectedAccounts: "Connected Accounts", comingSoon: "Coming soon",
    manageConnected: "Manage your connected accounts and linked services.",
    featuredProducts: "Featured Products", featured: "Featured", back: "Back",
    allRightsReserved: "All rights reserved.",
    addImages: "Add Images", productImages: "Product Images",
    searchByIdNameEmail: "Search by ID, name, or email...",
  },
  sq: {
    home: "Kryefaqja", products: "Produktet", cart: "Shporta", dashboard: "Paneli",
    settings: "Cilësimet", myOrders: "Porositë e Mia", userManagement: "Menaxhimi i Përdoruesve",
    signIn: "Hyr", signUp: "Regjistrohu", signOut: "Dil", email: "Email",
    password: "Fjalëkalimi", name: "Emri", phone: "Telefoni", search: "Kërko",
    addToCart: "Shto në Shportë", checkout: "Paguaj", total: "Totali", quantity: "Sasia",
    price: "Çmimi", category: "Kategoria", description: "Përshkrimi", inStock: "Në Stok",
    outOfStock: "Jashtë Stokut", lowStock: "Stok i Ulët", pending: "Në Pritje", approved: "Aprovuar",
    denied: "Refuzuar", ready: "Gati", delivered: "Dorëzuar", orders: "Porositë",
    revenue: "Të Ardhurat", profile: "Profili", security: "Siguria", workingHours: "Orari i Punës",
    contactUs: "Na Kontaktoni", firstName: "Emri", lastName: "Mbiemri",
    username: "Pseudonimi", currentPassword: "Fjalëkalimi Aktual", newPassword: "Fjalëkalimi i Ri",
    confirmPassword: "Konfirmo Fjalëkalimin", save: "Ruaj", cancel: "Anulo", delete: "Fshi",
    edit: "Ndrysho", add: "Shto", remove: "Hiq", close: "Mbyll", open: "Hap",
    monday: "E Hënë", tuesday: "E Martë", wednesday: "E Mërkurë", thursday: "E Enjte",
    friday: "E Premte", saturday: "E Shtunë", sunday: "E Dielë", role: "Roli", admin: "Admin",
    user: "Përdorues", heroTitle: "THE SHOP", heroSubtitle: "Produkte premium të kuruar për jetesën moderne",
    browseProducts: "Shfleto Produktet", shopNow: "Bli Tani", notifications: "Njoftimet",
    noNotifications: "Nuk ka njoftimet", orderApproved: "Porosia u Aprovua", orderDenied: "Porosia u Refuzua",
    newOrder: "Porosi e Re", cookieTitle: "Përdorim cookies", cookieDesc: "Kjo faqe përdor cookies për përvojë më të mirë.",
    accept: "Prano", decline: "Refuzo", themes: "Temat", delivery: "Dërgesë", pickup: "Marrje",
    customerName: "Emri i Klientit", customerEmail: "Email i Klientit", address: "Adresa",
    notes: "Shënime", placeOrder: "Bëj Porosinë", orderSuccess: "Porosia u vendos me sukses!",
    emptyCart: "Shporta juaj është bosh", continueShopping: "Vazhdo Blerjet",
    productManagement: "Menaxhimi i Produkteve", addProduct: "Shto Produkt", editProduct: "Ndrysho Produkt",
    productName: "Emri i Produktit", stock: "Stoku", badge: "Distinktivi", imageUrl: "URL e Fotos",
    uploadImage: "Ngarko Foto", active: "Aktiv", allProducts: "Të Gjitha Produktet",
    closed: "Mbyllur", opened: "Hapur", shopStatus: "Statusi i Dyqanit",
    forgotPassword: "Keni harruar fjalëkalimin?", resetPassword: "Rivendos Fjalëkalimin",
    noAccount: "Nuk keni llogari?", haveAccount: "Keni tashmë llogari?",
    orContinueWith: "Ose vazhdo me", approve: "Aprovo", deny: "Refuzo",
    orderDetails: "Detajet e Porosisë", items: "Artikujt", status: "Statusi", date: "Data",
    fulfillment: "Përmbushja", update: "Përditëso", totalOrders: "Porositë Totale",
    totalRevenue: "Të Ardhurat Totale", totalProducts: "Produktet Totale", lowStockItems: "Artikuj me Stok të Ulët",
    // New keys
    overview: "Përmbledhje", noOrdersYet: "Nuk ka porosi ende",
    premiumQuality: "Cilësi Premium", premiumQualityDesc: "Produkte të zgjedhura për klientë me shije",
    fastDelivery: "Dërgesë e Shpejtë", fastDeliveryDesc: "Dërgesë e shpejtë dhe e besueshme deri tek dera juaj",
    securePayment: "Pagesë e Sigurt", securePaymentDesc: "Mundësi të ndryshme pagese të sigurta",
    updatePassword: "Përditëso Fjalëkalimin", newPasswordPlaceholder: "Fjalëkalimi i Ri",
    confirmPasswordPlaceholder: "Konfirmo Fjalëkalimin",
    checkEmailVerify: "Kontrolloni email-in tuaj për të verifikuar llogarinë!",
    welcomeBack: "Mirë se u kthyet!", enterEmailFirst: "Ju lutem shkruani email-in tuaj fillimisht",
    resetEmailSent: "Email-i për rivendosjen e fjalëkalimit u dërgua!",
    profileUpdated: "Profili u përditësua!", passwordUpdated: "Fjalëkalimi u përditësua!",
    passwordsNoMatch: "Fjalëkalimet nuk përputhen", hoursUpdated: "Orari i punës u përditësua!",
    productUpdated: "Produkti u përditësua!", productAdded: "Produkti u shtua!",
    productDeleted: "Produkti u fshi!", orderUpdated: "Porosia u përditësua!",
    userUpdated: "Përdoruesi u përditësua!", userRemoved: "Përdoruesi u hoq!",
    deleteUserConfirm: "Fshini këtë përdorues? Kjo nuk mund të zhbëhet.",
    deleteProductConfirm: "Fshini këtë produkt?",
    connectedAccounts: "Llogaritë e Lidhura", comingSoon: "Së shpejti",
    manageConnected: "Menaxhoni llogaritë tuaja të lidhura dhe shërbimet.",
    featuredProducts: "Produkte të Rekomanduara", featured: "E Rekomanduar", back: "Kthehu",
    allRightsReserved: "Të gjitha të drejtat e rezervuara.",
    addImages: "Shto Foto", productImages: "Fotot e Produktit",
    searchByIdNameEmail: "Kërko sipas ID, emrit, ose email-it...",
  },
};

interface LangContextType {
  lang: "en" | "sq";
  setLang: (l: "en" | "sq") => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LangContextType>({
  lang: "en", setLang: () => {}, t: (k) => k,
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<"en" | "sq">(() => (localStorage.getItem("lang") as "en" | "sq") || "en");

  const t = (key: string) => translations[lang]?.[key] || translations.en[key] || key;

  const handleSetLang = (l: "en" | "sq") => {
    setLang(l);
    localStorage.setItem("lang", l);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang: handleSetLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
