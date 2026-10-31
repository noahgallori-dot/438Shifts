// Data definitions & initial mock shifts for In-N-Out Crew Shift Swap

export const ASSOCIATE_LEVELS = {
  1: {
    level: 1,
    title: "Host & Dining Room",
    short: "L1 • Dining",
    color: "#4A5568",
    bg: "#EDF2F7",
    description: "Dining room care, hosting, courtesy, dining room cleanliness"
  },
  2: {
    level: 2,
    title: "Order Taker & Front Counter",
    short: "L2 • Counter",
    color: "#2B6CB0",
    bg: "#EBF8FF",
    description: "Front counter order taking, register, customer service"
  },
  3: {
    level: 3,
    title: "Drive-Thru & Drinks / Handout",
    short: "L3 • Drive-Thru",
    color: "#2C7A7B",
    bg: "#E6FFFA",
    description: "Corner handheld, drink coordinator, drive-thru handout window"
  },
  4: {
    level: 4,
    title: "Fries Master & Potato Dicer",
    short: "L4 • Fries",
    color: "#DD6B20",
    bg: "#FEEBC8",
    description: "Fresh potato dicing, oil quality, fry table pacing & animal fries"
  },
  5: {
    level: 5,
    title: "Board / Dressing Burgers",
    short: "L5 • Board",
    color: "#9B2C2C",
    bg: "#FED7D7",
    description: "Bun toasting, dressing spreads, lettuce, tomato & packaging"
  },
  6: {
    level: 6,
    title: "Grill Master / Cook",
    short: "L6 • Cook",
    color: "#C53030",
    bg: "#FFF5F5",
    description: "The Grill! Patty turning, salting, onion grilling & temperature pacing"
  }
};

export const PRESET_AVATARS = [
  { id: "avatar-1", emoji: "👨‍🍳", name: "Chef White Hat", bg: "#FFE8E6" },
  { id: "avatar-2", emoji: "🧢", name: "Red Crew Cap", bg: "#FFF4D2" },
  { id: "avatar-3", emoji: "👩‍🍳", name: "Smile Crew", bg: "#E3F2FD" },
  { id: "avatar-4", emoji: "🌟", name: "Star Associate", bg: "#E8F5E9" },
  { id: "avatar-5", emoji: "🍔", name: "Double-Double Fan", bg: "#FFF3E0" },
  { id: "avatar-6", emoji: "🌴", name: "Palm Coast Vibe", bg: "#F3E5F5" },
  { id: "avatar-7", emoji: "🍟", name: "Fries Specialist", bg: "#FFF8E1" },
  { id: "avatar-8", emoji: "🥤", name: "Shake & Drink", bg: "#E0F2F1" }
];

// Helper to format date YYYY-MM-DD
export function formatDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Seed shifts (none — all shifts and associates are real Store #438 data)
export function generateSeedShifts() {
  return [];
}
