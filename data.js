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

// Generate realistic mock shifts anchored around a given date
export function generateSeedShifts(baseDate = new Date()) {
  const shifts = [];
  
  const mockCrew = [
    {
      id: "u-101",
      name: "Marcus Vance",
      phone: "(949) 555-0142",
      level: 5,
      avatar: "👨‍🍳",
      avatarBg: "#FFE8E6"
    },
    {
      id: "u-102",
      name: "Elena Rodriguez",
      phone: "(949) 555-0188",
      level: 4,
      avatar: "🍟",
      avatarBg: "#FFF8E1"
    },
    {
      id: "u-103",
      name: "Devon Miller",
      phone: "(714) 555-0199",
      level: 6,
      avatar: "🧢",
      avatarBg: "#FFF4D2"
    },
    {
      id: "u-104",
      name: "Sarah Chen",
      phone: "(949) 555-0114",
      level: 3,
      avatar: "🥤",
      avatarBg: "#E0F2F1"
    },
    {
      id: "u-105",
      name: "Jordan Taylor",
      phone: "(949) 555-0173",
      level: 2,
      avatar: "👩‍🍳",
      avatarBg: "#E3F2FD"
    },
    {
      id: "u-106",
      name: "Austin Blake",
      phone: "(714) 555-0131",
      level: 4,
      avatar: "🌟",
      avatarBg: "#E8F5E9"
    },
    {
      id: "u-107",
      name: "Brianna Diaz",
      phone: "(949) 555-0165",
      level: 5,
      avatar: "🍔",
      avatarBg: "#FFF3E0"
    }
  ];

  // Offsets from baseDate: today, tomorrow, +2 days, +3 days, +4 days, +5 days, -1 day
  const shiftTemplates = [
    {
      dayOffset: 0,
      startTime: "16:00",
      endTime: "22:30",
      role: "Board / Wrap",
      notes: "Need someone to take my closing board shift! Have a college mid-term review.",
      crewIndex: 0,
      status: "open"
    },
    {
      dayOffset: 1,
      startTime: "11:00",
      endTime: "16:30",
      role: "Fries Table",
      notes: "Lunch rush fry shift. Need coverage for dentist appointment.",
      crewIndex: 1,
      status: "open"
    },
    {
      dayOffset: 2,
      startTime: "17:00",
      endTime: "01:00",
      role: "Grill / Cook",
      notes: "Level 6 grill closer! Big hours (8 hrs). Looking for a solid cook to swap with.",
      crewIndex: 2,
      status: "open"
    },
    {
      dayOffset: 2,
      startTime: "12:00",
      endTime: "17:00",
      role: "Drive-Thru Window",
      notes: "Afternoon drive-thru. Sister's graduation ceremony, please help!",
      crewIndex: 3,
      status: "open"
    },
    {
      dayOffset: 3,
      startTime: "10:30",
      endTime: "15:30",
      role: "Front Register",
      notes: "Morning dining room & order taking. Easy 5 hr shift.",
      crewIndex: 4,
      status: "open"
    },
    {
      dayOffset: 4,
      startTime: "15:30",
      endTime: "21:30",
      role: "Fry Table & Dicer",
      notes: "Dinner rush fries. Willing to trade for Sunday morning if possible!",
      crewIndex: 5,
      status: "open"
    },
    {
      dayOffset: 5,
      startTime: "18:00",
      endTime: "23:30",
      role: "Board / Prep",
      notes: "Weekend evening shift. Need off for family birthday dinner.",
      crewIndex: 6,
      status: "open"
    },
    {
      dayOffset: -1,
      startTime: "14:00",
      endTime: "19:30",
      role: "Drive-Thru Handout",
      notes: "Got covered by Jordan!",
      crewIndex: 3,
      status: "claimed",
      claimedBy: "Jordan Taylor"
    }
  ];

  shiftTemplates.forEach((item, index) => {
    const shiftDate = new Date(baseDate);
    shiftDate.setDate(shiftDate.getDate() + item.dayOffset);
    const dateStr = formatDateKey(shiftDate);
    const crew = mockCrew[item.crewIndex];

    shifts.push({
      id: `shift-${Date.now()}-${index}`,
      date: dateStr,
      startTime: item.startTime,
      endTime: item.endTime,
      role: item.role,
      notes: item.notes,
      status: item.status,
      claimedBy: item.claimedBy || null,
      claimedAt: item.status === "claimed" ? new Date().toISOString() : null,
      authorId: crew.id,
      authorName: crew.name,
      authorPhone: crew.phone,
      authorLevel: crew.level,
      authorAvatar: crew.avatar,
      authorAvatarBg: crew.avatarBg,
      createdAt: new Date(Date.now() - (index * 3600000 * 4)).toISOString()
    });
  });

  return shifts;
}
