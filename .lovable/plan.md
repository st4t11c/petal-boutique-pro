

# Rebuild & Enhance "THE SHOP" E-Commerce Website

## Problem
The project files are missing — no `package.json`, no `src/` directory. The entire codebase must be rebuilt from scratch, incorporating all previously built features plus the new ones you've requested.

## Plan

### Phase 1: Restore Core Project Structure
Recreate the full React + Vite + TypeScript + Tailwind project with all dependencies (framer-motion, lucide-react, shadcn/ui components, @tanstack/react-query).

### Phase 2: Rebuild Existing Features
Restore everything that was previously built:
- **THE SHOP** branding with dark charcoal/amber theme + light mode
- Hero section with parallax scrolling and orbiting market icons
- Product listing, detail pages, cart system, checkout flow
- Admin dashboard (stats, product CRUD, order management)
- Auth system (AuthContext, login/signup pages)
- Dark/Light mode toggle, English/Albanian language toggle
- Notification system, My Orders page, Settings page
- All database integration (products, orders, categories, shop_settings, user_roles)

### Phase 3: New Features

**1. Enhanced User Management (Admin)**
- Display users as clickable cards showing name + role
- Click to open edit modal: name, username, email, role (dropdown)
- Delete user button with confirmation
- Create a `profiles` table (id, user_id, first_name, last_name, username, phone) with auto-creation trigger on signup

**2. Product Image Upload (File + URL)**
- Create a `product-images` storage bucket
- Admin product form: toggle between URL input and file upload from device
- Upload to storage, save public URL to products table

**3. Working Hours System**
- Update `shop_settings` table: replace `working_hours` text with structured JSON (daily open/close times)
- Footer shows live open/closed status with green/red indicator based on current time
- Admin Settings page has a daily schedule editor (Mon–Sun, open time, close time)

**4. Revamped Settings Page**
- Settings page with left sidebar navigation:
  - **Profile**: Edit first name, last name, username
  - **Security**: Change password (current password → new password + confirm)
  - **Working Hours** (admin only): Daily schedule editor
  - **Connected Accounts**: Link Google/Apple, add phone number display

**5. Google & Apple OAuth Login**
- Use Lovable Cloud's managed OAuth (Configure Social Auth tool)
- Add Google and Apple sign-in buttons on login/signup pages
- Note: **Phone number authentication is not supported** by Lovable Cloud. Users can store their phone number in their profile, but cannot use it to sign in.

**6. Fix Auth & Sign Out**
- Proper `onAuthStateChange` listener setup
- Fix sign-out by calling `supabase.auth.signOut()` correctly and clearing state
- Persistent sessions using localStorage

**7. Cookie Consent Banner**
- Bottom banner with "Accept" / "Decline" for cookies
- Store preference in localStorage
- Animated slide-up with framer-motion

**8. Theme Selector (Multiple Visual Themes)**
- Build a ThemeSelector component accessible from settings/navbar
- 8 total themes (including current dark/amber):
  1. **Midnight Amber** (current) — dark charcoal + gold accents
  2. **Ocean Blue** — deep navy + cyan accents
  3. **Crimson Night** — dark red/black + rose accents
  4. **Forest Dark** — deep green/black + emerald accents
  5. **Royal Purple** — dark purple + lavender accents
  6. **Sunset Warm** — warm browns + orange accents
  7. **Arctic Frost** — cool grays + ice blue accents
  8. **Neon City** — black + neon pink/green accents
- Each theme changes CSS variables (colors, gradients, hero background style)
- All themes support both dark and light mode variants
- Theme stored in localStorage

### Phase 4: Database Migrations Needed
1. **New `profiles` table**: user_id (FK to auth.users), first_name, last_name, username, phone, with auto-create trigger
2. **Storage bucket** `product-images`: public bucket for product image uploads
3. **Update `shop_settings`**: Add `working_hours_json` JSONB column for structured hours
4. **RLS policies** for profiles (users read/update own, admins read/update all)

### Technical Notes
- Phone number sign-in (SMS OTP) is not available in Lovable Cloud — will add phone field to profile only
- Google and Apple OAuth use the managed Lovable Cloud solution via `lovable.auth.signInWithOAuth()`
- All 8 themes are CSS variable-based, no code duplication
- The project will be fully responsive and work on all device sizes

