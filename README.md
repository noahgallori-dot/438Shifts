# 438 Shifts • Store #438 Associate Coverage & Trade

A mobile-first, responsive web application for Store #438 coworkers to post, cover, and trade shifts with real-time cross-device sync powered by **Supabase**.

## ✨ Key Features

1. **Mobile-First Experience**:
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
