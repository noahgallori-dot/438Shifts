# 438 Shifts • Store #438 Associate Coverage & Trade

A mobile-first, responsive web application for Store #438 coworkers to post, cover, and trade shifts with real-time cross-device sync powered by **Supabase**.

## ✨ Key Features

1. **Private Shifts (Login Required)**:
   - Coworker shifts and schedules are protected behind an associate login gate. You must be logged in as a verified Store #438 associate or manager to view shifts, post new shifts, or contact coworkers.
2. **Multi-Step Associate Sign-Up Wizard**:
   - New associates create an account through a clean, guided 5-step registration wizard rather than having all fields on one screen:
     - **Step 1: Email Verification**: Enter email address and confirm with an EmailJS 6-digit verification code.
     - **Step 2: Name & Avatar**: Enter first name and last name, pick an avatar preset or upload a cropped profile photo.
     - **Step 3: Phone Number**: Enter 10-digit mobile phone number (live-formatted).
     - **Step 4: Associate Level**: Select In-N-Out level (Levels 1–6) from the clean dropdown.
     - **Step 5: Password Creation**: Create and confirm a secure password (min 4 characters).
   - Only new sign-ups go through the multi-step wizard; existing associates editing their profile retain the convenient direct profile edit view.
3. **Password Confirmation for Existing Associates**:
   - Associates who registered previously without a password receive an automatic popup modal to create and confirm their password on their next visit or login.
4. **Direct Password Update**:
   - Associates can update their password directly from the User Account menu or Login modal with only the new password inputs shown (email is bound behind the scenes; no email confirmation code needed).
5. **Manager Password Visibility**:
   - Store Managers can view all associate passwords in the Associate Directory & Device Log table, edit them in the Manager Edit modal, and export them to CSV and Google Sheets.
6. **Mobile-First Experience**:
   - **No Duplicate Buttons**: Single `+ Post Shift` pill in the bottom navigation bar on mobile (removed the redundant floating bottom-right icon and duplicate header/view buttons).
   - **Native-Feel Month & Week Views**: Compact level-dot indicators on the mobile Month grid, and a vertical scrollable agenda in Week view (no horizontal scrolling required).
2. **Shift Poster Exclusive "Cover Shift" (Permanent Takedown)**:
   - Only the associate who posted a shift can see and click the **Cover Shift (Take Down Forever)** button.
   - Once clicked, the shift is permanently deleted from Supabase and removed from the board for everyone across all devices.
3. **Store Manager Mode (Delete Any Shift)**:
   - **How to activate**: Press and hold the top store logo (`🌴 438`) for **3 seconds** and enter the manager password (`Richeson456`).
   - **Permissions**: When signed in as a Manager, you can delete **any** shift directly from the shift cards (`🗑️ Delete`) or inside the Shift Details modal (`🗑️ Delete Shift Post • 👑 Manager`).
   - Tap the `🌴 438` logo while in Manager Mode to open the **Associate Directory & Device Log**.
4. **Cross-Device Memory with Supabase**:
   - Connected to `https://pxykvlbsnccjaghskqco.supabase.co/rest/v1/` using publishable key `sb_publishable_uawLm9qXPG11rBCyJ8Xmhg_NvIwL1ar`.
   - Remembers shifts and verified associate profiles across phones, tablets, and computers in real time.

---

## 🗄️ Step 1: One-Time Supabase Table Setup (SQL Editor)

1. Open your [Supabase Dashboard SQL Editor](https://supabase.com/dashboard/project/pxykvlbsnccjaghskqco/sql/new).
2. Copy the contents of [`supabase_setup.sql`](./supabase_setup.sql) (or click **🗄️ Copy Supabase SQL** inside the Store Manager Hub in the app).
3. Paste into the Supabase SQL Editor and click **Run**.

---

## 🌐 Step 2: Connect GitHub Repository to Cloudflare Pages & Your Domain

1. Push this folder (`index.html`, `styles.css`, `app.js`, `supabase_setup.sql`, `README.md`) to your **GitHub repository**.
2. Log in to your **Cloudflare Dashboard** → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
3. Select your GitHub repository:
   - **Framework preset**: `None`
   - **Build command**: *(leave blank)*
   - **Build output directory**: `/`
4. Click **Save and Deploy**.
5. Once deployed, go to your Cloudflare Pages project → **Custom domains** → **Set up a custom domain**, and enter the domain you bought on Cloudflare.
