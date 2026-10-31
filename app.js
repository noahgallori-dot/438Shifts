// ==========================================================================
// 438 Shifts • Store #438 Associate Coverage App
// Supabase Cloud Sync (Cross-Device), Manager Hub & EmailJS Verification
// ==========================================================================

(function() {
  "use strict";

  // ==========================================================================
  // Supabase Backend Configuration
  // ==========================================================================
  const SUPABASE_PROJECT_URL = "https://pxykvlbsnccjaghskqco.supabase.co";
  const SUPABASE_REST_URL = "https://pxykvlbsnccjaghskqco.supabase.co/rest/v1";
  const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_uawLm9qXPG11rBCyJ8Xmhg_NvIwL1ar";

  const SUPABASE_SQL_SETUP_SCRIPT = `-- Run this in Supabase SQL Editor (https://supabase.com/dashboard/project/pxykvlbsnccjaghskqco/sql)
CREATE TABLE IF NOT EXISTS public.shifts (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  notes TEXT DEFAULT '',
  status TEXT DEFAULT 'open',
  author_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_email TEXT DEFAULT '',
  author_phone TEXT NOT NULL,
  author_level INTEGER NOT NULL DEFAULT 1,
  author_avatar TEXT DEFAULT '👨‍🍳',
  author_avatar_bg TEXT DEFAULT '#FFE8E6',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.associates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  level INTEGER NOT NULL DEFAULT 1,
  avatar TEXT DEFAULT '👨‍🍳',
  avatar_bg TEXT DEFAULT '#FFE8E6',
  email_verified BOOLEAN DEFAULT TRUE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  device JSONB DEFAULT '{}'::jsonb
);

ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.associates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public shifts access" ON public.shifts;
CREATE POLICY "Public shifts access" ON public.shifts FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public associates access" ON public.associates;
CREATE POLICY "Public associates access" ON public.associates FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);`;

  let supabaseClient = null;
  try {
    if (window.supabase && typeof window.supabase.createClient === "function") {
      supabaseClient = window.supabase.createClient(SUPABASE_PROJECT_URL, SUPABASE_PUBLISHABLE_KEY);
    }
  } catch (e) {
    console.warn("Supabase SDK init warning:", e);
  }

  function getSupabaseHeaders(extra = {}) {
    const headers = {
      "apikey": SUPABASE_PUBLISHABLE_KEY,
      "Content-Type": "application/json",
      ...extra
    };
    if (SUPABASE_PUBLISHABLE_KEY.startsWith("eyJ")) {
      headers["Authorization"] = `Bearer ${SUPABASE_PUBLISHABLE_KEY}`;
    }
    return headers;
  }

  // Associate Levels (1-6)
  const ASSOCIATE_LEVELS = {
    1: { level: 1, title: "Level 1", short: "L1", color: "#4A5568", bg: "#EDF2F7" },
    2: { level: 2, title: "Level 2", short: "L2", color: "#2B6CB0", bg: "#EBF8FF" },
    3: { level: 3, title: "Level 3", short: "L3", color: "#2C7A7B", bg: "#E6FFFA" },
    4: { level: 4, title: "Level 4", short: "L4", color: "#C05621", bg: "#FEEBC8" },
    5: { level: 5, title: "Level 5", short: "L5", color: "#9B2C2C", bg: "#FED7D7" },
    6: { level: 6, title: "Level 6", short: "L6", color: "#C53030", bg: "#FFF5F5" }
  };

  const PRESET_AVATARS = [
    { id: "avatar-1", emoji: "👨‍🍳", name: "Chef White Hat", bg: "#FFE8E6" },
    { id: "avatar-2", emoji: "🧢", name: "Red Crew Cap", bg: "#FFF4D2" },
    { id: "avatar-3", emoji: "👩‍🍳", name: "Smile Crew", bg: "#E3F2FD" },
    { id: "avatar-4", emoji: "🌟", name: "Star Associate", bg: "#E8F5E9" },
    { id: "avatar-5", emoji: "🍔", name: "Burger Badge", bg: "#FFF3E0" },
    { id: "avatar-6", emoji: "🌴", name: "Palm Coast Vibe", bg: "#F3E5F5" },
    { id: "avatar-7", emoji: "🍟", name: "Fries Master", bg: "#FFF8E1" },
    { id: "avatar-8", emoji: "🥤", name: "Shake & Drink", bg: "#E0F2F1" }
  ];

  // Cross-Platform Vector SVG Icons (Identical Chrome/Noto Flat Vector Style on iOS, Android & Desktop)
  const VECTOR_AVATARS = {
    "👨‍🍳": `<svg viewBox="0 0 36 36" width="72%" height="72%" fill="none"><path d="M9 15C7.3 15 6 13.7 6 12C6 10.4 7.2 9.1 8.8 9C9.5 6.7 11.7 5 14.3 5C15.8 5 17.2 5.6 18 6.5C18.8 5.6 20.2 5 21.7 5C24.3 5 26.5 6.7 27.2 9C28.8 9.1 30 10.4 30 12C30 13.7 28.7 15 27 15H9Z" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.8"/><rect x="9.5" y="14" width="17" height="4.5" rx="1" fill="#C81912"/><circle cx="18" cy="24" r="7" fill="#FDBA74"/><circle cx="15.3" cy="23.2" r="1.1" fill="#1E293B"/><circle cx="20.7" cy="23.2" r="1.1" fill="#1E293B"/><path d="M15.5 26.5C16.8 27.8 19.2 27.8 20.5 26.5" stroke="#1E293B" stroke-width="1.6" stroke-linecap="round"/></svg>`,
    "🧢": `<svg viewBox="0 0 36 36" width="72%" height="72%" fill="none"><path d="M7 21C7 13.8 12.2 9 18.5 9C24.8 9 29 13.8 29 21H7Z" fill="#C81912"/><path d="M18.5 9C21.5 9 24 13.8 24 21H13C13 13.8 15.5 9 18.5 9Z" fill="#EF4444"/><path d="M6 21C6 19.9 6.9 19 8 19H31C32.7 19 34 20.3 34 22C34 23.1 33.1 24 32 24H8C6.9 24 6 23.1 6 21Z" fill="#FFB81C"/><circle cx="18.5" cy="8.5" r="2" fill="#FFB81C"/></svg>`,
    "👩‍🍳": `<svg viewBox="0 0 36 36" width="72%" height="72%" fill="none"><path d="M8 22C8 15.5 12.5 11 18 11C23.5 11 28 15.5 28 22V27H8V22Z" fill="#78350F"/><path d="M10 13C10 9.5 13.6 7 18 7C22.4 7 26 9.5 26 13H10Z" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.6"/><path d="M11 12.5H25V15H11V12.5Z" fill="#C81912"/><circle cx="18" cy="22.5" r="6.5" fill="#FCD34D"/><circle cx="15.5" cy="21.8" r="1.1" fill="#1E293B"/><circle cx="20.5" cy="21.8" r="1.1" fill="#1E293B"/><path d="M15.5 25C16.8 26.3 19.2 26.3 20.5 25" stroke="#C81912" stroke-width="1.7" stroke-linecap="round"/></svg>`,
    "🌟": `<svg viewBox="0 0 36 36" width="72%" height="72%" fill="none"><polygon points="18 3 22.3 12.2 32.4 13.5 25 20.5 26.9 30.6 18 25.7 9.1 30.6 11 20.5 3.6 13.5 13.7 12.2 18 3" fill="#FFB81C" stroke="#D97706" stroke-width="1.8" stroke-linejoin="round"/><polygon points="18 7.5 20.8 13.5 27.3 14.3 22.5 18.8 23.7 25.3 18 22.2 12.3 25.3 13.5 18.8 8.7 14.3 15.2 13.5 18 7.5" fill="#FEF08A"/></svg>`,
    "🍔": `<svg viewBox="0 0 36 36" width="72%" height="72%" fill="none"><path d="M6 16C6 10.5 11.4 7 18 7C24.6 7 30 10.5 30 16H6Z" fill="#F59E0B"/><ellipse cx="14" cy="11.5" rx="1.3" ry="0.7" fill="#FEF3C7"/><ellipse cx="18.5" cy="10.5" rx="1.3" ry="0.7" fill="#FEF3C7"/><ellipse cx="22.5" cy="12" rx="1.3" ry="0.7" fill="#FEF3C7"/><path d="M5 18C7.5 16.5 9.5 19.5 12 18C14.5 16.5 16.5 19.5 19 18C21.5 16.5 23.5 19.5 26 18C28.5 16.5 30 18.5 31 18" stroke="#22C55E" stroke-width="2.6" stroke-linecap="round"/><rect x="6" y="19.5" width="24" height="3.8" rx="1.9" fill="#78350F"/><polygon points="8,19.5 14,19.5 11,22.5" fill="#FACC15"/><polygon points="20,19.5 26,19.5 23,22.5" fill="#FACC15"/><path d="M6.5 24H29.5C29.5 26.8 27.2 29 24.5 29H11.5C8.8 29 6.5 26.8 6.5 24Z" fill="#D97706"/></svg>`,
    "🌴": `<svg viewBox="0 0 36 36" width="72%" height="72%" fill="none"><path d="M16.5 31C16.5 23.5 18 18 20.5 13.5" stroke="#B45309" stroke-width="3.2" stroke-linecap="round"/><path d="M20.5 13.5C15 10.5 8.5 12 5 16.5C10 15.5 15.5 15.5 20.5 13.5Z" fill="#22C55E"/><path d="M20.5 13.5C14 7.5 14.5 3 19.5 1.5C18.5 6 19 9.5 20.5 13.5Z" fill="#16A34A"/><path d="M20.5 13.5C24.5 7 30.5 6.5 34 10.5C29 10.5 24.5 11.5 20.5 13.5Z" fill="#22C55E"/><path d="M20.5 13.5C26.5 13 31.5 16.5 32.5 21.5C28.5 18.5 24.5 15.5 20.5 13.5Z" fill="#15803D"/><path d="M20.5 13.5C13.5 15 9.5 19.5 9.5 24C13 20 16.5 16.5 20.5 13.5Z" fill="#15803D"/></svg>`,
    "🍟": `<svg viewBox="0 0 36 36" width="72%" height="72%" fill="none"><rect x="10" y="6" width="3.5" height="14" rx="1.2" fill="#FACC15" stroke="#EAB308" stroke-width="0.8"/><rect x="14.2" y="4" width="3.5" height="16" rx="1.2" fill="#FDE047" stroke="#EAB308" stroke-width="0.8"/><rect x="18.4" y="5.5" width="3.5" height="14.5" rx="1.2" fill="#FACC15" stroke="#EAB308" stroke-width="0.8"/><rect x="22.5" y="7" width="3.5" height="13" rx="1.2" fill="#FDE047" stroke="#EAB308" stroke-width="0.8"/><path d="M8 15H28L25.5 30C25.3 31.1 24.3 32 23.2 32H12.8C11.7 32 10.7 31.1 10.5 30L8 15Z" fill="#C81912"/><path d="M12.5 19.5C14.5 21.5 21.5 21.5 23.5 19.5" stroke="#FFB81C" stroke-width="2.2" stroke-linecap="round"/></svg>`,
    "🥤": `<svg viewBox="0 0 36 36" width="72%" height="72%" fill="none"><path d="M21 3L17.5 11" stroke="#C81912" stroke-width="2.6" stroke-linecap="round"/><path d="M9.5 12H26.5L24.2 30.2C24 31.3 23.1 32 22 32H14C12.9 32 12 31.3 11.8 30.2L9.5 12Z" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.8"/><path d="M10.5 18H25.5L24.8 24H11.2L10.5 18Z" fill="#C81912"/><path d="M8 12C8 10.6 9.1 9.5 10.5 9.5H25.5C26.9 9.5 28 10.6 28 12H8Z" fill="#E2E8F0"/></svg>`,
    "👤": `<svg viewBox="0 0 24 24" width="62%" height="62%" fill="none" stroke="#B45309" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`
  };

  function renderAvatarMarkup(avatar, altText = "Avatar") {
    if (!avatar) return VECTOR_AVATARS["👨‍🍳"];
    if (avatar.startsWith("data:image")) {
      return `<img src="${avatar}" alt="${altText}">`;
    }
    return VECTOR_AVATARS[avatar] || VECTOR_AVATARS["👨‍🍳"];
  }

  // Storage Keys
  const STORAGE_KEY_USER = "crew_user_profile_438";
  const STORAGE_KEY_SHIFTS_LEGACY = "crew_shifts_data_438";
  const STORAGE_KEY_SHIFTS = "crew_shifts_cloud_v2_438";
  const STORAGE_KEY_DELETED_SHIFTS = "crew_deleted_shifts_438";
  const STORAGE_KEY_ADMIN = "crew_is_admin_438";
  const STORAGE_KEY_ADMIN_HUB_OPEN = "crew_admin_hub_open_438";
  const STORAGE_KEY_ROSTER = "crew_associates_roster_438";
  const STORAGE_KEY_EMAILJS = "crew_emailjs_config_438";
  const STORAGE_KEY_MANAGER_PASS = "crew_manager_password_438";
  const SUPABASE_EMAILJS_CONFIG_ID = "__store_438_emailjs_config__";
  const MANAGER_APPROVAL_TEMPLATE_ID = "template_7l9j34s";
  const MANAGER_APPROVAL_PUBLIC_KEY = "LyzjvTE6-eDxTMS7e";
  const MANAGER_APPROVAL_PRIVATE_KEY = "vkb9abj*zwq@MBD0vbe";
  const DEFAULT_MANAGER_PASSWORD = "Richeson456";

  // EmailJS Defaults (Configured with Store #438 keys & Synced via Supabase)
  const DEFAULT_EMAILJS = {
    serviceId: "service_fc5qlhe",
    templateId: "template_gd1prmq",
    publicKey: "ZRmiY1jbzERyD6utf"
  };

  function getManagerPassword() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MANAGER_PASS);
      if (saved && saved.trim()) return saved.trim();
    } catch (e) {}
    return DEFAULT_MANAGER_PASSWORD;
  }

  function saveManagerPasswordLocalOnly(pwd) {
    if (!pwd || !pwd.trim()) return;
    try {
      localStorage.setItem(STORAGE_KEY_MANAGER_PASS, pwd.trim());
    } catch (e) {}
  }

  const LEGACY_EMAILJS_VALUES = new Set([
    "template_7775lqt"
  ]);

  function normalizeEmailJSConfig(cfg) {
    if (!cfg || typeof cfg !== "object") return { ...DEFAULT_EMAILJS };
    return {
      serviceId: (!cfg.serviceId || LEGACY_EMAILJS_VALUES.has(cfg.serviceId)) ? DEFAULT_EMAILJS.serviceId : cfg.serviceId,
      templateId: (!cfg.templateId || LEGACY_EMAILJS_VALUES.has(cfg.templateId)) ? DEFAULT_EMAILJS.templateId : cfg.templateId,
      publicKey: (!cfg.publicKey || LEGACY_EMAILJS_VALUES.has(cfg.publicKey)) ? DEFAULT_EMAILJS.publicKey : cfg.publicKey
    };
  }

  function getEmailJSConfig() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_EMAILJS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.serviceId && parsed.templateId && parsed.publicKey) {
          const normalized = normalizeEmailJSConfig(parsed);
          if (
            normalized.serviceId !== parsed.serviceId ||
            normalized.templateId !== parsed.templateId ||
            normalized.publicKey !== parsed.publicKey
          ) {
            localStorage.setItem(STORAGE_KEY_EMAILJS, JSON.stringify(normalized));
          }
          return normalized;
        }
      }
    } catch (e) {}
    return { ...DEFAULT_EMAILJS };
  }

  function saveEmailJSConfigLocalOnly(cfg) {
    const cleanCfg = normalizeEmailJSConfig(cfg);
    try {
      localStorage.setItem(STORAGE_KEY_EMAILJS, JSON.stringify(cleanCfg));
    } catch (e) {}
    const inputCfgService = document.getElementById("config-service-id");
    const inputCfgTemplate = document.getElementById("config-template-id");
    const inputCfgKey = document.getElementById("config-public-key");
    if (inputCfgService && document.activeElement !== inputCfgService) inputCfgService.value = cleanCfg.serviceId;
    if (inputCfgTemplate && document.activeElement !== inputCfgTemplate) inputCfgTemplate.value = cleanCfg.templateId;
    if (inputCfgKey && document.activeElement !== inputCfgKey) inputCfgKey.value = cleanCfg.publicKey;
  }

  async function upsertEmailJSConfigToSupabase(cfg) {
    const cleanCfg = normalizeEmailJSConfig(cfg);
    const managerPassword = getManagerPassword();
    const shiftConfigRow = {
      id: SUPABASE_EMAILJS_CONFIG_ID,
      date: "1970-01-01",
      start_time: "00:00",
      end_time: "00:00",
      notes: JSON.stringify({
        isSystemConfig: true,
        serviceId: cleanCfg.serviceId,
        templateId: cleanCfg.templateId,
        publicKey: cleanCfg.publicKey,
        managerPassword: managerPassword,
        updatedAt: new Date().toISOString()
      }),
      status: "config",
      author_id: SUPABASE_EMAILJS_CONFIG_ID,
      author_name: cleanCfg.serviceId || "",
      author_email: cleanCfg.templateId || "",
      author_phone: cleanCfg.publicKey || "",
      author_level: 1,
      author_avatar: "👨‍🍳",
      author_avatar_bg: "#FFF8E6",
      created_at: new Date().toISOString()
    };

    const assocConfigRow = {
      id: SUPABASE_EMAILJS_CONFIG_ID,
      name: "Store 438 EmailJS Config",
      email: cleanCfg.serviceId || "",
      phone: cleanCfg.templateId || "",
      level: 1,
      avatar: cleanCfg.publicKey || "",
      avatar_bg: "#FFF8E6",
      email_verified: true,
      joined_at: new Date().toISOString(),
      device: {
        isSystemConfig: true,
        serviceId: cleanCfg.serviceId,
        templateId: cleanCfg.templateId,
        publicKey: cleanCfg.publicKey,
        managerPassword: managerPassword,
        updatedAt: new Date().toISOString()
      }
    };

    let ok = false;
    try {
      let resShift = await fetch(`${SUPABASE_REST_URL}/shifts?on_conflict=id`, {
        method: "POST",
        headers: getSupabaseHeaders({ "Prefer": "resolution=merge-duplicates,return=minimal" }),
        body: JSON.stringify(shiftConfigRow)
      });
      if (!resShift.ok) {
        const { author_email, ...fallbackRow } = shiftConfigRow;
        resShift = await fetch(`${SUPABASE_REST_URL}/shifts?on_conflict=id`, {
          method: "POST",
          headers: getSupabaseHeaders({ "Prefer": "resolution=merge-duplicates,return=minimal" }),
          body: JSON.stringify(fallbackRow)
        });
      }
      if (resShift.ok) ok = true;
    } catch (e) {}

    try {
      const resAssoc = await fetch(`${SUPABASE_REST_URL}/associates?on_conflict=id`, {
        method: "POST",
        headers: getSupabaseHeaders({ "Prefer": "resolution=merge-duplicates,return=minimal" }),
        body: JSON.stringify(assocConfigRow)
      });
      if (resAssoc.ok) ok = true;
    } catch (e) {}

    return ok;
  }

  function saveEmailJSConfig(cfg) {
    saveEmailJSConfigLocalOnly(cfg);
    upsertEmailJSConfigToSupabase(cfg);
  }

  // Track permanently deleted / covered shift IDs locally so seed data never resurrects them
  function getDeletedShiftIds() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_DELETED_SHIFTS);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) return new Set(arr);
      }
    } catch (e) {}
    return new Set();
  }

  function markShiftIdDeleted(shiftId) {
    if (!shiftId) return;
    const set = getDeletedShiftIds();
    set.add(shiftId);
    try {
      localStorage.setItem(STORAGE_KEY_DELETED_SHIFTS, JSON.stringify(Array.from(set)));
    } catch (e) {}
  }

  // Device Fingerprint Detector
  function detectDeviceDetails() {
    const ua = navigator.userAgent;
    let os = "Windows";
    if (/iPhone/.test(ua)) os = "iOS (iPhone)";
    else if (/iPad/.test(ua)) os = "iOS (iPad)";
    else if (/Android/.test(ua)) os = "Android";
    else if (/Windows NT 10.0/.test(ua)) os = "Windows 11/10";
    else if (/Windows/.test(ua)) os = "Windows";
    else if (/Macintosh|Mac OS X/.test(ua)) os = "macOS";
    else if (/Linux/.test(ua)) os = "Linux";

    let browser = "Chrome";
    if (/Edg/.test(ua)) browser = "Microsoft Edge";
    else if (/Chrome/.test(ua)) browser = "Google Chrome";
    else if (/Safari/.test(ua) && !/Chrome/.test(ua)) browser = "Safari";
    else if (/Firefox/.test(ua)) browser = "Firefox";

    const screen = `${window.screen.width} × ${window.screen.height}`;
    const isMobile = /Mobi|Android|iPhone|iPad/i.test(ua) || window.innerWidth <= 768;

    return {
      os,
      browser,
      screen,
      isMobile,
      summary: `${os} • ${browser}`,
      type: isMobile ? "Mobile" : "Desktop",
      recordedAt: new Date().toISOString()
    };
  }

  // Retired Fake / Seed Associate IDs (automatically purged if cached locally or in cloud)
  const FAKE_SEED_ASSOCIATE_IDS = new Set([
    "u-101", "u-102", "u-103", "u-104", "u-105", "u-106", "u-107"
  ]);

  function isFakeSeedAssociate(assoc) {
    if (!assoc) return false;
    if (assoc.id && FAKE_SEED_ASSOCIATE_IDS.has(String(assoc.id))) return true;
    return false;
  }

  // Initial Seed Associates Roster (Empty — no fake associates)
  function generateSeedRoster() {
    return [];
  }

  function formatDateKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  // Initial Seed Shifts (Empty — no fake shifts)
  function generateSeedShifts() {
    return [];
  }

  // ==========================================================================
  // Application State
  // ==========================================================================
  const state = {
    currentView: "month",
    activeDate: new Date(),
    selectedCalendarDay: formatDateKey(new Date()),
    userSelectedCalendarDay: false,
    filterMineOnly: false,
    selectedLevels: new Set(["1", "2", "3", "4", "5", "6"]),
    userProfile: null,
    isAdmin: false,
    shifts: [],
    associates: [],
    selectedShiftId: null,
    editingShiftId: null,
    selectedAvatarPreset: "avatar-1",
    uploadedAvatarDataUrl: null,
    pendingVerification: null,
    isEmailVerified: false,
    verifiedEmail: "",
    supabaseConnected: false,
    hasLoadedCloudAssociates: false
  };

  function hasCompleteProfile() {
    return !!(
      state.userProfile &&
      state.userProfile.name &&
      state.userProfile.name.trim() !== "" &&
      state.userProfile.phone &&
      state.userProfile.phone.trim() !== "" &&
      state.userProfile.email &&
      state.userProfile.level
    );
  }

  function isApprovedProfile() {
    return hasCompleteProfile() && state.userProfile.approved !== false;
  }

  function cleanPhoneDigits(phone) {
    return (phone || "").replace(/[^0-9+]/g, "");
  }

  // Live Phone Number Formatter: formats digits as (XXX) XXX-XXXX while typing
  function formatPhoneNumberLive(val) {
    let digits = String(val || "").replace(/\D/g, "");
    if (digits.length === 11 && digits.startsWith("1")) {
      digits = digits.slice(1);
    }
    digits = digits.slice(0, 10);
    if (digits.length === 0) return "";
    if (digits.length <= 3) return `(${digits}`;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  }

  // Check if current signed-in user is the person who posted the shift (works across devices!)
  function isShiftOwner(shift) {
    if (!shift || !state.userProfile) return false;
    if (state.userProfile.id && shift.authorId && state.userProfile.id === shift.authorId) {
      return true;
    }
    if (
      state.userProfile.email &&
      shift.authorEmail &&
      state.userProfile.email.trim().toLowerCase() === shift.authorEmail.trim().toLowerCase()
    ) {
      return true;
    }
    const myDigits = cleanPhoneDigits(state.userProfile.phone);
    const shiftDigits = cleanPhoneDigits(shift.authorPhone);
    if (myDigits && shiftDigits && myDigits.length >= 7 && myDigits === shiftDigits) {
      return true;
    }
    if (
      state.userProfile.name &&
      shift.authorName &&
      state.userProfile.name.trim().toLowerCase() === shift.authorName.trim().toLowerCase() &&
      state.userProfile.email
    ) {
      return true;
    }
    return false;
  }

  // ==========================================================================
  // Supabase Cloud Sync Functions (Shifts & Associates Across Devices)
  // ==========================================================================
  function mapDbRowToShift(row) {
    if (!row) return null;
    if (row.data && typeof row.data === "object") {
      return { ...row.data, id: row.id || row.data.id };
    }
    let rawStatus = String(row.status || "open");
    let offerFromStatus = 0;
    if (rawStatus.startsWith("open$")) {
      offerFromStatus = parseInt(rawStatus.slice(5), 10) || 0;
      rawStatus = "open";
    }
    const offerAmount = Math.max(
      0,
      Math.min(100, parseInt(row.offer_amount ?? row.offerAmount ?? offerFromStatus ?? 0, 10) || 0)
    );
    return {
      id: row.id,
      date: row.date,
      startTime: row.start_time || row.startTime || "16:00",
      endTime: row.end_time || row.endTime || "22:30",
      notes: row.notes || "",
      offerAmount,
      status: rawStatus,
      authorId: row.author_id || row.authorId || "",
      authorName: row.author_name || row.authorName || "Associate",
      authorEmail: row.author_email || row.authorEmail || "",
      authorPhone: row.author_phone || row.authorPhone || "",
      authorLevel: Number(row.author_level || row.authorLevel || 1),
      authorAvatar: row.author_avatar || row.authorAvatar || "👨‍🍳",
      authorAvatarBg: row.author_avatar_bg || row.authorAvatarBg || "#FFE8E6",
      createdAt: row.created_at || row.createdAt || new Date().toISOString()
    };
  }

  function resolveShiftAvatar(shift) {
    if (!shift) return "👨‍🍳";
    if (shift.authorAvatar && String(shift.authorAvatar).startsWith("data:image")) {
      return shift.authorAvatar;
    }
    if (state.userProfile && isShiftOwner(shift) && state.userProfile.avatar) {
      return state.userProfile.avatar;
    }
    const assoc = state.associates.find(
      a =>
        a &&
        ((shift.authorId && a.id === shift.authorId) ||
          (shift.authorEmail && a.email && a.email.trim().toLowerCase() === shift.authorEmail.trim().toLowerCase()))
    );
    if (assoc && assoc.avatar) {
      return assoc.avatar;
    }
    return shift.authorAvatar || "👨‍🍳";
  }

  function mapShiftToDbRow(shift) {
    const offerAmount = Math.max(0, Math.min(100, parseInt(shift.offerAmount || 0, 10) || 0));
    const safeAvatar =
      shift.authorAvatar && !String(shift.authorAvatar).startsWith("data:image")
        ? shift.authorAvatar
        : "👨‍🍳";
    return {
      id: shift.id,
      date: shift.date,
      start_time: shift.startTime,
      end_time: shift.endTime,
      notes: shift.notes || "",
      status: offerAmount > 0 ? `open$${offerAmount}` : "open",
      author_id: shift.authorId,
      author_name: shift.authorName,
      author_email: shift.authorEmail || "",
      author_phone: shift.authorPhone || "",
      author_level: Number(shift.authorLevel || 1),
      author_avatar: safeAvatar,
      author_avatar_bg: shift.authorAvatarBg || "#FFE8E6",
      created_at: shift.createdAt || new Date().toISOString()
    };
  }

  function mapDbRowToAssociate(row) {
    if (!row) return null;
    if (row.data && typeof row.data === "object") {
      return { ...row.data, id: row.id || row.data.id };
    }
    const dev = row.device || { summary: "Web Browser", screen: "N/A", isMobile: false, type: "Desktop" };
    return {
      id: row.id,
      name: row.name,
      email: row.email || "",
      phone: row.phone || "",
      level: Number(row.level || 1),
      avatar: row.avatar || "👨‍🍳",
      avatarBg: row.avatar_bg || row.avatarBg || "#FFE8E6",
      emailVerified: row.email_verified !== false,
      approved: dev.approved !== false,
      joinedAt: row.joined_at || row.joinedAt || new Date().toISOString(),
      device: dev
    };
  }

  function mapAssociateToDbRow(assoc) {
    const dev = {
      ...(assoc.device || detectDeviceDetails()),
      approved: assoc.approved !== false
    };
    return {
      id: assoc.id,
      name: assoc.name,
      email: assoc.email || "",
      phone: assoc.phone || "",
      level: Number(assoc.level || 1),
      avatar: assoc.avatar || "👨‍🍳",
      avatar_bg: assoc.avatarBg || "#FFE8E6",
      email_verified: true,
      joined_at: assoc.joinedAt || new Date().toISOString(),
      device: dev
    };
  }

  async function upsertShiftToSupabase(shift) {
    const dbRow = mapShiftToDbRow(shift);
    try {
      let res = await fetch(`${SUPABASE_REST_URL}/shifts?on_conflict=id`, {
        method: "POST",
        headers: getSupabaseHeaders({ "Prefer": "resolution=merge-duplicates,return=minimal" }),
        body: JSON.stringify(dbRow)
      });
      if (!res.ok) {
        const { author_email, ...fallbackRow } = dbRow;
        res = await fetch(`${SUPABASE_REST_URL}/shifts?on_conflict=id`, {
          method: "POST",
          headers: getSupabaseHeaders({ "Prefer": "resolution=merge-duplicates,return=minimal" }),
          body: JSON.stringify(fallbackRow)
        });
      }
      if (res.ok) {
        state.supabaseConnected = true;
        return true;
      }
    } catch (e) {
      console.warn("Supabase shift upsert error:", e);
    }
    return false;
  }

  async function deleteShiftFromSupabase(shiftId) {
    if (!shiftId) return false;
    markShiftIdDeleted(shiftId);
    try {
      const res = await fetch(`${SUPABASE_REST_URL}/shifts?id=eq.${encodeURIComponent(shiftId)}`, {
        method: "DELETE",
        headers: getSupabaseHeaders({ "Prefer": "return=minimal" })
      });
      if (res.ok) {
        state.supabaseConnected = true;
        return true;
      }
    } catch (e) {
      console.warn("Supabase shift delete error:", e);
    }
    return false;
  }

  async function upsertAssociateToSupabase(assoc) {
    const dbRow = mapAssociateToDbRow(assoc);
    const shiftBackupRow = {
      id: `assoc__${assoc.id}`,
      date: "1970-01-01",
      start_time: "00:00",
      end_time: "00:00",
      notes: JSON.stringify(assoc),
      status: "associate_profile",
      author_id: assoc.id || "",
      author_name: assoc.name || "Associate",
      author_email: assoc.email || "",
      author_phone: assoc.phone || "",
      author_level: Number(assoc.level || 1),
      author_avatar: (assoc.avatar && !assoc.avatar.startsWith("data:image")) ? assoc.avatar : "👨‍🍳",
      author_avatar_bg: assoc.avatarBg || "#FFE8E6",
      created_at: assoc.joinedAt || new Date().toISOString()
    };

    let ok = false;
    try {
      let resShift = await fetch(`${SUPABASE_REST_URL}/shifts?on_conflict=id`, {
        method: "POST",
        headers: getSupabaseHeaders({ "Prefer": "resolution=merge-duplicates,return=minimal" }),
        body: JSON.stringify(shiftBackupRow)
      });
      if (!resShift.ok) {
        const { author_email, ...fallbackRow } = shiftBackupRow;
        resShift = await fetch(`${SUPABASE_REST_URL}/shifts?on_conflict=id`, {
          method: "POST",
          headers: getSupabaseHeaders({ "Prefer": "resolution=merge-duplicates,return=minimal" }),
          body: JSON.stringify(fallbackRow)
        });
      }
      if (resShift.ok) {
        state.supabaseConnected = true;
        ok = true;
      }
    } catch (e) {}

    try {
      const res = await fetch(`${SUPABASE_REST_URL}/associates?on_conflict=id`, {
        method: "POST",
        headers: getSupabaseHeaders({ "Prefer": "resolution=merge-duplicates,return=minimal" }),
        body: JSON.stringify(dbRow)
      });
      if (res.ok) {
        state.supabaseConnected = true;
        ok = true;
      }
    } catch (e) {}
    return ok;
  }

  async function deleteAssociateFromSupabase(assocId) {
    if (!assocId) return false;
    let ok = false;
    try {
      const res1 = await fetch(`${SUPABASE_REST_URL}/shifts?id=eq.${encodeURIComponent(`assoc__${assocId}`)}`, {
        method: "DELETE",
        headers: getSupabaseHeaders({ "Prefer": "return=minimal" })
      });
      if (res1.ok) ok = true;
    } catch (e) {}
    try {
      const res2 = await fetch(`${SUPABASE_REST_URL}/associates?id=eq.${encodeURIComponent(assocId)}`, {
        method: "DELETE",
        headers: getSupabaseHeaders({ "Prefer": "return=minimal" })
      });
      if (res2.ok) ok = true;
    } catch (e) {}
    return ok;
  }

  async function syncFromSupabase() {
    try {
      let shiftBackedAssociates = [];

      // 1. Fetch Shifts (and backed-up Config + Associate Roster) from Supabase
      const shiftsRes = await fetch(`${SUPABASE_REST_URL}/shifts?select=*&order=created_at.desc`, {
        method: "GET",
        cache: "no-store",
        headers: getSupabaseHeaders()
      });

      if (shiftsRes.ok) {
        state.supabaseConnected = true;
        const rows = await shiftsRes.json();

        if (Array.isArray(rows)) {
          // Clean up any old demo seed shifts if they exist in Supabase
          for (const r of rows) {
            if (r && String(r.id).startsWith("seed-438-")) {
              deleteShiftFromSupabase(r.id);
            }
          }

          // A. Check if EmailJS config row is stored in shifts table
          const shiftCfgRow = rows.find(
            r => r && (r.id === SUPABASE_EMAILJS_CONFIG_ID || r.status === "config")
          );
          if (shiftCfgRow) {
            let parsedNotes = {};
            try {
              if (shiftCfgRow.notes && shiftCfgRow.notes.startsWith("{")) {
                parsedNotes = JSON.parse(shiftCfgRow.notes);
              }
            } catch (e) {}
            if (parsedNotes.managerPassword) {
              saveManagerPasswordLocalOnly(parsedNotes.managerPassword);
            }
            const cloudCfg = normalizeEmailJSConfig({
              serviceId: parsedNotes.serviceId || shiftCfgRow.author_name || DEFAULT_EMAILJS.serviceId,
              templateId: parsedNotes.templateId || shiftCfgRow.author_email || DEFAULT_EMAILJS.templateId,
              publicKey: parsedNotes.publicKey || shiftCfgRow.author_phone || DEFAULT_EMAILJS.publicKey
            });
            saveEmailJSConfigLocalOnly(cloudCfg);
          } else {
            const currentCfg = getEmailJSConfig();
            upsertEmailJSConfigToSupabase(currentCfg);
          }

          // B. Extract any Associate Roster profiles stored in shifts table
          const assocShiftRows = rows.filter(
            r => r && (r.status === "associate_profile" || String(r.id).startsWith("assoc__"))
          );
          shiftBackedAssociates = assocShiftRows
            .map(r => {
              try {
                if (r.notes && r.notes.startsWith("{")) {
                  const parsed = JSON.parse(r.notes);
                  return {
                    ...parsed,
                    approved: parsed.approved !== false && parsed.device?.approved !== false
                  };
                }
              } catch (e) {}
              return {
                id: String(r.id).replace(/^assoc__/, ""),
                name: r.author_name || "Associate",
                email: r.author_email || "",
                phone: r.author_phone || "",
                level: Number(r.author_level || 1),
                avatar: r.author_avatar || "👨‍🍳",
                avatarBg: r.author_avatar_bg || "#FFE8E6",
                emailVerified: true,
                approved: true,
                joinedAt: r.created_at || new Date().toISOString(),
                device: { summary: "Web Browser", screen: "N/A", isMobile: false, type: "Desktop" }
              };
            })
            .filter(Boolean);

          // C. Extract Real Shifts — Supabase is 100% single source of truth (even if 0 shifts!)
          const realShiftRows = rows.filter(
            r =>
              r &&
              r.id !== SUPABASE_EMAILJS_CONFIG_ID &&
              r.status !== "config" &&
              r.status !== "associate_profile" &&
              !String(r.id).startsWith("assoc__") &&
              !String(r.id).startsWith("seed-438-")
          );

          const cloudShifts = realShiftRows
            .map(mapDbRowToShift)
            .filter(s => s && s.status !== "claimed");

          state.shifts = cloudShifts;
          saveShiftsLocalOnly(state.shifts);
          updateCountsAndTitle();
          renderCalendarMonth();
          renderWeekView();
        }
      }

      // 2. Fetch Associates Roster & Shared EmailJS Settings from Supabase associates table (if present)
      let tableAssociates = [];
      try {
        const assocRes = await fetch(`${SUPABASE_REST_URL}/associates?select=*&order=joined_at.desc`, {
          method: "GET",
          cache: "no-store",
          headers: getSupabaseHeaders()
        });

        if (assocRes.ok) {
          state.supabaseConnected = true;
          const rows = await assocRes.json();
          if (Array.isArray(rows)) {
            const configRow = rows.find(
              r => r && (r.id === SUPABASE_EMAILJS_CONFIG_ID || r.device?.isSystemConfig === true)
            );
            if (configRow) {
              if (configRow.device?.managerPassword) {
                saveManagerPasswordLocalOnly(configRow.device.managerPassword);
              }
              const cloudCfg = normalizeEmailJSConfig({
                serviceId: configRow.device?.serviceId || configRow.email || DEFAULT_EMAILJS.serviceId,
                templateId: configRow.device?.templateId || configRow.phone || DEFAULT_EMAILJS.templateId,
                publicKey: configRow.device?.publicKey || configRow.avatar || DEFAULT_EMAILJS.publicKey
              });
              saveEmailJSConfigLocalOnly(cloudCfg);
            }

            const personRows = rows.filter(
              r => r && r.id !== SUPABASE_EMAILJS_CONFIG_ID && !r.device?.isSystemConfig
            );
            tableAssociates = personRows.map(mapDbRowToAssociate).filter(Boolean);
          }
        }
      } catch (e) {}

          // Merge associates from both sources by ID/email & purge any legacy fake seed associates
          const mergedMap = new Map();
          // Prefer shiftBackedAssociates first because its JSON notes always preserves full fields including approved status
          for (const a of [...shiftBackedAssociates, ...tableAssociates]) {
            if (!a || !a.id) continue;
            if (isFakeSeedAssociate(a)) {
              deleteAssociateFromSupabase(a.id);
              continue;
            }
            if (!mergedMap.has(a.id)) {
              mergedMap.set(a.id, a);
            }
          }

          if (state.supabaseConnected || mergedMap.size > 0 || state.hasLoadedCloudAssociates) {
            state.hasLoadedCloudAssociates = true;
            state.associates = Array.from(mergedMap.values());
            saveAssociatesLocalOnly(state.associates);

            if (state.userProfile && state.userProfile.email) {
              const match = state.associates.find(
                a =>
                  a.id === state.userProfile.id ||
                  (a.email && a.email.trim().toLowerCase() === state.userProfile.email.trim().toLowerCase())
              );
              if (match) {
                state.userProfile = {
                  ...state.userProfile,
                  id: match.id,
                  name: match.name || state.userProfile.name,
                  email: match.email || state.userProfile.email,
                  phone: match.phone || state.userProfile.phone,
                  level: match.level || state.userProfile.level,
                  avatar: match.avatar || state.userProfile.avatar,
                  avatarBg: match.avatarBg || state.userProfile.avatarBg,
                  approved: match.approved !== false
                };
                try {
                  localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(state.userProfile));
                } catch (e) {}
                updateUserHeaderDisplay();
                updateProfileWarningBanner();
              } else {
                // Associate was removed by manager — log them out and unverify email
                forceLogoutRemovedUser();
              }
            }
          } else if (state.associates.length > 0) {
            state.hasLoadedCloudAssociates = true;
            for (const a of state.associates) {
              if (!isFakeSeedAssociate(a)) {
                upsertAssociateToSupabase(a);
              }
            }
          }

      updateCountsAndTitle();
      renderCalendarMonth();
      renderWeekView();

      const managerModal = document.getElementById("modal-manager-hub");
      if (managerModal && managerModal.classList.contains("active")) {
        const searchVal = document.getElementById("sheet-search-input")?.value || "";
        renderManagerHub(searchVal);
      }
    } catch (e) {
      console.warn("Supabase sync note:", e);
    }
  }

  function setupSupabaseRealtime() {
    if (!supabaseClient || typeof supabaseClient.channel !== "function") return;
    try {
      supabaseClient
        .channel("public-db-changes")
        .on("postgres_changes", { event: "*", schema: "public", table: "shifts" }, () => {
          syncFromSupabase();
        })
        .on("postgres_changes", { event: "*", schema: "public", table: "associates" }, () => {
          syncFromSupabase();
        })
        .subscribe();
    } catch (e) {
      console.warn("Realtime subscription note:", e);
    }
  }

  // ==========================================================================
  // Sound & Confetti
  // ==========================================================================
  function playPop() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(520, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(840, ctx.currentTime + 0.07);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.07);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.07);
    } catch (e) {}
  }

  function playSuccess() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(587.33, now + 0.08);
      osc.frequency.setValueAtTime(880, now + 0.16);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(now + 0.3);
    } catch (e) {}
  }

  function triggerConfetti() {
    const canvas = document.getElementById("confetti-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const pieces = [];
    const colors = ["#C81912", "#FFB81C", "#15803D", "#FFFFFF", "#FF6B6B"];
    for (let i = 0; i < 70; i++) {
      pieces.push({
        x: canvas.width / 2 + (Math.random() * 160 - 80),
        y: canvas.height * 0.45,
        w: Math.random() * 9 + 5,
        h: Math.random() * 6 + 4,
        vx: (Math.random() - 0.5) * 14,
        vy: Math.random() * -12 - 4,
        rot: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 12,
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: 1
      });
    }

    const start = Date.now();
    function render() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const elapsed = Date.now() - start;
      let alive = false;
      for (let p of pieces) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.45;
        p.vx *= 0.98;
        p.rot += p.vRot;
        if (elapsed > 1800) p.opacity -= 0.03;
        if (p.opacity > 0 && p.y < canvas.height + 50) {
          alive = true;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rot * Math.PI) / 180);
          ctx.globalAlpha = Math.max(0, p.opacity);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx.restore();
        }
      }
      if (alive && elapsed < 3000) {
        requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    render();
  }

  function showToast(message, type = "default") {
    const container = document.getElementById("toast-container");
    if (!container) return;
    const toast = document.createElement("div");
    toast.className = `toast ${type === "success" ? "toast-success" : type === "error" ? "toast-error" : ""}`;
    toast.title = "Click or swipe to dismiss";
    const iconSvg = type === "success"
      ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.6"><polyline points="20 6 9 17 4 12"></polyline></svg>`
      : type === "error"
      ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`
      : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFB81C" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`;
    toast.innerHTML = `<span style="display:inline-flex;flex-shrink:0;">${iconSvg}</span> <span style="flex:1;">${message}</span> <span class="toast-close-x" aria-hidden="true">✕</span>`;
    container.appendChild(toast);

    let dismissed = false;
    let autoTimer = null;

    function dismissToast(exitTransform = "translateY(10px) scale(0.95)") {
      if (dismissed) return;
      dismissed = true;
      if (autoTimer) clearTimeout(autoTimer);
      toast.style.transition = "opacity 0.22s ease, transform 0.22s ease";
      toast.style.opacity = "0";
      toast.style.transform = exitTransform;
      toast.style.pointerEvents = "none";
      setTimeout(() => toast.remove(), 220);
    }

    autoTimer = setTimeout(() => dismissToast(), 4000);

    // Click or swipe to dismiss
    let startX = 0;
    let startY = 0;
    let deltaX = 0;
    let deltaY = 0;
    let isDragging = false;

    toast.addEventListener("pointerdown", (e) => {
      if (dismissed) return;
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      deltaX = 0;
      deltaY = 0;
      toast.style.transition = "none";
      try {
        toast.setPointerCapture(e.pointerId);
      } catch (err) {}
    });

    toast.addEventListener("pointermove", (e) => {
      if (!isDragging || dismissed) return;
      deltaX = e.clientX - startX;
      deltaY = e.clientY - startY;
      const dist = Math.hypot(deltaX, deltaY);
      toast.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
      toast.style.opacity = String(Math.max(0.25, 1 - dist / 160));
    });

    function finishGesture() {
      if (!isDragging || dismissed) return;
      isDragging = false;
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);
      // Dismiss on tap/click (small movement) or swipe in any direction
      if (absX < 8 && absY < 8) {
        dismissToast("scale(0.92)");
      } else if (absX > 35 || absY > 28) {
        const outX = absX >= absY ? (deltaX > 0 ? 220 : -220) : deltaX * 1.5;
        const outY = absY > absX ? (deltaY > 0 ? 120 : -120) : deltaY * 1.5;
        dismissToast(`translate(${outX}px, ${outY}px)`);
      } else {
        toast.style.transition = "opacity 0.2s ease, transform 0.2s ease";
        toast.style.transform = "translate(0, 0)";
        toast.style.opacity = "1";
      }
    }

    toast.addEventListener("pointerup", finishGesture);
    toast.addEventListener("pointercancel", finishGesture);
    toast.addEventListener("click", () => dismissToast("scale(0.92)"));
  }

  // ==========================================================================
  // Storage & Roster Sync
  // ==========================================================================
  function loadUserProfile() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_USER);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (isFakeSeedAssociate(parsed)) {
          localStorage.removeItem(STORAGE_KEY_USER);
          return null;
        }
        return parsed;
      }
    } catch (e) {}
    return null;
  }

  function saveUserProfile(profile) {
    state.userProfile = profile;
    try {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(profile));
    } catch (e) {}
    syncUserProfileToRoster(profile);
    updateUserHeaderDisplay();
    updateProfileWarningBanner();
  }

  function loadShifts() {
    // Clear legacy cached local shifts (e.g., stuck local-only shifts on mobile) so Supabase is 100% source of truth
    try {
      localStorage.removeItem(STORAGE_KEY_SHIFTS_LEGACY);
    } catch (e) {}

    try {
      const raw = localStorage.getItem(STORAGE_KEY_SHIFTS);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const active = parsed.filter(
            s =>
              s &&
              s.status !== "claimed" &&
              s.status !== "config" &&
              s.status !== "associate_profile" &&
              !String(s.id).startsWith("seed-438-") &&
              !String(s.id).startsWith("assoc__")
          );
          saveShiftsLocalOnly(active);
          return active;
        }
      }
    } catch (e) {}
    return [];
  }

  function saveShiftsLocalOnly(shifts) {
    state.shifts = shifts;
    try {
      localStorage.setItem(STORAGE_KEY_SHIFTS, JSON.stringify(shifts));
    } catch (e) {
      try {
        const compactShifts = shifts.map(s => ({
          ...s,
          authorAvatar:
            s.authorAvatar && !String(s.authorAvatar).startsWith("data:image")
              ? s.authorAvatar
              : "👨‍🍳"
        }));
        localStorage.setItem(STORAGE_KEY_SHIFTS, JSON.stringify(compactShifts));
      } catch (e2) {}
    }
  }

  function saveShifts(shifts) {
    saveShiftsLocalOnly(shifts);
  }

  function loadAssociatesRoster() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_ROSTER);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter(a => a && !isFakeSeedAssociate(a));
          saveAssociatesLocalOnly(cleaned);
          return cleaned;
        }
      }
    } catch (e) {}
    saveAssociatesLocalOnly([]);
    return [];
  }

  function saveAssociatesLocalOnly(roster) {
    state.associates = roster;
    try {
      localStorage.setItem(STORAGE_KEY_ROSTER, JSON.stringify(roster));
    } catch (e) {
      try {
        const compactRoster = roster.map(a => ({
          ...a,
          avatar:
            a.avatar && !String(a.avatar).startsWith("data:image")
              ? a.avatar
              : "👨‍🍳"
        }));
        localStorage.setItem(STORAGE_KEY_ROSTER, JSON.stringify(compactRoster));
      } catch (e2) {}
    }
  }

  function saveAssociatesRoster(roster) {
    saveAssociatesLocalOnly(roster);
  }

  function forceLogoutRemovedUser() {
    state.userProfile = null;
    state.isEmailVerified = false;
    state.verifiedEmail = "";
    state.pendingVerification = null;
    try {
      localStorage.removeItem(STORAGE_KEY_USER);
    } catch (e) {}
    updateUserHeaderDisplay();
    updateProfileWarningBanner();
    const verifiedChip = document.getElementById("email-verified-chip");
    if (verifiedChip) verifiedChip.style.display = "none";
  }

  // Sync user profile into roster & Supabase
  function syncUserProfileToRoster(profile) {
    if (!profile || !profile.email) return;
    const existingIdx = state.associates.findIndex(
      a => a.id === profile.id || (a.email && a.email.toLowerCase() === profile.email.toLowerCase())
    );
    const dev = profile.device || detectDeviceDetails();
    const isApproved = profile.approved !== undefined
      ? profile.approved
      : (existingIdx !== -1 ? state.associates[existingIdx].approved !== false : false);
    const fullParts = (profile.name || "").trim().split(/\s+/);
    const firstName = profile.firstName !== undefined ? profile.firstName : (fullParts[0] || "");
    const lastName = profile.lastName !== undefined ? profile.lastName : (fullParts.slice(1).join(" ") || "");

    const record = {
      id: existingIdx !== -1 ? state.associates[existingIdx].id : profile.id,
      name: profile.name,
      firstName,
      lastName,
      email: profile.email,
      phone: profile.phone,
      level: profile.level,
      avatar: profile.avatar || "👨‍🍳",
      avatarBg: profile.avatarBg || "#FFE8E6",
      emailVerified: true,
      approved: isApproved,
      joinedAt: profile.joinedAt || new Date().toISOString(),
      device: { ...dev, approved: isApproved, firstName, lastName }
    };

    // Ensure profile uses the canonical ID and approval status from roster if matched by email across devices
    profile.id = record.id;
    profile.approved = isApproved;
    profile.firstName = firstName;
    profile.lastName = lastName;
    try {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(profile));
    } catch (e) {}

    if (existingIdx !== -1) {
      state.associates[existingIdx] = { ...state.associates[existingIdx], ...record };
    } else {
      state.associates.unshift(record);
    }
    saveAssociatesRoster(state.associates);
    upsertAssociateToSupabase(record);
  }

  // Permanent Shift Removal Helper (Used by Shift Owner "Cover Shift" & Manager "Delete")
  async function permanentlyRemoveShift(shiftId, toastMsg, withConfetti = false) {
    const shift = state.shifts.find(s => s.id === shiftId);
    if (!shift) return;

    state.shifts = state.shifts.filter(s => s.id !== shiftId);
    saveShifts(state.shifts);
    deleteShiftFromSupabase(shiftId);

    if (withConfetti) {
      playSuccess();
      triggerConfetti();
    } else {
      playPop();
    }

    showToast(toastMsg, "success");
    closeModal(document.getElementById("modal-shift-details"));
    updateCountsAndTitle();
    state.currentView === "month" ? renderCalendarMonth() : renderWeekView();
  }

  // ==========================================================================
  // Formatting Helpers
  // ==========================================================================
  function formatTime12h(timeStr) {
    if (!timeStr) return "";
    const [hStr, mStr] = timeStr.split(":");
    let h = parseInt(hStr, 10);
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${h}:${mStr} ${ampm}`;
  }

  function calculateDurationHours(start, end) {
    if (!start || !end) return 0;
    const [h1, m1] = start.split(":").map(Number);
    const [h2, m2] = end.split(":").map(Number);
    let min1 = h1 * 60 + m1;
    let min2 = h2 * 60 + m2;
    if (min2 < min1) min2 += 24 * 60;
    return Math.round(((min2 - min1) / 60) * 100) / 100;
  }

  function formatDateHuman(dateKey) {
    const [y, m, d] = dateKey.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    return dt.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  }

  function formatDateTimeReadable(isoStr) {
    if (!isoStr) return "N/A";
    const d = new Date(isoStr);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });
  }

  function formatPeriodTitle(date, view) {
    if (view === "month") {
      return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    } else {
      const startOfWeek = getStartOfWeek(date);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      const m1 = startOfWeek.toLocaleDateString("en-US", { month: "short" });
      const d1 = startOfWeek.getDate();
      const m2 = endOfWeek.toLocaleDateString("en-US", { month: "short" });
      const d2 = endOfWeek.getDate();
      const y = endOfWeek.getFullYear();
      if (m1 === m2) return `${m1} ${d1} – ${d2}, ${y}`;
      return `${m1} ${d1} – ${m2} ${d2}, ${y}`;
    }
  }

  function getStartOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay();
    d.setDate(d.getDate() - day);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function getFilteredShifts() {
    return state.shifts.filter(shift => {
      if (shift.status === "claimed") return false;
      if (state.filterMineOnly) {
        if (!isShiftOwner(shift)) return false;
      }
      const shiftLvlStr = String(shift.authorLevel);
      if (!state.selectedLevels.has(shiftLvlStr)) return false;
      return true;
    });
  }

  // ==========================================================================
  // UI Updates & Admin Display
  // ==========================================================================
  function updateUserHeaderDisplay() {
    const nameEl = document.getElementById("header-user-name");
    const levelEl = document.getElementById("header-user-level");
    const avatarEl = document.getElementById("header-avatar");

    if (!hasCompleteProfile()) {
      if (nameEl) nameEl.textContent = "Set Profile";
      if (levelEl) levelEl.textContent = "Required";
      if (avatarEl) avatarEl.innerHTML = VECTOR_AVATARS["👤"];
      return;
    }

    if (nameEl) nameEl.textContent = state.userProfile.name;
    if (levelEl) {
      levelEl.textContent = state.userProfile.approved === false
        ? "Pending Approval"
        : `Level ${state.userProfile.level}`;
    }
    if (avatarEl) {
      avatarEl.innerHTML = renderAvatarMarkup(state.userProfile.avatar, state.userProfile.name);
    }
  }

  function updateAdminHeaderDisplay() {
    const brandBtn = document.getElementById("btn-brand-home");

    if (brandBtn) {
      brandBtn.title = state.isAdmin
        ? "👑 Store Manager Mode • Tap Logo for Manager Dashboard"
        : "Tap for Home • Hold 1s for Manager Login";
    }
  }

  function updateProfileWarningBanner() {
    const banner = document.getElementById("profile-warning-banner");
    if (!banner) return;
    const bannerText = banner.querySelector(".banner-text");
    const bannerBtn = document.getElementById("btn-banner-setup");

    if (!hasCompleteProfile()) {
      banner.style.display = "block";
      if (bannerText) {
        bannerText.innerHTML = `<strong>Setup Required:</strong> You must set your <strong>Name, Phone & Level (with verified email)</strong> before adding shifts.`;
      }
      if (bannerBtn) {
        bannerBtn.style.display = "inline-block";
        bannerBtn.textContent = "Complete Profile";
      }
    } else if (!isApprovedProfile()) {
      banner.style.display = "block";
      if (bannerText) {
        bannerText.innerHTML = `<strong>Pending Manager Approval:</strong> Your account request has been sent to the manager. Once approved, you'll be able to view coworker numbers and post shifts.`;
      }
      if (bannerBtn) {
        bannerBtn.style.display = "none";
      }
    } else {
      banner.style.display = "none";
    }
  }

  function updateCountsAndTitle() {
    const openCount = state.shifts.filter(s => s.status !== "claimed").length;
    const countEl = document.getElementById("open-shifts-count");
    if (countEl) countEl.textContent = openCount;

    const periodTitle = document.getElementById("current-period-title");
    if (periodTitle) {
      periodTitle.textContent = formatPeriodTitle(state.activeDate, state.currentView);
    }
  }

  // ==========================================================================
  // Calendar Month View
  // ==========================================================================
  function getDefaultSelectedDayForMonth(year, month, shiftMap, preserveUserSelected = true) {
    const todayKey = formatDateKey(new Date());
    const monthPrefix = `${year}-${String(month + 1).padStart(2, "0")}-`;
    const monthShiftDates = Object.keys(shiftMap)
      .filter(d => d.startsWith(monthPrefix) && shiftMap[d].length > 0)
      .sort();

    let selectedDay = state.selectedCalendarDay;
    if (monthShiftDates.length > 0) {
      const selectedInMonth = selectedDay && selectedDay.startsWith(monthPrefix);
      const selectedHasShifts = (shiftMap[selectedDay] || []).length > 0;
      if (!selectedInMonth || (!preserveUserSelected && !selectedHasShifts)) {
        const upcomingInMonth = monthShiftDates.find(d => d >= todayKey);
        selectedDay = upcomingInMonth || monthShiftDates[0];
      }
    } else if (!selectedDay || !selectedDay.startsWith(monthPrefix)) {
      selectedDay = todayKey.startsWith(monthPrefix) ? todayKey : `${monthPrefix}01`;
    }
    return selectedDay;
  }

  function populateCalendarMonthGrid(grid, dateObj, isPreview = false) {
    if (!grid) return;
    grid.innerHTML = "";

    const year = dateObj.getFullYear();
    const month = dateObj.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDayOfWeek = firstDay.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    const todayKey = formatDateKey(new Date());

    const filteredShifts = getFilteredShifts();
    const shiftMap = {};
    filteredShifts.forEach(s => {
      if (!shiftMap[s.date]) shiftMap[s.date] = [];
      shiftMap[s.date].push(s);
    });

    const selectedDay = getDefaultSelectedDayForMonth(
      year,
      month,
      shiftMap,
      isPreview ? false : state.userSelectedCalendarDay
    );
    if (!isPreview) {
      state.selectedCalendarDay = selectedDay;
    }

    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month - 1, prevMonthLastDay - i);
      const dateKey = formatDateKey(prevDate);
      grid.appendChild(createDayCell(prevDate, dateKey, true, shiftMap[dateKey] || [], todayKey, selectedDay));
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const curDate = new Date(year, month, day);
      const dateKey = formatDateKey(curDate);
      grid.appendChild(createDayCell(curDate, dateKey, false, shiftMap[dateKey] || [], todayKey, selectedDay));
    }

    const totalSoFar = startDayOfWeek + daysInMonth;
    const targetTotal = totalSoFar > 35 ? 42 : 35;
    for (let day = 1; day <= targetTotal - totalSoFar; day++) {
      const nextDate = new Date(year, month + 1, day);
      const dateKey = formatDateKey(nextDate);
      grid.appendChild(createDayCell(nextDate, dateKey, true, shiftMap[dateKey] || [], todayKey, selectedDay));
    }
  }

  function renderCalendarMonth() {
    const grid = document.getElementById("calendar-days-grid");
    if (!grid) return;
    populateCalendarMonthGrid(grid, state.activeDate, false);
    renderSelectedDayPanel();
  }

  function createDayCell(dateObj, dateKey, isOtherMonth, shiftsOnDay, todayKey, selectedDay = state.selectedCalendarDay) {
    const cell = document.createElement("div");
    cell.className = `calendar-day-cell ${isOtherMonth ? "other-month" : ""} ${dateKey === todayKey ? "is-today" : ""} ${dateKey === selectedDay ? "selected" : ""}`;
    cell.dataset.date = dateKey;

    const header = document.createElement("div");
    header.className = "day-header";

    const num = document.createElement("span");
    num.className = "day-number";
    num.textContent = dateObj.getDate();
    header.appendChild(num);

    if (shiftsOnDay.length > 0) {
      const badge = document.createElement("span");
      badge.className = "day-shifts-count-badge";
      badge.textContent = `${shiftsOnDay.length} shift${shiftsOnDay.length > 1 ? "s" : ""}`;
      header.appendChild(badge);
    }
    cell.appendChild(header);

    // Mobile-friendly compact indicator (dots + count pill + offer tag if > $0)
    if (shiftsOnDay.length > 0) {
      const mobileIndicator = document.createElement("div");
      mobileIndicator.className = "mobile-day-indicator";

      const dotsWrap = document.createElement("div");
      dotsWrap.className = "mobile-day-dots";
      shiftsOnDay.slice(0, 4).forEach(s => {
        const dot = document.createElement("span");
        dot.className = `mobile-level-dot l${s.authorLevel}`;
        dotsWrap.appendChild(dot);
      });
      mobileIndicator.appendChild(dotsWrap);

      const countPill = document.createElement("span");
      countPill.className = "mobile-day-count";
      countPill.textContent = `${shiftsOnDay.length} shift${shiftsOnDay.length > 1 ? "s" : ""}`;
      mobileIndicator.appendChild(countPill);

      const maxOffer = Math.max(0, ...shiftsOnDay.map(s => Number(s.offerAmount) || 0));
      if (maxOffer > 0) {
        const offerPill = document.createElement("span");
        offerPill.className = "mobile-day-offer";
        offerPill.textContent = `$${maxOffer}`;
        mobileIndicator.appendChild(offerPill);
      }

      cell.appendChild(mobileIndicator);
    }

    const shiftsContainer = document.createElement("div");
    shiftsContainer.className = "day-shifts-container";

    shiftsOnDay.slice(0, 3).forEach(shift => {
      const offerAmount = Number(shift.offerAmount) || 0;
      const chip = document.createElement("div");
      chip.className = "mini-shift-chip";
      chip.title = `${shift.authorName} (Level ${shift.authorLevel}) ${formatTime12h(shift.startTime)} - ${formatTime12h(shift.endTime)}${offerAmount > 0 ? ` • Offering $${offerAmount}` : ""}`;

      const timeSpan = document.createElement("span");
      timeSpan.className = "mini-shift-time";
      timeSpan.textContent = formatTime12h(shift.startTime).replace(":00", "");

      const nameSpan = document.createElement("span");
      nameSpan.className = "mini-shift-name";
      nameSpan.textContent = `${shift.authorName.split(" ")[0]} (Level ${shift.authorLevel})`;

      chip.appendChild(timeSpan);
      chip.appendChild(nameSpan);

      if (offerAmount > 0) {
        const offerSpan = document.createElement("span");
        offerSpan.className = "mini-shift-offer";
        offerSpan.textContent = `$${offerAmount}`;
        chip.appendChild(offerSpan);
      }

      chip.addEventListener("click", (e) => {
        e.stopPropagation();
        openShiftDetailsModal(shift.id);
      });

      shiftsContainer.appendChild(chip);
    });

    if (shiftsOnDay.length > 3) {
      const more = document.createElement("div");
      more.className = "mini-shift-chip";
      more.style.background = "#FFF8E6";
      more.style.color = "#7B5200";
      more.textContent = `+${shiftsOnDay.length - 3} more`;
      shiftsContainer.appendChild(more);
    }

    cell.appendChild(shiftsContainer);

    cell.addEventListener("click", () => {
      if (state.didJustSwipe) return;
      playPop();
      state.userSelectedCalendarDay = true;
      state.selectedCalendarDay = dateKey;
      document.querySelectorAll(".calendar-day-cell").forEach(c => c.classList.remove("selected"));
      cell.classList.add("selected");
      renderSelectedDayPanel();

      if (window.innerWidth <= 768) {
        document.getElementById("selected-day-panel")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    });

    return cell;
  }

  function renderSelectedDayPanel() {
    const panel = document.getElementById("selected-day-panel");
    const title = document.getElementById("selected-day-title");
    const badge = document.getElementById("selected-day-badge");
    const list = document.getElementById("selected-day-shifts-list");
    if (!panel || !list) return;

    const dateKey = state.selectedCalendarDay;
    const isToday = dateKey === formatDateKey(new Date());

    if (badge) badge.textContent = isToday ? "Today's Shifts" : "Selected Date";
    if (title) title.textContent = formatDateHuman(dateKey);

    const shiftsOnDay = getFilteredShifts().filter(s => s.date === dateKey);
    list.innerHTML = "";

    if (shiftsOnDay.length === 0) {
      list.innerHTML = `
        <div class="empty-day-state">
          <div class="empty-day-icon">${VECTOR_AVATARS["🌴"]}</div>
          <div class="empty-day-title">No Shifts Posted for This Day</div>
          <p class="empty-day-desc">Need coverage for this date? Post your shift to let Store #438 coworkers pick it up or trade!</p>
        </div>
      `;
      return;
    }

    shiftsOnDay.forEach(shift => {
      list.appendChild(createShiftCardElement(shift, false));
    });
  }

  // ==========================================================================
  // Weekly View
  // ==========================================================================
  function populateWeekGrid(grid, dateObj) {
    if (!grid) return;
    grid.innerHTML = "";

    const startOfWeek = getStartOfWeek(dateObj);
    const todayKey = formatDateKey(new Date());
    const filteredShifts = getFilteredShifts();
    const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

    for (let i = 0; i < 7; i++) {
      const curDay = new Date(startOfWeek);
      curDay.setDate(startOfWeek.getDate() + i);
      const dateKey = formatDateKey(curDay);
      const isToday = dateKey === todayKey;

      const column = document.createElement("div");
      column.className = `week-day-column ${isToday ? "is-today" : ""}`;

      const shortMonth = curDay.toLocaleDateString("en-US", { month: "short" });
      const shiftsOnDay = filteredShifts.filter(s => s.date === dateKey);

      const colHeader = document.createElement("div");
      colHeader.className = "week-col-header";
      colHeader.innerHTML = `
        <div class="week-col-header-left">
          <span class="week-col-day-name">${dayNames[i]}</span>
          <span class="week-col-date-num">${curDay.getDate()}</span>
          <span class="week-col-month-label">${shortMonth} ${curDay.getDate()}${isToday ? " • Today" : ""}</span>
        </div>
        <button type="button" class="week-col-add-btn" title="Post shift for ${shortMonth} ${curDay.getDate()}">+ Post</button>
      `;
      colHeader.querySelector(".week-col-add-btn")?.addEventListener("click", (e) => {
        e.stopPropagation();
        openPostShiftModal(dateKey);
      });
      column.appendChild(colHeader);

      const shiftsList = document.createElement("div");
      shiftsList.className = `week-col-shifts-list ${shiftsOnDay.length === 0 ? "is-empty" : ""}`;

      if (shiftsOnDay.length === 0) {
        const empty = document.createElement("div");
        empty.className = "week-empty-state";
        empty.innerHTML = `<span>No shifts posted</span><button type="button" class="btn-pill-small">+ Post</button>`;
        empty.querySelector("button")?.addEventListener("click", () => {
          openPostShiftModal(dateKey);
        });
        shiftsList.appendChild(empty);
      } else {
        shiftsOnDay.forEach(shift => {
          shiftsList.appendChild(createShiftCardElement(shift, true));
        });
      }

      column.appendChild(shiftsList);
      grid.appendChild(column);
    }
  }

  function renderWeekView() {
    const grid = document.getElementById("week-columns-grid");
    if (!grid) return;
    populateWeekGrid(grid, state.activeDate);
  }

  // ==========================================================================
  // Shift Card Component
  // ==========================================================================
  function createShiftCardElement(shift, isWeekly = false) {
    const card = document.createElement("div");
    card.className = "shift-card";
    card.dataset.shiftId = shift.id;

    const duration = calculateDurationHours(shift.startTime, shift.endTime);
    const avatarMarkup = renderAvatarMarkup(resolveShiftAvatar(shift), shift.authorName);

    const badgeLabel = `Level ${shift.authorLevel}`;
    const isMine = isShiftOwner(shift);
    const offerAmount = Number(shift.offerAmount) || 0;

    card.innerHTML = `
      <div class="shift-card-top">
        <div class="shift-author-wrap">
          <div class="shift-avatar-circle" style="background: ${shift.authorAvatarBg || '#FFE8E6'}">
            ${avatarMarkup}
          </div>
          <div class="shift-author-details">
            <div class="shift-author-name" title="${shift.authorName}">${shift.authorName}</div>
          </div>
        </div>
        <div class="shift-card-badges">
          ${offerAmount > 0 ? `<div class="shift-offer-badge" title="Offering $${offerAmount} to take this shift">$${offerAmount}</div>` : ""}
          <div class="level-badge l${shift.authorLevel}">
            ${badgeLabel}
          </div>
        </div>
      </div>

      <div class="shift-time-banner">
        <div class="shift-time-range">
          ${formatTime12h(shift.startTime)} – ${formatTime12h(shift.endTime)}
        </div>
        <div class="shift-duration-pill">${duration} hrs</div>
      </div>

      ${shift.notes ? `<p class="shift-card-note">“${shift.notes}”</p>` : ""}

      <div class="shift-card-footer">
        <div class="shift-status-indicator">
          <span class="status-dot-open"></span>
          <span>${isMine ? "Your Shift Post" : "Available"}</span>
        </div>
        <div style="display:flex; align-items:center; gap:0.4rem;">
          ${(isMine || state.isAdmin) ? `<button type="button" class="btn-card-edit" title="Edit shift details"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg> Edit</button>` : ""}
          ${state.isAdmin ? `<button type="button" class="btn-card-delete" title="Manager: Delete this shift"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path></svg> Delete</button>` : ""}
          <span class="btn-card-action">Details →</span>
        </div>
      </div>
    `;

    // Quick-edit button right on the card
    const editBtn = card.querySelector(".btn-card-edit");
    if (editBtn) {
      editBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        playPop();
        openPostShiftModal(null, shift);
      });
    }

    // Manager quick-delete button right on the card
    const deleteBtn = card.querySelector(".btn-card-delete");
    if (deleteBtn) {
      deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (confirm(`👑 Store Manager Action: Permanently delete ${shift.authorName}'s shift on ${formatDateHuman(shift.date)}?`)) {
          permanentlyRemoveShift(shift.id, `Deleted ${shift.authorName}'s shift from the board.`, false);
        }
      });
    }

    card.addEventListener("click", () => {
      playPop();
      openShiftDetailsModal(shift.id);
    });

    return card;
  }

  // ==========================================================================
  // Modal: Shift Details
  // ==========================================================================
  function openShiftDetailsModal(shiftId) {
    const shift = state.shifts.find(s => s.id === shiftId);
    if (!shift) return;

    state.selectedShiftId = shiftId;
    const modal = document.getElementById("modal-shift-details");
    const duration = calculateDurationHours(shift.startTime, shift.endTime);

    const avatarEl = document.getElementById("detail-associate-avatar");
    if (avatarEl) {
      avatarEl.innerHTML = renderAvatarMarkup(resolveShiftAvatar(shift), shift.authorName);
      avatarEl.style.background = shift.authorAvatarBg || "#FFF8E6";
    }

    const nameEl = document.getElementById("detail-associate-name");
    if (nameEl) nameEl.textContent = shift.authorName;

    const pill = document.getElementById("detail-level-pill");
    if (pill) pill.textContent = `Level ${shift.authorLevel}`;

    const dateEl = document.getElementById("detail-shift-date");
    const hoursEl = document.getElementById("detail-shift-hours");
    const durEl = document.getElementById("detail-shift-duration");
    if (dateEl) dateEl.textContent = formatDateHuman(shift.date);
    if (hoursEl) hoursEl.textContent = `${formatTime12h(shift.startTime)} – ${formatTime12h(shift.endTime)}`;
    if (durEl) durEl.textContent = `${duration} hrs`;

    const offerContainer = document.getElementById("detail-offer-container");
    const offerText = document.getElementById("detail-shift-offer");
    const offerAmount = Number(shift.offerAmount) || 0;
    if (offerAmount > 0) {
      if (offerContainer) offerContainer.style.display = "flex";
      if (offerText) offerText.textContent = `$${offerAmount}`;
    } else {
      if (offerContainer) offerContainer.style.display = "none";
    }

    const notesContainer = document.getElementById("detail-notes-container");
    const notesText = document.getElementById("detail-shift-notes");
    if (shift.notes && shift.notes.trim()) {
      if (notesContainer) notesContainer.style.display = "flex";
      if (notesText) notesText.textContent = `“${shift.notes}”`;
    } else {
      if (notesContainer) notesContainer.style.display = "none";
    }

    const phoneEl = document.getElementById("detail-associate-phone");
    const copyPhoneBtn = document.getElementById("btn-copy-phone");
    const callBtn = document.getElementById("btn-direct-call");
    const smsBtn = document.getElementById("btn-direct-sms");
    const loginPromptBtn = document.getElementById("btn-login-to-contact");
    const loginPromptText = document.getElementById("login-to-contact-text");

    const canViewContact = state.isAdmin || isApprovedProfile();

    if (canViewContact) {
      if (phoneEl) phoneEl.textContent = shift.authorPhone || "No phone listed";
      if (copyPhoneBtn) copyPhoneBtn.style.display = "inline-flex";

      const rawDigits = cleanPhoneDigits(shift.authorPhone || "");
      if (callBtn) {
        callBtn.style.display = "inline-flex";
        callBtn.href = rawDigits ? `tel:${rawDigits}` : "#";
      }
      if (smsBtn) {
        smsBtn.style.display = "inline-flex";
        const shiftTimeOnlyMsg = encodeURIComponent(
          `Hey ${shift.authorName}, about your ${formatDateHuman(shift.date)} shift (${formatTime12h(shift.startTime)} - ${formatTime12h(shift.endTime)}): `
        );
        smsBtn.href = rawDigits ? `sms:${rawDigits}?&body=${shiftTimeOnlyMsg}` : "#";
      }
      if (loginPromptBtn) loginPromptBtn.style.display = "none";
    } else {
      const isPending = hasCompleteProfile() && !isApprovedProfile();
      if (phoneEl) {
        phoneEl.textContent = isPending
          ? "Pending manager approval to view number"
          : "Log in to view phone number";
      }
      if (copyPhoneBtn) copyPhoneBtn.style.display = "none";
      if (callBtn) {
        callBtn.style.display = "none";
        callBtn.href = "#";
      }
      if (smsBtn) {
        smsBtn.style.display = "none";
        smsBtn.href = "#";
      }
      if (loginPromptBtn) {
        loginPromptBtn.style.display = "inline-flex";
        if (loginPromptText) {
          loginPromptText.textContent = isPending
            ? "Account Pending Manager Approval"
            : "Log in to message or claim";
        }
      }
    }

    // ONLY the person who posted the shift (or Manager) can edit it; ONLY the poster can mark as "Cover Shift"
    const isMine = isShiftOwner(shift);
    const editShiftBtn = document.getElementById("btn-edit-shift");
    if (editShiftBtn) {
      editShiftBtn.style.display = (isMine || state.isAdmin) ? "inline-flex" : "none";
    }
    const coveredBtn = document.getElementById("btn-shift-covered");
    if (coveredBtn) {
      coveredBtn.style.display = isMine ? "inline-flex" : "none";
    }

    // When signed in as a Manager, allow deleting ANY shift
    const ownerRow = document.getElementById("owner-actions-row");
    const adminTag = document.getElementById("admin-takedown-badge");
    if (ownerRow) {
      if (state.isAdmin) {
        ownerRow.style.display = "block";
        if (adminTag) adminTag.style.display = "inline-block";
      } else {
        ownerRow.style.display = "none";
      }
    }

    openModal(modal);
  }

  // ==========================================================================
  // Modal: Post / Edit Shift
  // ==========================================================================
  function openPostShiftModal(prefilledDate = null, shiftToEdit = null) {
    if (!shiftToEdit && !hasCompleteProfile()) {
      showToast("Setup Required: Please complete your profile with verified email before posting a shift!", "error");
      openProfileModal(true);
      return;
    }
    if (!shiftToEdit && !state.isAdmin && !isApprovedProfile()) {
      showToast("Your account request is pending manager approval before you can post shifts.", "default");
      return;
    }

    state.editingShiftId = shiftToEdit ? shiftToEdit.id : null;

    const modal = document.getElementById("modal-post-shift");
    const modalBadge = document.getElementById("post-shift-modal-badge");
    const modalTitle = document.getElementById("post-shift-modal-title");
    const modalSub = document.getElementById("post-shift-modal-sub");
    const submitText = document.getElementById("btn-submit-shift-text");
    const dateInput = document.getElementById("post-date");
    const startTimeInput = document.getElementById("post-start-time");
    const endTimeInput = document.getElementById("post-end-time");
    const notesInput = document.getElementById("post-notes");
    const durationLabel = document.getElementById("post-calc-duration");
    const offerSlider = document.getElementById("post-offer-slider");
    const offerDisplay = document.getElementById("post-offer-display");

    if (shiftToEdit) {
      if (modalBadge) modalBadge.textContent = "EDIT SHIFT";
      if (modalTitle) modalTitle.textContent = "Edit Shift Details";
      if (modalSub) modalSub.textContent = "Update your shift date, time, cash offer, or coworker note.";
      if (submitText) submitText.textContent = "Save Shift Changes";

      if (dateInput) dateInput.value = shiftToEdit.date || formatDateKey(new Date());
      if (startTimeInput) startTimeInput.value = shiftToEdit.startTime || "16:00";
      if (endTimeInput) endTimeInput.value = shiftToEdit.endTime || "22:30";
      if (notesInput) notesInput.value = shiftToEdit.notes || "";
      if (offerSlider) offerSlider.value = String(Math.max(0, Math.min(100, parseInt(shiftToEdit.offerAmount || 0, 10) || 0)));
    } else {
      if (modalBadge) modalBadge.textContent = "STORE #438";
      if (modalTitle) modalTitle.textContent = "Post a Shift to Cover or Trade";
      if (modalSub) modalSub.textContent = "Drop your shift so your coworkers can see it and text/call you.";
      if (submitText) submitText.textContent = "Post Shift to Board";

      const targetDate = prefilledDate || state.selectedCalendarDay || formatDateKey(new Date());
      if (dateInput) dateInput.value = targetDate;
      if (startTimeInput) startTimeInput.value = "16:00";
      if (endTimeInput) endTimeInput.value = "22:30";
      if (notesInput) notesInput.value = "";
      if (offerSlider) offerSlider.value = "0";
    }

    function updateHelperDuration() {
      if (durationLabel && startTimeInput && endTimeInput) {
        const dur = calculateDurationHours(startTimeInput.value, endTimeInput.value);
        durationLabel.textContent = `${dur} hours`;
      }
    }

    function updateOfferDisplay() {
      if (!offerSlider || !offerDisplay) return;
      const val = parseInt(offerSlider.value, 10) || 0;
      if (val > 0) {
        offerDisplay.textContent = `Offering $${val}`;
        offerDisplay.classList.remove("is-zero");
      } else {
        offerDisplay.textContent = "$0 (No Offer)";
        offerDisplay.classList.add("is-zero");
      }
    }

    if (offerSlider) {
      offerSlider.oninput = updateOfferDisplay;
    }
    updateOfferDisplay();

    if (startTimeInput) startTimeInput.oninput = updateHelperDuration;
    if (endTimeInput) endTimeInput.oninput = updateHelperDuration;
    updateHelperDuration();

    openModal(modal);
  }

  // ==========================================================================
  // Modal: Profile Setup & EmailJS Verification
  // ==========================================================================
  function splitFullName(fullName = "") {
    const parts = String(fullName || "").trim().split(/\s+/).filter(Boolean);
    return {
      firstName: parts[0] || "",
      lastName: parts.slice(1).join(" ") || ""
    };
  }

  function updateSaveProfileButtonState() {
    const btnSave = document.getElementById("btn-save-profile");
    const btnText = document.getElementById("btn-save-profile-text");
    const emailInput = document.getElementById("profile-email");
    const curEmail = (emailInput?.value || "").trim().toLowerCase();

    const isVerified = !!(
      state.isEmailVerified &&
      state.verifiedEmail &&
      curEmail &&
      state.verifiedEmail.toLowerCase() === curEmail
    );

    if (btnSave) {
      btnSave.disabled = !isVerified;
      btnSave.classList.toggle("is-disabled", !isVerified);
    }

    if (btnText) {
      const existingAssoc = curEmail
        ? state.associates.find(a => a.email && a.email.trim().toLowerCase() === curEmail)
        : null;
      const isAlreadyApproved = existingAssoc
        ? existingAssoc.approved !== false
        : (state.userProfile?.approved === true);

      btnText.textContent = isAlreadyApproved ? "Save Profile" : "Request to Join";
    }
  }

  function autoSaveProfileIfVerified(triggerEmailNotificationIfNew = false) {
    const emailInput = document.getElementById("profile-email");
    const curEmail = (emailInput?.value || "").trim();
    if (
      !state.isEmailVerified ||
      !state.verifiedEmail ||
      !curEmail ||
      state.verifiedEmail.toLowerCase() !== curEmail.toLowerCase()
    ) {
      return null;
    }

    const firstInput = document.getElementById("profile-first-name");
    const lastInput = document.getElementById("profile-last-name");
    const phoneInput = document.getElementById("profile-phone");
    const levelSelect = document.getElementById("profile-level");

    const existingAssoc = state.associates.find(
      a => a.email && a.email.trim().toLowerCase() === curEmail.toLowerCase()
    );

    const existingNames = splitFullName(existingAssoc?.name || state.userProfile?.name || "");
    const firstName = (firstInput?.value || "").trim() || existingAssoc?.firstName || state.userProfile?.firstName || existingNames.firstName;
    const lastName = (lastInput?.value || "").trim() || existingAssoc?.lastName || state.userProfile?.lastName || existingNames.lastName;
    const fullName = [firstName, lastName].filter(Boolean).join(" ").trim() || existingAssoc?.name || state.userProfile?.name || "";
    const rawPhone = (phoneInput?.value || "").trim();
    const phone = formatPhoneNumberLive(rawPhone) || rawPhone || existingAssoc?.phone || state.userProfile?.phone || "";
    const level = parseInt(levelSelect?.value, 10) || existingAssoc?.level || state.userProfile?.level || 1;

    let finalAvatar = "👨‍🍳";
    let finalAvatarBg = "#FFE8E6";

    if (state.uploadedAvatarDataUrl) {
      finalAvatar = state.uploadedAvatarDataUrl;
    } else if (!state.selectedAvatarPreset && state.userProfile?.avatar?.startsWith("data:image")) {
      finalAvatar = state.userProfile.avatar;
    } else {
      const preset = PRESET_AVATARS.find(p => p.id === state.selectedAvatarPreset) || PRESET_AVATARS[0];
      finalAvatar = preset.emoji;
      finalAvatarBg = preset.bg;
    }

    const isAlreadyApproved = existingAssoc
      ? existingAssoc.approved !== false
      : (state.userProfile?.approved === true);

    const dev = detectDeviceDetails();
    const updatedProfile = {
      id: existingAssoc?.id || state.userProfile?.id || `user-438-${Date.now()}`,
      name: fullName,
      firstName,
      lastName,
      email: curEmail,
      phone,
      level,
      avatar: finalAvatar,
      avatarBg: finalAvatarBg,
      approved: isAlreadyApproved,
      joinedAt: existingAssoc?.joinedAt || state.userProfile?.joinedAt || new Date().toISOString(),
      device: { ...dev, approved: isAlreadyApproved, firstName, lastName }
    };

    saveUserProfile(updatedProfile);

    const phoneDigits = String(phone || "").replace(/\D/g, "");
    if (
      triggerEmailNotificationIfNew &&
      !isAlreadyApproved &&
      firstName &&
      lastName &&
      phoneDigits.length >= 10 &&
      state.lastNotifiedRequestEmail !== curEmail.toLowerCase()
    ) {
      state.lastNotifiedRequestEmail = curEmail.toLowerCase();
      sendManagerAccountRequestEmail(updatedProfile);
    }

    return updatedProfile;
  }

  function openProfileModal(isPromptForPost = false) {
    const modal = document.getElementById("modal-profile");
    const title = document.getElementById("profile-modal-title");
    const badge = document.getElementById("profile-modal-badge");
    const firstNameInput = document.getElementById("profile-first-name");
    const lastNameInput = document.getElementById("profile-last-name");
    const emailInput = document.getElementById("profile-email");
    const phoneInput = document.getElementById("profile-phone");
    const levelSelect = document.getElementById("profile-level");
    const verifiedChip = document.getElementById("email-verified-chip");
    const codeGroup = document.getElementById("verification-code-group");
    const errorAlert = document.getElementById("email-error-alert");

    if (codeGroup) codeGroup.style.display = "none";
    if (errorAlert) errorAlert.style.display = "none";

    if (isPromptForPost) {
      if (badge) badge.textContent = "REQUIRED FOR POSTING";
      if (title) title.textContent = "Complete Your Profile";
    } else {
      if (badge) badge.textContent = "ASSOCIATE DETAILS";
      if (title) title.textContent = "Your Crew Profile";
    }

    if (state.userProfile) {
      const split = splitFullName(state.userProfile.name || "");
      const fName = state.userProfile.firstName !== undefined ? state.userProfile.firstName : split.firstName;
      const lName = state.userProfile.lastName !== undefined ? state.userProfile.lastName : split.lastName;
      if (firstNameInput) firstNameInput.value = fName;
      if (lastNameInput) lastNameInput.value = lName;
      if (emailInput) emailInput.value = state.userProfile.email || "";
      if (phoneInput) phoneInput.value = formatPhoneNumberLive(state.userProfile.phone || "");
      if (levelSelect) levelSelect.value = state.userProfile.level || 1;

      if (state.userProfile.avatar && state.userProfile.avatar.startsWith("data:image")) {
        state.uploadedAvatarDataUrl = state.userProfile.avatar;
        state.selectedAvatarPreset = null;
      } else {
        state.uploadedAvatarDataUrl = null;
        const matchedPreset = PRESET_AVATARS.find(p => p.emoji === state.userProfile.avatar);
        state.selectedAvatarPreset = matchedPreset ? matchedPreset.id : "avatar-1";
      }
      updateProfileAvatarPreview(state.userProfile.avatar);

      if (state.userProfile.email) {
        state.isEmailVerified = true;
        state.verifiedEmail = state.userProfile.email;
        if (verifiedChip) {
          verifiedChip.style.display = "block";
          verifiedChip.textContent = `✅ Email Confirmed: ${state.userProfile.email}`;
        }
      } else {
        state.isEmailVerified = false;
        if (verifiedChip) verifiedChip.style.display = "none";
      }
    } else {
      if (firstNameInput) firstNameInput.value = "";
      if (lastNameInput) lastNameInput.value = "";
      if (emailInput) emailInput.value = "";
      if (phoneInput) phoneInput.value = "";
      if (levelSelect) levelSelect.value = 1;
      state.isEmailVerified = false;
      state.verifiedEmail = "";
      state.uploadedAvatarDataUrl = null;
      state.selectedAvatarPreset = "avatar-1";
      if (verifiedChip) verifiedChip.style.display = "none";
      updateProfileAvatarPreview("👨‍🍳");
    }

    updateSaveProfileButtonState();
    renderAvatarPresets();
    openModal(modal);
  }

  function renderAvatarPresets() {
    const container = document.getElementById("avatar-presets-grid");
    if (!container) return;
    container.innerHTML = "";

    const hasCustomPhoto = !!(
      state.uploadedAvatarDataUrl ||
      (!state.selectedAvatarPreset && state.userProfile?.avatar?.startsWith("data:image"))
    );

    PRESET_AVATARS.forEach(preset => {
      const btn = document.createElement("button");
      btn.type = "button";
      const isSelected = !hasCustomPhoto && state.selectedAvatarPreset === preset.id;
      btn.className = `avatar-preset-btn ${isSelected ? "selected" : ""}`;
      btn.style.background = preset.bg;
      btn.innerHTML = renderAvatarMarkup(preset.emoji, preset.name);
      btn.title = preset.name;

      btn.addEventListener("click", () => {
        playPop();
        state.selectedAvatarPreset = preset.id;
        state.uploadedAvatarDataUrl = null;
        if (state.userProfile && state.userProfile.avatar && state.userProfile.avatar.startsWith("data:image")) {
          state.userProfile.avatar = preset.emoji;
          state.userProfile.avatarBg = preset.bg;
        }
        document.querySelectorAll(".avatar-preset-btn").forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
        updateProfileAvatarPreview(preset.emoji);
        autoSaveProfileIfVerified(false);
      });

      container.appendChild(btn);
    });
  }

  function updateProfileAvatarPreview(avatar) {
    const preview = document.getElementById("profile-preview-avatar");
    if (!preview) return;
    preview.innerHTML = renderAvatarMarkup(avatar, "Avatar");
  }

  // ==========================================================================
  // EmailJS Code Dispatcher with Exact Error Reporting & Auto-Bypass
  // ==========================================================================
  async function sendEmailVerificationCode(email) {
    // Ensure latest EmailJS settings are pulled from Supabase if another device updated them
    try {
      const cfgRes = await fetch(
        `${SUPABASE_REST_URL}/associates?id=eq.${encodeURIComponent(SUPABASE_EMAILJS_CONFIG_ID)}&select=*`,
        { method: "GET", headers: getSupabaseHeaders() }
      );
      if (cfgRes.ok) {
        const rows = await cfgRes.json();
        if (Array.isArray(rows) && rows.length > 0) {
          const r = rows[0];
          saveEmailJSConfigLocalOnly({
            serviceId: r.device?.serviceId || r.email || DEFAULT_EMAILJS.serviceId,
            templateId: r.device?.templateId || r.phone || DEFAULT_EMAILJS.templateId,
            publicKey: r.device?.publicKey || r.avatar || DEFAULT_EMAILJS.publicKey
          });
        }
      }
    } catch (e) {}

    const config = getEmailJSConfig();
    const code = String(Math.floor(100000 + Math.random() * 900000));
    state.pendingVerification = {
      email: email.trim().toLowerCase(),
      code: code,
      timestamp: Date.now()
    };

    const templateParams = {
      to_email: email.trim(),
      code: code,
      reply_to: email.trim()
    };

    let sent = false;
    let errorMessage = "";

    if (window.emailjs && window.emailjs.send) {
      try {
        await window.emailjs.send(
          config.serviceId,
          config.templateId,
          templateParams,
          config.publicKey
        );
        sent = true;
      } catch (err) {
        errorMessage = err?.text || err?.message || String(err);
      }
    }

    if (!sent) {
      try {
        const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            service_id: config.serviceId,
            template_id: config.templateId,
            user_id: config.publicKey,
            template_params: templateParams
          })
        });

        if (res.ok) {
          sent = true;
        } else {
          const txt = await res.text();
          errorMessage = txt || `HTTP Error ${res.status}`;
        }
      } catch (err) {
        if (!errorMessage) errorMessage = err?.message || "Network / CORS blocked";
      }
    }

    return { sent, code, errorMessage, config };
  }

  // Send Account Request Email to Manager via EmailJS (Template: template_7l9j34s)
  async function sendManagerAccountRequestEmail(profile) {
    if (!profile) return false;
    const config = getEmailJSConfig();
    const split = splitFullName(profile.name || "");
    const firstName = profile.firstName !== undefined ? profile.firstName : split.firstName;
    const lastName = profile.lastName !== undefined ? profile.lastName : split.lastName;
    const fullName = [firstName, lastName].filter(Boolean).join(" ").trim() || profile.name || "";

    const templateParams = {
      First: firstName,
      Last: lastName,
      Email: profile.email || "",
      Phone: profile.phone || "",
      Level: String(profile.level || 1),
      first: firstName,
      last: lastName,
      email: profile.email || "",
      phone: profile.phone || "",
      level: String(profile.level || 1),
      name: fullName,
      to_email: profile.email || "",
      reply_to: profile.email || ""
    };

    // Ordered candidate EmailJS credential sets for template_7l9j34s
    const candidateConfigs = [
      {
        serviceId: MANAGER_APPROVAL_PRIVATE_KEY,
        templateId: MANAGER_APPROVAL_TEMPLATE_ID,
        publicKey: MANAGER_APPROVAL_PUBLIC_KEY,
        accessToken: MANAGER_APPROVAL_PRIVATE_KEY
      },
      {
        serviceId: "service_z9v1wnm",
        templateId: MANAGER_APPROVAL_TEMPLATE_ID,
        publicKey: MANAGER_APPROVAL_PUBLIC_KEY,
        accessToken: MANAGER_APPROVAL_PRIVATE_KEY
      },
      {
        serviceId: "service_fc5qlhe",
        templateId: MANAGER_APPROVAL_TEMPLATE_ID,
        publicKey: MANAGER_APPROVAL_PUBLIC_KEY,
        accessToken: MANAGER_APPROVAL_PRIVATE_KEY
      },
      {
        serviceId: "default_service",
        templateId: MANAGER_APPROVAL_TEMPLATE_ID,
        publicKey: MANAGER_APPROVAL_PUBLIC_KEY,
        accessToken: MANAGER_APPROVAL_PRIVATE_KEY
      },
      {
        serviceId: config.serviceId,
        templateId: MANAGER_APPROVAL_TEMPLATE_ID,
        publicKey: config.publicKey,
        accessToken: MANAGER_APPROVAL_PRIVATE_KEY
      },
      {
        serviceId: config.serviceId,
        templateId: MANAGER_APPROVAL_TEMPLATE_ID,
        publicKey: config.publicKey
      }
    ];

    for (const cand of candidateConfigs) {
      if (!cand.serviceId || !cand.publicKey) continue;

      // 1. Try direct EmailJS REST API (supports accessToken / private key & avoids SDK init conflicts)
      try {
        const payload = {
          service_id: cand.serviceId,
          template_id: cand.templateId,
          user_id: cand.publicKey,
          template_params: templateParams
        };
        if (cand.accessToken) {
          payload.accessToken = cand.accessToken;
        }
        const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          return true;
        }
      } catch (e) {}

      // 2. Fallback to window.emailjs.send if available
      if (window.emailjs && window.emailjs.send) {
        try {
          await window.emailjs.send(
            cand.serviceId,
            cand.templateId,
            templateParams,
            {
              publicKey: cand.publicKey,
              ...(cand.accessToken ? { privateKey: cand.accessToken } : {})
            }
          );
          return true;
        } catch (e) {}
      }
    }

    return false;
  }

  // ==========================================================================
  // Store Manager Google Sheet Hub Rendering
  // ==========================================================================
  function openEditAssociateModal(assoc) {
    if (!assoc) return;
    const modal = document.getElementById("modal-edit-associate");
    const idInput = document.getElementById("edit-assoc-id");
    const firstNameInput = document.getElementById("edit-assoc-first-name");
    const lastNameInput = document.getElementById("edit-assoc-last-name");
    const emailInput = document.getElementById("edit-assoc-email");
    const phoneInput = document.getElementById("edit-assoc-phone");
    const levelSelect = document.getElementById("edit-assoc-level");
    const statusSelect = document.getElementById("edit-assoc-status");

    const split = splitFullName(assoc.name || "");
    const fName = assoc.firstName !== undefined ? assoc.firstName : split.firstName;
    const lName = assoc.lastName !== undefined ? assoc.lastName : split.lastName;

    if (idInput) idInput.value = assoc.id || "";
    if (firstNameInput) firstNameInput.value = fName;
    if (lastNameInput) lastNameInput.value = lName;
    if (emailInput) emailInput.value = assoc.email || "";
    if (phoneInput) phoneInput.value = formatPhoneNumberLive(assoc.phone || "") || assoc.phone || "";
    if (levelSelect) levelSelect.value = String(assoc.level || 1);
    if (statusSelect) statusSelect.value = assoc.approved === false ? "pending" : "approved";

    openModal(modal);
  }

  function renderManagerHub(filterText = "") {
    const tbody = document.getElementById("manager-roster-tbody");
    if (!tbody) return;
    tbody.innerHTML = "";

    const query = filterText.trim().toLowerCase();
    const associates = state.associates.filter(a => {
      if (!query) return true;
      return (
        (a.name && a.name.toLowerCase().includes(query)) ||
        (a.email && a.email.toLowerCase().includes(query)) ||
        (a.phone && a.phone.includes(query)) ||
        String(a.level).includes(query) ||
        (a.device?.summary && a.device.summary.toLowerCase().includes(query))
      );
    });

    // Update Stats (Only Total Associates & Active Shifts)
    const totalCount = state.associates.length;
    const activeShiftsCount = state.shifts.filter(s => s.status !== "claimed").length;

    const elTotal = document.getElementById("stat-total-crew");
    const elShifts = document.getElementById("stat-active-shifts");

    if (elTotal) elTotal.textContent = totalCount;
    if (elShifts) elShifts.textContent = activeShiftsCount;

    if (associates.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="11" style="text-align:center; padding: 2.5rem; color: var(--text-muted);">
            No associates found matching "${filterText}".
          </td>
        </tr>
      `;
      return;
    }

    associates.forEach((assoc, idx) => {
      const tr = document.createElement("tr");
      const avatarMarkup = renderAvatarMarkup(assoc.avatar, assoc.name);

      const dev = assoc.device || { summary: "Desktop Web", screen: "1920 × 1080", isMobile: false, type: "Desktop" };
      const isMobile = dev.isMobile;
      const isApproved = assoc.approved !== false;

      tr.innerHTML = `
        <td class="col-num">${idx + 1}</td>
        <td>
          <div class="table-user-cell">
            <div class="table-user-avatar" style="background: ${assoc.avatarBg || '#FFF8E6'}">
              ${avatarMarkup}
            </div>
            <span>${assoc.name}</span>
          </div>
        </td>
        <td>
          ${isApproved
            ? `<span class="sheet-approved-pill">✓ Approved</span>`
            : `<span class="sheet-pending-pill">⏳ Pending</span>`
          }
        </td>
        <td>
          <span class="level-badge l${assoc.level}">Level ${assoc.level}</span>
        </td>
        <td>
          <span class="sheet-verified-pill">✓ ${assoc.email || 'None'}</span>
        </td>
        <td class="mono-cell">${assoc.phone || 'N/A'}</td>
        <td class="mono-cell">${formatDateTimeReadable(assoc.joinedAt)}</td>
        <td>
          <span class="device-badge-pill ${isMobile ? 'mobile' : 'desktop'}">
            ${dev.summary || 'Browser'}
          </span>
        </td>
        <td class="mono-cell">${dev.screen || 'N/A'}</td>
        <td>
          <span class="device-badge-pill ${isMobile ? 'mobile' : 'desktop'}">${dev.type || (isMobile ? 'Mobile' : 'Desktop')}</span>
        </td>
        <td>
          <div class="table-actions-wrap">
            ${!isApproved ? `<button type="button" class="btn-table-action approve" data-assoc-id="${assoc.id}" title="Approve account request">Approve</button>` : ""}
            <button type="button" class="btn-table-action edit" data-assoc-id="${assoc.id}" title="Edit associate info">Edit</button>
            <button type="button" class="btn-table-action remove" data-assoc-id="${assoc.id}" title="Remove associate">Remove</button>
          </div>
        </td>
      `;

      tr.querySelector(".btn-table-action.approve")?.addEventListener("click", (e) => {
        e.stopPropagation();
        assoc.approved = true;
        if (assoc.device && typeof assoc.device === "object") {
          assoc.device.approved = true;
        }
        saveAssociatesRoster(state.associates);
        upsertAssociateToSupabase(assoc);
        if (
          state.userProfile &&
          (state.userProfile.id === assoc.id ||
            (state.userProfile.email && assoc.email && state.userProfile.email.toLowerCase() === assoc.email.toLowerCase()))
        ) {
          state.userProfile.approved = true;
          try {
            localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(state.userProfile));
          } catch (err) {}
          updateUserHeaderDisplay();
          updateProfileWarningBanner();
        }
        playSuccess();
        showToast(`Approved ${assoc.name}'s account!`, "success");
        renderManagerHub(filterText);
      });

      tr.querySelector(".btn-table-action.edit")?.addEventListener("click", (e) => {
        e.stopPropagation();
        playPop();
        openEditAssociateModal(assoc);
      });

      tr.querySelector(".btn-table-action.remove")?.addEventListener("click", (e) => {
        e.stopPropagation();
        if (confirm(`Remove associate ${assoc.name} from Store #438 directory? This will remove their account, log them out, and unverify their email.`)) {
          state.associates = state.associates.filter(a => a.id !== assoc.id);
          saveAssociatesRoster(state.associates);
          deleteAssociateFromSupabase(assoc.id);

          // If the removed associate is logged in on this browser, log them out and unverify email immediately
          if (
            state.userProfile &&
            (state.userProfile.id === assoc.id ||
              (state.userProfile.email && assoc.email && state.userProfile.email.toLowerCase() === assoc.email.toLowerCase()))
          ) {
            forceLogoutRemovedUser();
          }

          showToast(`Associate ${assoc.name} removed & logged out`, "default");
          renderManagerHub(filterText);
        }
      });

      tbody.appendChild(tr);
    });
  }

  // Export to CSV for Google Sheets
  function exportRosterToCSV() {
    const headers = ["Index", "Name", "Level", "Email", "Phone", "Joined Date", "Device Summary", "Screen Size", "Device Type"];
    const rows = state.associates.map((a, idx) => {
      const dev = a.device || {};
      return [
        idx + 1,
        `"${(a.name || '').replace(/"/g, '""')}"`,
        a.level,
        `"${a.email || ''}"`,
        `"${a.phone || ''}"`,
        `"${formatDateTimeReadable(a.joinedAt)}"`,
        `"${(dev.summary || '').replace(/"/g, '""')}"`,
        `"${dev.screen || ''}"`,
        `"${dev.type || ''}"`
      ];
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Store_438_Associate_Directory_${formatDateKey(new Date())}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    playSuccess();
    showToast("Downloaded Google Sheet CSV export!", "success");
  }

  // Copy TSV format to clipboard
  function copyRosterForGoogleSheets() {
    const headers = ["#", "Name", "Level", "Email", "Phone", "Joined Date", "Device", "Screen", "Type"];
    const rows = state.associates.map((a, idx) => {
      const dev = a.device || {};
      return [
        idx + 1,
        a.name,
        `Level ${a.level}`,
        a.email,
        a.phone,
        formatDateTimeReadable(a.joinedAt),
        dev.summary || "",
        dev.screen || "",
        dev.type || ""
      ];
    });

    const tsvContent = [headers.join("\t"), ...rows.map(r => r.join("\t"))].join("\n");
    navigator.clipboard.writeText(tsvContent).then(() => {
      playSuccess();
      showToast("📋 Copied Table! Open sheets.new and press Ctrl+V to paste.", "success");
    }).catch(() => {
      showToast("Could not access clipboard", "error");
    });
  }

  function openModal(modalEl) {
    if (!modalEl) return;
    modalEl.classList.add("active");
    modalEl.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    if (modalEl.id === "modal-manager-hub") {
      try { localStorage.setItem(STORAGE_KEY_ADMIN_HUB_OPEN, "true"); } catch (e) {}
    }
  }

  function closeModal(modalEl) {
    if (!modalEl) return;
    modalEl.classList.remove("active");
    modalEl.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (modalEl.id === "modal-manager-hub") {
      try { localStorage.removeItem(STORAGE_KEY_ADMIN_HUB_OPEN); } catch (e) {}
    }
  }

  // ==========================================================================
  // Initialization & Event Listeners
  // ==========================================================================
  function initApp() {
    state.userProfile = loadUserProfile();
    state.shifts = loadShifts();
    state.associates = loadAssociatesRoster();
    // Persist Manager Mode across page reloads until manager explicitly logs out
    try {
      state.isAdmin = localStorage.getItem(STORAGE_KEY_ADMIN) === "true";
    } catch (e) {
      state.isAdmin = false;
    }

    // Initialize EmailJS inputs with active/default config immediately
    saveEmailJSConfigLocalOnly(getEmailJSConfig());

    if (state.userProfile) {
      syncUserProfileToRoster(state.userProfile);
    }

    updateUserHeaderDisplay();
    updateAdminHeaderDisplay();
    updateProfileWarningBanner();
    updateCountsAndTitle();
    renderCalendarMonth();
    renderWeekView();

    // If Manager Dashboard was open before page reload, keep it open on reload
    try {
      if (state.isAdmin && localStorage.getItem(STORAGE_KEY_ADMIN_HUB_OPEN) === "true") {
        renderManagerHub();
        openModal(document.getElementById("modal-manager-hub"));
      }
    } catch (e) {}

    // Connect to Supabase for cross-device persistence & realtime sync
    syncFromSupabase();
    setupSupabaseRealtime();
    setInterval(syncFromSupabase, 5000);
    window.addEventListener("focus", syncFromSupabase);
    window.addEventListener("pageshow", syncFromSupabase);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        syncFromSupabase();
      }
    });

    // 1. View Switching (Month / Week) with Smooth Sliding Pill Animation
    const btnViewMonth = document.getElementById("btn-view-month");
    const btnViewWeek = document.getElementById("btn-view-week");
    const desktopViewSwitcher = document.querySelector(".view-switcher");
    const mobileViewSwitcher = document.getElementById("mobile-view-switcher");
    const bottomNavMonth = document.getElementById("bottom-nav-month");
    const bottomNavWeek = document.getElementById("bottom-nav-week");
    const calendarView = document.getElementById("calendar-view");
    const weekView = document.getElementById("week-view");

    function setView(viewName) {
      playPop();
      state.currentView = viewName;

      // Update Desktop Pill Switcher
      if (desktopViewSwitcher) desktopViewSwitcher.setAttribute("data-active-view", viewName);
      if (btnViewMonth) {
        btnViewMonth.classList.toggle("active", viewName === "month");
        btnViewMonth.setAttribute("aria-selected", viewName === "month" ? "true" : "false");
      }
      if (btnViewWeek) {
        btnViewWeek.classList.toggle("active", viewName === "week");
        btnViewWeek.setAttribute("aria-selected", viewName === "week" ? "true" : "false");
      }

      // Update Mobile Pill Switcher
      if (mobileViewSwitcher) mobileViewSwitcher.setAttribute("data-active-view", viewName);
      if (bottomNavMonth) {
        bottomNavMonth.classList.toggle("active", viewName === "month");
        bottomNavMonth.setAttribute("aria-selected", viewName === "month" ? "true" : "false");
      }
      if (bottomNavWeek) {
        bottomNavWeek.classList.toggle("active", viewName === "week");
        bottomNavWeek.setAttribute("aria-selected", viewName === "week" ? "true" : "false");
      }

      if (viewName === "month") {
        calendarView?.classList.add("active");
        weekView?.classList.remove("active");
        renderCalendarMonth();
      } else {
        calendarView?.classList.remove("active");
        weekView?.classList.add("active");
        renderWeekView();
      }
      updateCountsAndTitle();
    }

    btnViewMonth?.addEventListener("click", () => setView("month"));
    btnViewWeek?.addEventListener("click", () => setView("week"));
    bottomNavMonth?.addEventListener("click", () => setView("month"));
    bottomNavWeek?.addEventListener("click", () => setView("week"));

    // 2. Date Navigation Controls & Calendar / Week Swipe
    function triggerSlideAnimation(el, animClass) {
      if (!el) return;
      el.classList.remove("swipe-next", "swipe-prev");
      void el.offsetWidth;
      el.classList.add(animClass);
    }

    function stepPeriod(direction) {
      playPop();
      const animClass = direction > 0 ? "swipe-next" : "swipe-prev";

      if (state.currentView === "month") {
        state.userSelectedCalendarDay = false;
        state.activeDate = new Date(state.activeDate.getFullYear(), state.activeDate.getMonth() + direction, 1);
      } else {
        state.activeDate.setDate(state.activeDate.getDate() + direction * 7);
      }

      updateCountsAndTitle();
      renderCalendarMonth();
      renderWeekView();

      const periodTitle = document.getElementById("current-period-title");
      const calGrid = document.getElementById("calendar-days-grid");
      const dayPanel = document.getElementById("selected-day-panel");
      const weekGrid = document.getElementById("week-columns-grid");

      triggerSlideAnimation(periodTitle, animClass);
      if (state.currentView === "month") {
        triggerSlideAnimation(calGrid, animClass);
        triggerSlideAnimation(dayPanel, animClass);
      } else {
        triggerSlideAnimation(weekGrid, animClass);
      }
    }

    document.getElementById("btn-nav-prev")?.addEventListener("click", () => stepPeriod(-1));
    document.getElementById("btn-nav-next")?.addEventListener("click", () => stepPeriod(1));

    // Horizontal swipe on Month Calendar & Week View: 1:1 finger tracking + velocity-matched completion
    function attachPeriodSwipeGesture(containerEl) {
      if (!containerEl) return;
      let startX = 0;
      let startY = 0;
      let lastX = 0;
      let lastY = 0;
      let isTracking = false;
      let isHorizontal = null;
      let previewEl = null;
      let previewDir = 0;
      let samples = [];
      let animTimer = null;
      let pendingCommitDir = 0;

      function getActiveGridEl() {
        return state.currentView === "month"
          ? document.getElementById("calendar-days-grid")
          : document.getElementById("week-columns-grid");
      }

      function cleanupSwipeElements() {
        if (previewEl) {
          previewEl.remove();
          previewEl = null;
        }
        document.querySelectorAll(".swipe-preview-grid").forEach(el => el.remove());
        previewDir = 0;
        [document.getElementById("calendar-days-grid"), document.getElementById("week-columns-grid")].forEach(g => {
          if (g) {
            g.style.transition = "";
            g.style.transform = "";
            g.style.willChange = "";
            if (g.parentElement) {
              g.parentElement.style.minHeight = "";
            }
          }
        });
      }

      function finishPendingAnimationImmediately() {
        if (animTimer) {
          clearTimeout(animTimer);
          animTimer = null;
        }
        const dirToCommit = pendingCommitDir;
        pendingCommitDir = 0;

        if (dirToCommit !== 0) {
          if (state.currentView === "month") {
            state.userSelectedCalendarDay = false;
            state.activeDate = new Date(state.activeDate.getFullYear(), state.activeDate.getMonth() + dirToCommit, 1);
          } else {
            state.activeDate.setDate(state.activeDate.getDate() + dirToCommit * 7);
          }
          updateCountsAndTitle();
          renderCalendarMonth();
          renderWeekView();
        }

        cleanupSwipeElements();
      }

      function startDrag(clientX, clientY) {
        if (animTimer) {
          finishPendingAnimationImmediately();
        }
        startX = clientX;
        startY = clientY;
        lastX = clientX;
        lastY = clientY;
        isTracking = true;
        isHorizontal = null;
        samples = [{ x: clientX, t: performance.now() }];
      }

      function moveDrag(clientX, clientY, event) {
        if (!isTracking) return;
        lastX = clientX;
        lastY = clientY;
        const dx = lastX - startX;
        const dy = lastY - startY;

        if (isHorizontal === null && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) {
          // On desktop week view (>768px) if horizontally scrollable, don't hijack native scroll
          if (state.currentView === "week" && window.innerWidth > 768 && containerEl.scrollWidth > containerEl.clientWidth) {
            isHorizontal = false;
          } else {
            isHorizontal = Math.abs(dx) > Math.abs(dy) * 1.05;
          }
        }

        if (isHorizontal !== true) return;
        if (event && event.cancelable) event.preventDefault();

        const now = performance.now();
        samples.push({ x: lastX, t: now });
        while (samples.length > 2 && now - samples[0].t > 90) {
          samples.shift();
        }

        const gridEl = getActiveGridEl();
        const hostEl = gridEl?.parentElement;
        if (!gridEl || !hostEl) return;

        const width = gridEl.offsetWidth || hostEl.clientWidth || 360;
        const gap = state.currentView === "week" ? 14 : 1;
        const stride = width + gap;
        const dir = dx < 0 ? 1 : (dx > 0 ? -1 : 0);

        if (dir !== 0 && (!previewEl || previewDir !== dir)) {
          if (!previewEl) {
            previewEl = document.createElement("div");
            hostEl.appendChild(previewEl);
          }
          previewEl.className = state.currentView === "month"
            ? "calendar-days-grid swipe-preview-grid"
            : "week-columns-grid swipe-preview-grid";
          previewEl.style.position = "absolute";
          previewEl.style.top = `${gridEl.offsetTop}px`;
          previewEl.style.left = `${gridEl.offsetLeft}px`;
          previewEl.style.width = `${width}px`;
          previewEl.style.pointerEvents = "none";
          previewEl.style.zIndex = "3";

          if (state.currentView === "month") {
            const targetDate = new Date(state.activeDate.getFullYear(), state.activeDate.getMonth() + dir, 1);
            populateCalendarMonthGrid(previewEl, targetDate, true);
          } else {
            const targetDate = new Date(state.activeDate);
            targetDate.setDate(targetDate.getDate() + dir * 7);
            populateWeekGrid(previewEl, targetDate);
          }
          previewDir = dir;
          const maxH = Math.max(gridEl.offsetHeight, previewEl.offsetHeight);
          hostEl.style.minHeight = `${gridEl.offsetTop + maxH}px`;
        }

        gridEl.classList.remove("swipe-next", "swipe-prev");
        gridEl.style.transition = "none";
        gridEl.style.willChange = "transform";
        gridEl.style.transform = `translate3d(${dx}px, 0, 0)`;

        if (previewEl && previewDir !== 0) {
          previewEl.style.transition = "none";
          previewEl.style.willChange = "transform";
          previewEl.style.transform = `translate3d(${dx + previewDir * stride}px, 0, 0)`;
        }
      }

      function endDrag() {
        if (!isTracking) return;
        isTracking = false;

        if (isHorizontal !== true) {
          isHorizontal = null;
          cleanupSwipeElements();
          return;
        }
        isHorizontal = null;

        const dx = lastX - startX;
        const gridEl = getActiveGridEl();
        const hostEl = gridEl?.parentElement;
        if (!gridEl || !hostEl || Math.abs(dx) < 2) {
          cleanupSwipeElements();
          return;
        }

        const now = performance.now();
        const lastSample = samples[samples.length - 1] || { x: lastX, t: now };
        const firstSample = samples[0] || { x: startX, t: now };
        let vx = 0; // px per ms
        if (now - lastSample.t < 90 && lastSample.t > firstSample.t) {
          vx = (lastSample.x - firstSample.x) / (lastSample.t - firstSample.t);
        }

        const width = gridEl.offsetWidth || hostEl.clientWidth || 360;
        const gap = state.currentView === "week" ? 14 : 1;
        const stride = width + gap;
        const dir = dx < 0 ? 1 : -1;
        const vInDir = dir === 1 ? -vx : vx;

        const shouldCommit =
          (Math.abs(dx) > width * 0.22 && vInDir > -0.15) ||
          (Math.abs(dx) > 20 && vInDir >= 0.30);

        state.didJustSwipe = true;
        setTimeout(() => { state.didJustSwipe = false; }, 220);

        if (shouldCommit) {
          playPop();
          const remaining = Math.max(0, stride - Math.abs(dx));
          const speed = Math.max(0.85, Math.min(3.8, vInDir * 1.1));
          const durationMs = Math.round(Math.max(60, Math.min(320, remaining / speed)));
          const easing = "cubic-bezier(0.12, 0.8, 0.32, 1)";

          gridEl.style.transition = `transform ${durationMs}ms ${easing}`;
          gridEl.style.transform = `translate3d(${-dir * stride}px, 0, 0)`;
          if (previewEl) {
            previewEl.style.transition = `transform ${durationMs}ms ${easing}`;
            previewEl.style.transform = "translate3d(0px, 0, 0)";
          }

          // Update period title immediately with matching direction animation
          const animClass = dir > 0 ? "swipe-next" : "swipe-prev";
          const nextDate = state.currentView === "month"
            ? new Date(state.activeDate.getFullYear(), state.activeDate.getMonth() + dir, 1)
            : new Date(state.activeDate.getFullYear(), state.activeDate.getMonth(), state.activeDate.getDate() + dir * 7);
          const periodTitle = document.getElementById("current-period-title");
          if (periodTitle) {
            periodTitle.textContent = formatPeriodTitle(nextDate, state.currentView);
            triggerSlideAnimation(periodTitle, animClass);
          }
          if (state.currentView === "month") {
            const dayPanel = document.getElementById("selected-day-panel");
            triggerSlideAnimation(dayPanel, animClass);
          }

          pendingCommitDir = dir;
          animTimer = setTimeout(() => {
            finishPendingAnimationImmediately();
          }, durationMs);
        } else {
          const returnDist = Math.abs(dx);
          const returnSpeed = Math.max(0.9, Math.min(3.0, Math.abs(vx)));
          const durationMs = Math.round(Math.max(70, Math.min(240, returnDist / returnSpeed)));
          const easing = "cubic-bezier(0.16, 1, 0.3, 1)";

          gridEl.style.transition = `transform ${durationMs}ms ${easing}`;
          gridEl.style.transform = "translate3d(0px, 0, 0)";
          if (previewEl && previewDir !== 0) {
            previewEl.style.transition = `transform ${durationMs}ms ${easing}`;
            previewEl.style.transform = `translate3d(${previewDir * stride}px, 0, 0)`;
          }

          pendingCommitDir = 0;
          animTimer = setTimeout(() => {
            finishPendingAnimationImmediately();
          }, durationMs);
        }
      }

      containerEl.addEventListener("touchstart", (e) => {
        if (!e.touches || e.touches.length !== 1) return;
        startDrag(e.touches[0].clientX, e.touches[0].clientY);
      }, { passive: true });

      containerEl.addEventListener("touchmove", (e) => {
        if (!isTracking || !e.touches || e.touches.length !== 1) return;
        moveDrag(e.touches[0].clientX, e.touches[0].clientY, e);
      }, { passive: false });

      containerEl.addEventListener("touchend", endDrag, { passive: true });
      containerEl.addEventListener("touchcancel", endDrag, { passive: true });

      // Mouse drag fallback for desktop / emulator testing
      let mouseDown = false;
      containerEl.addEventListener("mousedown", (e) => {
        if (e.button !== 0) return;
        if (e.target.closest("button, a, input, select, textarea")) return;
        mouseDown = true;
        startDrag(e.clientX, e.clientY);
      });

      window.addEventListener("mousemove", (e) => {
        if (!mouseDown) return;
        moveDrag(e.clientX, e.clientY, e);
      });

      window.addEventListener("mouseup", () => {
        if (!mouseDown) return;
        mouseDown = false;
        endDrag();
      });
    }

    attachPeriodSwipeGesture(document.querySelector("#calendar-view .calendar-wrapper"));
    attachPeriodSwipeGesture(document.getElementById("week-view"));

    document.getElementById("btn-nav-today")?.addEventListener("click", () => {
      playPop();
      state.activeDate = new Date();
      state.userSelectedCalendarDay = true;
      state.selectedCalendarDay = formatDateKey(new Date());
      updateCountsAndTitle();
      renderCalendarMonth();
      renderWeekView();
    });

    // 3. Brand Logo: Hold 1s to Unlock Manager; Once Logged In, Tap Logo to Open Manager Dashboard
    const brandBtn = document.getElementById("btn-brand-home");
    const brandIcon = document.getElementById("brand-icon");
    let holdTimer = null;
    let didTriggerAdmin = false;

    function startHold() {
      didTriggerAdmin = false;
      if (state.isAdmin) return;
      brandIcon?.classList.add("holding");
      holdTimer = setTimeout(() => {
        didTriggerAdmin = true;
        brandIcon?.classList.remove("holding");
        playSuccess();
        openModal(document.getElementById("modal-admin-login"));
      }, 1000);
    }

    function cancelHold() {
      if (holdTimer) {
        clearTimeout(holdTimer);
        holdTimer = null;
      }
      brandIcon?.classList.remove("holding");
    }

    function onBrandTap() {
      cancelHold();
      if (didTriggerAdmin) return;

      if (state.isAdmin) {
        playPop();
        openManagerSheet();
      } else {
        playPop();
        state.activeDate = new Date();
        state.selectedCalendarDay = formatDateKey(new Date());
        updateCountsAndTitle();
        state.currentView === "month" ? renderCalendarMonth() : renderWeekView();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }

    brandBtn?.addEventListener("contextmenu", (e) => e.preventDefault());
    brandBtn?.addEventListener("selectstart", (e) => e.preventDefault());

    brandBtn?.addEventListener("mousedown", startHold);
    brandBtn?.addEventListener("mouseup", onBrandTap);
    brandBtn?.addEventListener("mouseleave", cancelHold);

    brandBtn?.addEventListener("touchstart", () => {
      startHold();
    }, { passive: true });
    brandBtn?.addEventListener("touchend", onBrandTap);
    brandBtn?.addEventListener("touchcancel", cancelHold);

    // 4. Store Manager Hub (Google Sheet Table)
    const openManagerSheet = () => {
      playPop();
      renderManagerHub();
      openModal(document.getElementById("modal-manager-hub"));
    };

    // Admin Unlock Form Submit
    document.getElementById("form-admin-login")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = document.getElementById("admin-password");
      const val = input ? input.value : "";

      if (val === getManagerPassword()) {
        state.isAdmin = true;
        try { localStorage.setItem(STORAGE_KEY_ADMIN, "true"); } catch (e) {}
        playSuccess();
        showToast("Store Manager Mode Activated! You can now delete any shift or tap the logo for Manager Hub.", "success");
        updateAdminHeaderDisplay();
        closeModal(document.getElementById("modal-admin-login"));
        if (input) input.value = "";
        state.currentView === "month" ? renderCalendarMonth() : renderWeekView();
      } else {
        showToast("Incorrect manager password!", "error");
        if (input) {
          input.value = "";
          input.focus();
        }
      }
    });

    document.getElementById("btn-manager-logout")?.addEventListener("click", () => {
      state.isAdmin = false;
      try {
        localStorage.removeItem(STORAGE_KEY_ADMIN);
        localStorage.removeItem(STORAGE_KEY_ADMIN_HUB_OPEN);
      } catch (e) {}
      updateAdminHeaderDisplay();
      closeModal(document.getElementById("modal-manager-hub"));
      playPop();
      showToast("Logged out of Manager Mode", "default");
      state.currentView === "month" ? renderCalendarMonth() : renderWeekView();
    });

    document.getElementById("sheet-search-input")?.addEventListener("input", (e) => {
      renderManagerHub(e.target.value);
    });

    document.getElementById("btn-download-csv")?.addEventListener("click", exportRosterToCSV);
    document.getElementById("btn-copy-sheet")?.addEventListener("click", copyRosterForGoogleSheets);

    // Change Manager Password Panel inside Manager Hub
    const btnChangeManagerPassword = document.getElementById("btn-change-manager-password");
    const managerPasswordPanel = document.getElementById("manager-password-panel");
    const inputNewManagerPwd = document.getElementById("config-new-manager-password");
    const inputConfirmManagerPwd = document.getElementById("config-confirm-manager-password");

    btnChangeManagerPassword?.addEventListener("click", () => {
      playPop();
      if (managerPasswordPanel) {
        const isHidden = managerPasswordPanel.style.display === "none";
        managerPasswordPanel.style.display = isHidden ? "block" : "none";
        if (isHidden) {
          if (inputNewManagerPwd) inputNewManagerPwd.value = "";
          if (inputConfirmManagerPwd) inputConfirmManagerPwd.value = "";
          inputNewManagerPwd?.focus();
        }
      }
    });

    document.getElementById("btn-save-manager-password")?.addEventListener("click", () => {
      const newPwd = inputNewManagerPwd?.value.trim() || "";
      const confirmPwd = inputConfirmManagerPwd?.value.trim() || "";
      if (!newPwd) {
        showToast("Please enter a new password!", "error");
        return;
      }
      if (newPwd !== confirmPwd) {
        showToast("Passwords do not match!", "error");
        return;
      }
      saveManagerPasswordLocalOnly(newPwd);
      upsertEmailJSConfigToSupabase(getEmailJSConfig());
      playSuccess();
      showToast("Manager password updated & synced across devices!", "success");
      if (managerPasswordPanel) managerPasswordPanel.style.display = "none";
    });

    // Edit Associate Form Submit (Manager Hub)
    const editPhoneInputEl = document.getElementById("edit-assoc-phone");
    editPhoneInputEl?.addEventListener("input", (e) => {
      const formatted = formatPhoneNumberLive(e.target.value);
      if (e.target.value !== formatted) {
        e.target.value = formatted;
      }
    });

    document.getElementById("form-edit-associate")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const assocId = document.getElementById("edit-assoc-id")?.value;
      const newFirst = document.getElementById("edit-assoc-first-name")?.value.trim() || "";
      const newLast = document.getElementById("edit-assoc-last-name")?.value.trim() || "";
      const newName = [newFirst, newLast].filter(Boolean).join(" ").trim();
      const newEmail = document.getElementById("edit-assoc-email")?.value.trim();
      const rawPhone = document.getElementById("edit-assoc-phone")?.value.trim();
      const newPhone = formatPhoneNumberLive(rawPhone) || rawPhone;
      const newLevel = parseInt(document.getElementById("edit-assoc-level")?.value, 10) || 1;
      const newStatus = document.getElementById("edit-assoc-status")?.value;
      const isApproved = newStatus !== "pending";

      if (!assocId || !newFirst || !newLast || !newEmail || !newPhone) {
        showToast("All associate fields are required!", "error");
        return;
      }

      const idx = state.associates.findIndex(a => a.id === assocId);
      if (idx === -1) return;

      const updatedAssoc = {
        ...state.associates[idx],
        name: newName,
        firstName: newFirst,
        lastName: newLast,
        email: newEmail,
        phone: newPhone,
        level: newLevel,
        approved: isApproved,
        device: {
          ...(state.associates[idx].device || detectDeviceDetails()),
          approved: isApproved,
          firstName: newFirst,
          lastName: newLast
        }
      };

      state.associates[idx] = updatedAssoc;
      saveAssociatesRoster(state.associates);
      upsertAssociateToSupabase(updatedAssoc);

      // Also update any active shifts posted by this associate so their edited name/phone/level reflects on the board
      let shiftsUpdated = false;
      state.shifts.forEach(s => {
        if (s.authorId === assocId) {
          s.authorName = newName;
          s.authorEmail = newEmail;
          s.authorPhone = newPhone;
          s.authorLevel = newLevel;
          shiftsUpdated = true;
          upsertShiftToSupabase(s);
        }
      });
      if (shiftsUpdated) {
        saveShifts(state.shifts);
      }

      // If this associate is the current user on this device, update local userProfile too
      if (state.userProfile && state.userProfile.id === assocId) {
        state.userProfile = {
          ...state.userProfile,
          name: newName,
          firstName: newFirst,
          lastName: newLast,
          email: newEmail,
          phone: newPhone,
          level: newLevel,
          approved: isApproved
        };
        try {
          localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(state.userProfile));
        } catch (err) {}
        updateUserHeaderDisplay();
        updateProfileWarningBanner();
      }

      closeModal(document.getElementById("modal-edit-associate"));
      playSuccess();
      showToast(`Updated ${newName}'s information!`, "success");
      const searchVal = document.getElementById("sheet-search-input")?.value || "";
      renderManagerHub(searchVal);
      state.currentView === "month" ? renderCalendarMonth() : renderWeekView();
    });

    // EmailJS Settings Panel inside Manager Hub
    const btnToggleEmailConfig = document.getElementById("btn-toggle-email-config");
    const emailConfigPanel = document.getElementById("emailjs-config-panel");
    const inputCfgService = document.getElementById("config-service-id");
    const inputCfgTemplate = document.getElementById("config-template-id");
    const inputCfgKey = document.getElementById("config-public-key");

    btnToggleEmailConfig?.addEventListener("click", () => {
      playPop();
      if (emailConfigPanel) {
        const isHidden = emailConfigPanel.style.display === "none";
        emailConfigPanel.style.display = isHidden ? "block" : "none";
        if (isHidden) {
          const cfg = getEmailJSConfig();
          if (inputCfgService) inputCfgService.value = cfg.serviceId;
          if (inputCfgTemplate) inputCfgTemplate.value = cfg.templateId;
          if (inputCfgKey) inputCfgKey.value = cfg.publicKey;
        }
      }
    });

    document.getElementById("btn-save-email-config")?.addEventListener("click", () => {
      const newCfg = {
        serviceId: inputCfgService?.value.trim() || DEFAULT_EMAILJS.serviceId,
        templateId: inputCfgTemplate?.value.trim() || DEFAULT_EMAILJS.templateId,
        publicKey: inputCfgKey?.value.trim() || DEFAULT_EMAILJS.publicKey
      };
      saveEmailJSConfig(newCfg);
      playSuccess();
      showToast("EmailJS settings saved & synced to Supabase across all devices!", "success");
      if (emailConfigPanel) emailConfigPanel.style.display = "none";
    });

    // 5. Level Dropdown Filter with Checkboxes
    function updateLevelDropdownLabel() {
      const labelEl = document.getElementById("level-dropdown-label");
      if (!labelEl) return;
      const count = state.selectedLevels.size;
      if (count === 6) {
        labelEl.textContent = "Levels: All (1–6)";
      } else if (count === 0) {
        labelEl.textContent = "Levels: None";
      } else if (count <= 3) {
        const sorted = Array.from(state.selectedLevels).sort().map(l => `L${l}`).join(", ");
        labelEl.textContent = `Levels: ${sorted}`;
      } else {
        labelEl.textContent = `Levels (${count})`;
      }
    }

    const btnLevelDropdown = document.getElementById("btn-level-dropdown");
    const levelDropdownMenu = document.getElementById("level-dropdown-menu");

    btnLevelDropdown?.addEventListener("click", (e) => {
      e.stopPropagation();
      playPop();
      const isOpen = levelDropdownMenu && levelDropdownMenu.style.display === "block";
      if (levelDropdownMenu) {
        levelDropdownMenu.style.display = isOpen ? "none" : "block";
      }
      btnLevelDropdown.setAttribute("aria-expanded", isOpen ? "false" : "true");
    });

    document.addEventListener("click", (e) => {
      const wrapper = document.querySelector(".level-dropdown-wrapper");
      if (wrapper && !wrapper.contains(e.target)) {
        if (levelDropdownMenu) levelDropdownMenu.style.display = "none";
        btnLevelDropdown?.setAttribute("aria-expanded", "false");
      }
    });

    const levelCheckboxes = document.querySelectorAll(".level-checkbox");
    levelCheckboxes.forEach(cb => {
      const item = cb.closest(".level-dropdown-item");
      if (cb.checked) item?.classList.add("checked");

      cb.addEventListener("change", () => {
        playPop();
        if (cb.checked) {
          state.selectedLevels.add(cb.value);
          item?.classList.add("checked");
        } else {
          state.selectedLevels.delete(cb.value);
          item?.classList.remove("checked");
        }
        updateLevelDropdownLabel();
        state.currentView === "month" ? renderCalendarMonth() : renderWeekView();
      });
    });

    document.getElementById("btn-select-all-levels")?.addEventListener("click", (e) => {
      e.stopPropagation();
      playPop();
      levelCheckboxes.forEach(cb => {
        const item = cb.closest(".level-dropdown-item");
        cb.checked = true;
        state.selectedLevels.add(cb.value);
        item?.classList.add("checked");
      });
      updateLevelDropdownLabel();
      state.currentView === "month" ? renderCalendarMonth() : renderWeekView();
    });

    document.getElementById("btn-clear-all-levels")?.addEventListener("click", (e) => {
      e.stopPropagation();
      playPop();
      levelCheckboxes.forEach(cb => {
        const item = cb.closest(".level-dropdown-item");
        cb.checked = false;
        state.selectedLevels.delete(cb.value);
        item?.classList.remove("checked");
      });
      updateLevelDropdownLabel();
      state.currentView === "month" ? renderCalendarMonth() : renderWeekView();
    });

    // 7. Post Shift Triggers
    const handlePostClick = () => {
      playPop();
      openPostShiftModal();
    };

    document.getElementById("btn-open-post-shift")?.addEventListener("click", handlePostClick);
    document.getElementById("bottom-nav-post-shift")?.addEventListener("click", handlePostClick);
    document.getElementById("btn-add-shift-for-day")?.addEventListener("click", () => {
      playPop();
      openPostShiftModal(state.selectedCalendarDay);
    });

    // Profile triggers
    const handleProfileClick = () => {
      playPop();
      openProfileModal(false);
    };
    document.getElementById("btn-user-profile-header")?.addEventListener("click", handleProfileClick);
    document.getElementById("btn-banner-setup")?.addEventListener("click", () => {
      playPop();
      openProfileModal(true);
    });

    // 8. Modal Close Handlers
    document.querySelectorAll("[data-close-modal]").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const modal = e.target.closest(".modal-backdrop");
        if (modal) closeModal(modal);
      });
    });

    document.querySelectorAll(".modal-backdrop").forEach(backdrop => {
      backdrop.addEventListener("click", (e) => {
        if (e.target === backdrop) closeModal(backdrop);
      });
    });

    // 9. Interactive Photo Cropper & Upload in Profile
    const cropModal = document.getElementById("modal-crop-photo");
    const cropCanvas = document.getElementById("cropper-canvas");
    const cropZoomRange = document.getElementById("cropper-zoom-range");
    const cropRotateBtn = document.getElementById("btn-cropper-rotate");
    const cropApplyBtn = document.getElementById("btn-cropper-apply");
    const cropCancelBtn = document.getElementById("btn-cropper-cancel");
    const cropCancelX = document.getElementById("btn-cancel-crop-x");
    const fileUploadInput = document.getElementById("profile-avatar-upload");

    let cropImg = null;
    let cropState = { zoom: 1, minZoom: 1, offsetX: 0, offsetY: 0, rotation: 0, dragging: false, startX: 0, startY: 0 };

    function drawCropperCanvas() {
      if (!cropCanvas || !cropImg) return;
      const ctx = cropCanvas.getContext("2d");
      const cw = cropCanvas.width;
      const ch = cropCanvas.height;
      ctx.clearRect(0, 0, cw, ch);

      ctx.save();
      ctx.translate(cw / 2 + cropState.offsetX, ch / 2 + cropState.offsetY);
      ctx.rotate((cropState.rotation * Math.PI) / 180);
      ctx.scale(cropState.zoom, cropState.zoom);
      ctx.drawImage(cropImg, -cropImg.width / 2, -cropImg.height / 2);
      ctx.restore();
    }

    fileUploadInput?.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      if (file.size > 8 * 1024 * 1024) {
        showToast("Please choose a photo under 8MB", "error");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          cropImg = img;
          const baseScale = Math.max(300 / img.width, 300 / img.height);
          cropState = {
            zoom: baseScale,
            minZoom: baseScale * 0.8,
            offsetX: 0,
            offsetY: 0,
            rotation: 0,
            dragging: false,
            startX: 0,
            startY: 0
          };
          if (cropZoomRange) {
            cropZoomRange.min = String(baseScale * 0.8);
            cropZoomRange.max = String(baseScale * 3);
            cropZoomRange.step = String(baseScale * 0.05);
            cropZoomRange.value = String(baseScale);
          }
          drawCropperCanvas();
          openModal(cropModal);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
      fileUploadInput.value = "";
    });

    cropZoomRange?.addEventListener("input", () => {
      cropState.zoom = parseFloat(cropZoomRange.value);
      drawCropperCanvas();
    });

    cropRotateBtn?.addEventListener("click", () => {
      cropState.rotation = (cropState.rotation + 90) % 360;
      drawCropperCanvas();
    });

    cropCanvas?.addEventListener("pointerdown", (e) => {
      cropState.dragging = true;
      cropState.startX = e.clientX - cropState.offsetX;
      cropState.startY = e.clientY - cropState.offsetY;
      cropCanvas.setPointerCapture(e.pointerId);
    });

    cropCanvas?.addEventListener("pointermove", (e) => {
      if (!cropState.dragging) return;
      cropState.offsetX = e.clientX - cropState.startX;
      cropState.offsetY = e.clientY - cropState.startY;
      drawCropperCanvas();
    });

    cropCanvas?.addEventListener("pointerup", () => {
      cropState.dragging = false;
    });

    const closeCropModal = () => closeModal(cropModal);
    cropCancelBtn?.addEventListener("click", closeCropModal);
    cropCancelX?.addEventListener("click", closeCropModal);

    cropApplyBtn?.addEventListener("click", () => {
      if (!cropCanvas) return;
      const outCanvas = document.createElement("canvas");
      outCanvas.width = 240;
      outCanvas.height = 240;
      const outCtx = outCanvas.getContext("2d");
      outCtx.drawImage(cropCanvas, 15, 15, 270, 270, 0, 0, 240, 240);
      state.uploadedAvatarDataUrl = outCanvas.toDataURL("image/jpeg", 0.88);
      state.selectedAvatarPreset = null;
      document.querySelectorAll(".avatar-preset-btn").forEach(b => b.classList.remove("selected"));
      updateProfileAvatarPreview(state.uploadedAvatarDataUrl);
      autoSaveProfileIfVerified(false);
      closeCropModal();
      playSuccess();
      showToast("Photo cropped & ready!", "success");
    });

    // 10. EmailJS: Send Verification Code with Detailed Status & Instant Bypass
    const btnSendCode = document.getElementById("btn-send-code");
    const btnResendCode = document.getElementById("btn-resend-code");
    const codeGroup = document.getElementById("verification-code-group");
    const emailInput = document.getElementById("profile-email");
    const errorAlert = document.getElementById("email-error-alert");
    const errorMsg = document.getElementById("email-error-message");
    const quickCodeDisplay = document.getElementById("quick-code-display");

    async function handleSendCode() {
      const email = emailInput?.value.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        showToast("Please enter a valid email address first!", "error");
        emailInput?.focus();
        return;
      }

      if (btnSendCode) {
        btnSendCode.disabled = true;
        btnSendCode.innerHTML = `<span>Sending...</span>`;
      }

      if (errorAlert) errorAlert.style.display = "none";

      try {
        const res = await sendEmailVerificationCode(email);
        if (codeGroup) codeGroup.style.display = "block";

        if (res.sent) {
          playSuccess();
          showToast(`Verification code sent to ${email}!`, "success");
        } else {
          if (errorAlert) {
            errorAlert.style.display = "block";
            if (errorMsg) {
              errorMsg.textContent = res.errorMessage
                ? `Verification Response: ${res.errorMessage}`
                : "Could not send verification email.";
            }
          }
          if (quickCodeDisplay) quickCodeDisplay.textContent = res.code;
          showToast("Use the test code shown below to verify.", "default");
        }
      } catch (err) {
        if (codeGroup) codeGroup.style.display = "block";
        if (errorAlert) {
          errorAlert.style.display = "block";
          if (errorMsg) errorMsg.textContent = "Verification network request failed.";
          if (quickCodeDisplay && state.pendingVerification) quickCodeDisplay.textContent = state.pendingVerification.code;
        }
      } finally {
        if (btnSendCode) {
          btnSendCode.disabled = false;
          btnSendCode.innerHTML = `<span>Send 6-Digit Code</span>`;
        }
      }
    }

    btnSendCode?.addEventListener("click", handleSendCode);
    btnResendCode?.addEventListener("click", handleSendCode);

    document.getElementById("btn-quick-fill-code")?.addEventListener("click", () => {
      const codeInput = document.getElementById("profile-code-input");
      if (codeInput && state.pendingVerification) {
        codeInput.value = state.pendingVerification.code;
        document.getElementById("btn-verify-code")?.click();
      }
    });

    // Confirm Code Button (Also auto-restores existing associate details across devices & auto-saves!)
    document.getElementById("btn-verify-code")?.addEventListener("click", () => {
      const entered = document.getElementById("profile-code-input")?.value.trim();
      if (!state.pendingVerification || !entered) {
        showToast("Please enter the 6-digit code", "error");
        return;
      }

      if (entered === state.pendingVerification.code) {
        state.isEmailVerified = true;
        state.verifiedEmail = state.pendingVerification.email;
        playSuccess();

        // Check if this email already exists in the Supabase roster to remember their info across devices!
        const existingAssociate = state.associates.find(
          a => a.email && a.email.trim().toLowerCase() === state.verifiedEmail.toLowerCase()
        );
        if (existingAssociate) {
          const firstInput = document.getElementById("profile-first-name");
          const lastInput = document.getElementById("profile-last-name");
          const phoneInput = document.getElementById("profile-phone");
          const levelSelect = document.getElementById("profile-level");
          const split = splitFullName(existingAssociate.name || "");
          const fName = existingAssociate.firstName !== undefined ? existingAssociate.firstName : split.firstName;
          const lName = existingAssociate.lastName !== undefined ? existingAssociate.lastName : split.lastName;
          if (firstInput && !firstInput.value.trim()) firstInput.value = fName;
          if (lastInput && !lastInput.value.trim()) lastInput.value = lName;
          if (phoneInput && !phoneInput.value.trim()) phoneInput.value = existingAssociate.phone || "";
          if (levelSelect && existingAssociate.level) levelSelect.value = existingAssociate.level;
          if (existingAssociate.avatar) {
            if (existingAssociate.avatar.startsWith("data:image")) {
              state.uploadedAvatarDataUrl = existingAssociate.avatar;
              state.selectedAvatarPreset = null;
            } else {
              state.uploadedAvatarDataUrl = null;
              const matchedPreset = PRESET_AVATARS.find(p => p.emoji === existingAssociate.avatar);
              state.selectedAvatarPreset = matchedPreset ? matchedPreset.id : "avatar-1";
            }
            renderAvatarPresets();
            updateProfileAvatarPreview(existingAssociate.avatar);
          }
          showToast(`Welcome back, ${existingAssociate.name}! Restored your profile from cloud.`, "success");
        } else {
          showToast("Email verified! Your profile is automatically saved.", "success");
        }

        const verifiedChip = document.getElementById("email-verified-chip");
        if (verifiedChip) {
          verifiedChip.style.display = "block";
          verifiedChip.textContent = `✅ Email Confirmed: ${state.verifiedEmail}`;
        }
        if (codeGroup) codeGroup.style.display = "none";
        if (errorAlert) errorAlert.style.display = "none";

        updateSaveProfileButtonState();
        autoSaveProfileIfVerified(false);
      } else {
        showToast("Incorrect code. Please try again.", "error");
      }
    });

    emailInput?.addEventListener("input", () => {
      const cur = emailInput.value.trim().toLowerCase();
      if (cur !== state.verifiedEmail.toLowerCase()) {
        state.isEmailVerified = false;
        const verifiedChip = document.getElementById("email-verified-chip");
        if (verifiedChip) verifiedChip.style.display = "none";
      }
      updateSaveProfileButtonState();
    });

    // Live phone number formatting as user types: (XXX) XXX-XXXX
    const phoneInputEl = document.getElementById("profile-phone");
    phoneInputEl?.addEventListener("input", (e) => {
      const formatted = formatPhoneNumberLive(e.target.value);
      if (e.target.value !== formatted) {
        e.target.value = formatted;
      }
      autoSaveProfileIfVerified(false);
    });

    // Auto-save profile whenever first name, last name, or level changes once email is verified
    document.getElementById("profile-first-name")?.addEventListener("input", () => {
      autoSaveProfileIfVerified(false);
    });
    document.getElementById("profile-last-name")?.addEventListener("input", () => {
      autoSaveProfileIfVerified(false);
    });
    document.getElementById("profile-level")?.addEventListener("change", () => {
      autoSaveProfileIfVerified(false);
    });

    // Also auto-save if user closes the profile modal via X or backdrop after verifying email
    document.getElementById("btn-close-profile-modal")?.addEventListener("click", () => {
      autoSaveProfileIfVerified(true);
    });
    document.getElementById("modal-profile")?.addEventListener("click", (e) => {
      if (e.target && e.target.id === "modal-profile") {
        autoSaveProfileIfVerified(true);
      }
    });

    // 11. Profile Form Submit (Stores Device Info, Sends Manager Request Email & Shows Popup)
    document.getElementById("form-profile")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const firstName = document.getElementById("profile-first-name")?.value.trim() || "";
      const lastName = document.getElementById("profile-last-name")?.value.trim() || "";
      const name = [firstName, lastName].filter(Boolean).join(" ").trim();
      const email = document.getElementById("profile-email")?.value.trim();
      const rawPhone = document.getElementById("profile-phone")?.value.trim();
      const phone = formatPhoneNumberLive(rawPhone) || rawPhone;
      const level = parseInt(document.getElementById("profile-level")?.value, 10) || 1;

      if (!firstName || !lastName || !phone || !email || !level) {
        showToast("Please fill in your First Name, Last Name, Email, Phone, and Level!", "error");
        return;
      }

      if (!state.isEmailVerified || state.verifiedEmail.toLowerCase() !== email.toLowerCase()) {
        showToast("Please verify your email address using the 6-digit code first!", "error");
        return;
      }

      let finalAvatar = "👨‍🍳";
      let finalAvatarBg = "#FFE8E6";

      if (state.uploadedAvatarDataUrl) {
        finalAvatar = state.uploadedAvatarDataUrl;
      } else if (!state.selectedAvatarPreset && state.userProfile?.avatar?.startsWith("data:image")) {
        finalAvatar = state.userProfile.avatar;
      } else {
        const preset = PRESET_AVATARS.find(p => p.id === state.selectedAvatarPreset) || PRESET_AVATARS[0];
        finalAvatar = preset.emoji;
        finalAvatarBg = preset.bg;
      }

      // Reuse existing associate ID if signing in with the same email on another device
      const existingAssoc = state.associates.find(
        a => a.email && a.email.trim().toLowerCase() === email.toLowerCase()
      );
      const isAlreadyApproved = existingAssoc
        ? existingAssoc.approved !== false
        : (state.userProfile?.approved === true);

      const dev = detectDeviceDetails();
      const updatedProfile = {
        id: existingAssoc?.id || state.userProfile?.id || `user-438-${Date.now()}`,
        name,
        firstName,
        lastName,
        email,
        phone,
        level,
        avatar: finalAvatar,
        avatarBg: finalAvatarBg,
        approved: isAlreadyApproved,
        joinedAt: existingAssoc?.joinedAt || state.userProfile?.joinedAt || new Date().toISOString(),
        device: { ...dev, approved: isAlreadyApproved, firstName, lastName }
      };

      saveUserProfile(updatedProfile);
      playSuccess();
      closeModal(document.getElementById("modal-profile"));

      if (!isAlreadyApproved) {
        state.lastNotifiedRequestEmail = email.toLowerCase();
        sendManagerAccountRequestEmail(updatedProfile);
        openModal(document.getElementById("modal-request-submitted"));
      } else {
        showToast(`Profile saved & synced across devices! Welcome ${name} (L${level})`, "success");
      }

      state.currentView === "month" ? renderCalendarMonth() : renderWeekView();
    });

    document.getElementById("btn-login-to-contact")?.addEventListener("click", () => {
      playPop();
      closeModal(document.getElementById("modal-shift-details"));
      if (hasCompleteProfile() && !isApprovedProfile()) {
        showToast("Your account is currently awaiting manager approval.", "default");
      } else {
        openProfileModal(false);
      }
    });

    // 12. Post / Edit Shift Form Submit (Syncs to Supabase)
    document.getElementById("form-post-shift")?.addEventListener("submit", async (e) => {
      e.preventDefault();

      const editingId = state.editingShiftId;
      const existingShift = editingId ? state.shifts.find(s => s.id === editingId) : null;

      if (!existingShift) {
        if (!hasCompleteProfile()) {
          showToast("Setup Required: Please complete your profile before posting a shift!", "error");
          openProfileModal(true);
          return;
        }
        if (!state.isAdmin && !isApprovedProfile()) {
          showToast("Your account request is pending manager approval before you can post shifts.", "default");
          return;
        }
      } else if (!isShiftOwner(existingShift) && !state.isAdmin) {
        showToast("Only the person who posted this shift can edit its details!", "error");
        return;
      }

      const dateVal = document.getElementById("post-date")?.value;
      const startTimeVal = document.getElementById("post-start-time")?.value;
      const endTimeVal = document.getElementById("post-end-time")?.value;
      const notesVal = document.getElementById("post-notes")?.value.trim();
      const offerVal = Math.max(
        0,
        Math.min(100, parseInt(document.getElementById("post-offer-slider")?.value || "0", 10) || 0)
      );

      if (!dateVal || !startTimeVal || !endTimeVal) {
        showToast("Please provide date, start time, and end time", "error");
        return;
      }

      if (existingShift) {
        existingShift.date = dateVal;
        existingShift.startTime = startTimeVal;
        existingShift.endTime = endTimeVal;
        existingShift.notes = notesVal;
        existingShift.offerAmount = offerVal;

        saveShifts(state.shifts);
        upsertShiftToSupabase(existingShift);

        state.editingShiftId = null;
        playSuccess();
        showToast("Shift details updated!", "success");
        closeModal(document.getElementById("modal-post-shift"));
        document.getElementById("form-post-shift")?.reset();

        state.selectedCalendarDay = dateVal;
        updateCountsAndTitle();
        state.currentView === "month" ? renderCalendarMonth() : renderWeekView();
        return;
      }

      const newShift = {
        id: `shift-${Date.now()}`,
        date: dateVal,
        startTime: startTimeVal,
        endTime: endTimeVal,
        notes: notesVal,
        offerAmount: offerVal,
        status: "open",
        authorId: state.userProfile.id,
        authorName: state.userProfile.name,
        authorEmail: state.userProfile.email,
        authorPhone: state.userProfile.phone,
        authorLevel: state.userProfile.level,
        authorAvatar: state.userProfile.avatar,
        authorAvatarBg: state.userProfile.avatarBg,
        createdAt: new Date().toISOString()
      };

      state.shifts.unshift(newShift);
      saveShifts(state.shifts);
      upsertShiftToSupabase(newShift);

      state.editingShiftId = null;
      playSuccess();
      showToast("Shift posted & synced to 438 Shifts board!", "success");
      closeModal(document.getElementById("modal-post-shift"));
      document.getElementById("form-post-shift")?.reset();

      state.selectedCalendarDay = dateVal;
      updateCountsAndTitle();
      state.currentView === "month" ? renderCalendarMonth() : renderWeekView();
    });

    // 12b. Edit Shift Action inside Shift Details Modal
    document.getElementById("btn-edit-shift")?.addEventListener("click", () => {
      const shift = state.shifts.find(s => s.id === state.selectedShiftId);
      if (!shift) return;

      if (!isShiftOwner(shift) && !state.isAdmin) {
        showToast("Only the person who posted this shift can edit its details!", "error");
        return;
      }

      playPop();
      closeModal(document.getElementById("modal-shift-details"));
      openPostShiftModal(null, shift);
    });

    // 13. Cover Shift Action (ONLY the person who posted the shift can click this; removes it forever!)
    document.getElementById("btn-shift-covered")?.addEventListener("click", () => {
      const shift = state.shifts.find(s => s.id === state.selectedShiftId);
      if (!shift) return;

      if (!isShiftOwner(shift)) {
        showToast("Only the person who posted this shift can mark it as covered!", "error");
        return;
      }

      permanentlyRemoveShift(
        shift.id,
        "Shift covered! Taken down from the board for everyone.",
        true
      );
    });

    // 14. Copy Phone Number
    document.getElementById("btn-copy-phone")?.addEventListener("click", () => {
      const shift = state.shifts.find(s => s.id === state.selectedShiftId);
      if (!shift || !shift.authorPhone) return;

      navigator.clipboard.writeText(shift.authorPhone).then(() => {
        playPop();
        showToast("Phone number copied to clipboard!", "success");
      }).catch(() => {
        showToast(shift.authorPhone, "default");
      });
    });

    // 15. Delete Shift Action (Store Manager can delete ANY shift)
    document.getElementById("btn-delete-shift")?.addEventListener("click", () => {
      const shift = state.shifts.find(s => s.id === state.selectedShiftId);
      if (!shift) return;

      const isMine = isShiftOwner(shift);
      if (!state.isAdmin && !isMine) {
        showToast("Only a store manager or the shift poster can remove this post!", "error");
        return;
      }

      const msg = state.isAdmin
        ? `👑 Store Manager Action: Permanently delete ${shift.authorName}'s shift from the board for everyone?`
        : "Permanently remove your shift from the board?";

      if (!confirm(msg)) return;

      permanentlyRemoveShift(
        shift.id,
        state.isAdmin ? "Shift deleted by Store Manager" : "Shift post removed",
        false
      );
    });
  }

  // Run on ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initApp);
  } else {
    initApp();
  }

})();
