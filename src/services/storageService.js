import {
  INITIAL_USERS,
  INITIAL_FAMILIES,
  INITIAL_MONTHLY_BALANCES,
  INITIAL_TRANSACTIONS,
  INITIAL_MOMENTS,
  INITIAL_GUEST_REPORTS,
  INITIAL_CHAT_MESSAGES,
  FINANCIAL_CATEGORIES
} from "../data/seedData";

export const DEFAULT_THEME_CONFIG = {
  themeId: "gold",
  bgType: "uploaded",
  uploadedBg: "/theme-bg.jpg",
  bgOverlay: "soft",
  uiStyle: "neo-rounded",
  navStyle: "colored",
  fontId: "jakarta",
  customLogo: "/custom-logo.png"
};

const KEYS = {
  USERS: "gang_cinta_users_v3",
  FAMILIES: "gang_cinta_families_v3",
  MONTHLY_BALANCES: "gang_cinta_monthly_balances_v3",
  TRANSACTIONS: "gang_cinta_transactions_v3",
  MOMENTS: "gang_cinta_moments_v3",
  GUEST_REPORTS: "gang_cinta_guest_reports_v3",
  CHAT_MESSAGES: "gang_cinta_chat_messages_v3",
  CURRENT_USER: "gang_cinta_current_user_v3",
  THEME: "gang_cinta_theme_v3",
  SIGNATURES: "gang_cinta_signatures_v3",
  REPORT_APPROVALS: "gang_cinta_report_approvals_v3",
  ACTIVE_SESSIONS: "gang_cinta_active_sessions_v3",
  DUES_CONFIG: "gang_cinta_dues_config_v3",
  ADMIN_WELCOME_TEXT: "gang_cinta_admin_welcome_text_v3",
  GALLERY_HEADER_CONFIG: "gang_cinta_gallery_header_config_v3",
  GUEST_REPORT_HEADER_CONFIG: "gang_cinta_guest_report_header_config_v3",
  IURAN_PAYMENTS: "gang_cinta_iuran_payments_v3",
  DELETED_ENTITIES: "gang_cinta_deleted_entities_v3"
};

function getStored(key, defaultValue) {
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(item);
  } catch (err) {
    console.error(`Error reading ${key} from storage:`, err);
    return defaultValue;
  }
}

function setStored(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving ${key} to storage:`, err);
  }
}

export function getDeletedEntities() {
  return getStored(KEYS.DELETED_ENTITIES, []);
}

export function addDeletedEntity(entity) {
  if (!entity) return;
  const list = getDeletedEntities();
  const id = entity.id || "";
  const name = (entity.name || "").toLowerCase().trim();
  const username = (entity.username || "").toLowerCase().trim();
  const kk = entity.kkNumber || "";

  if (!list.some(x => (id && x.id === id) || (name && x.name === name) || (username && x.username === username))) {
    list.push({ id, name, username, kk, deletedAt: new Date().toISOString() });
    setStored(KEYS.DELETED_ENTITIES, list);
  }
}

export function isDeletedEntity(id, name, username) {
  const list = getDeletedEntities();
  const cleanN = (name || "").toLowerCase().trim();
  const cleanU = (username || "").toLowerCase().trim();
  return list.some(x => 
    (id && x.id === id) ||
    (cleanN && x.name && x.name === cleanN) ||
    (cleanU && x.username && x.username === cleanU)
  );
}

export function cascadeDeleteUser(userId, userName) {
  const protectedUserIds = ["user-admin-1", "user-bendahara-1"];
  if (userId && protectedUserIds.includes(userId)) return;

  const cleanName = (userName || "").trim().toLowerCase();

  // Record into persistent blacklist so it can never be restored
  addDeletedEntity({ id: userId, name: userName });

  // 1. Delete from USERS
  let users = getStored(KEYS.USERS, INITIAL_USERS);
  users = users.filter(u => {
    if (userId && u.id === userId) return false;
    if (cleanName && u.name?.toLowerCase().trim() === cleanName && !protectedUserIds.includes(u.id)) return false;
    return true;
  });
  setStored(KEYS.USERS, users);

  // 2. Delete from ACTIVE_SESSIONS
  const sessions = getStored(KEYS.ACTIVE_SESSIONS, {});
  let sessionsChanged = false;
  Object.keys(sessions).forEach(id => {
    if (id === userId || (userId && id === `derived-${userId}`) || (cleanName && id.toLowerCase().includes(cleanName))) {
      delete sessions[id];
      sessionsChanged = true;
    }
  });
  if (sessionsChanged) setStored(KEYS.ACTIVE_SESSIONS, sessions);

  // 3. Delete from CHAT_MESSAGES
  let chats = getStored(KEYS.CHAT_MESSAGES, INITIAL_CHAT_MESSAGES);
  const originalChatCount = chats.length;
  chats = chats.filter(c => {
    if (userId && c.senderId === userId) return false;
    if (cleanName && c.senderName?.toLowerCase().trim() === cleanName) return false;
    return true;
  });
  if (chats.length !== originalChatCount) {
    setStored(KEYS.CHAT_MESSAGES, chats);
  }

  // 4. Delete from GUEST_REPORTS
  let reports = getStored(KEYS.GUEST_REPORTS, INITIAL_GUEST_REPORTS);
  const originalReportCount = reports.length;
  reports = reports.filter(r => {
    if (userId && r.reporterUserId === userId) return false;
    if (cleanName && r.reporterName?.toLowerCase().trim() === cleanName) return false;
    return true;
  });
  if (reports.length !== originalReportCount) {
    setStored(KEYS.GUEST_REPORTS, reports);
  }

  // 5. Delete corresponding FAMILY record or remove member from existing families
  let families = getStored(KEYS.FAMILIES, INITIAL_FAMILIES);
  let famChanged = false;

  families = families.filter(f => {
    // If whole family is directly tied to this user and has no other members, remove it
    const isHead = cleanName && f.headOfFamily?.toLowerCase().trim() === cleanName;
    const isAssigned = userId && (f.assignedUserId === userId || f.id === userId.replace('derived-', ''));
    if ((isHead || isAssigned) && (!f.members || f.members.length <= 1)) {
      famChanged = true;
      return false;
    }
    return true;
  });

  // Also purge member from within any remaining family's members list
  families.forEach(f => {
    if (Array.isArray(f.members)) {
      const origLen = f.members.length;
      f.members = f.members.filter(m => {
        if (userId && m.id === userId) return false;
        if (cleanName && m.fullName?.toLowerCase().trim() === cleanName) return false;
        return true;
      });
      if (f.members.length !== origLen) {
        famChanged = true;
        // If the removed member was headOfFamily, reassign to first remaining member
        if (cleanName && f.headOfFamily?.toLowerCase().trim() === cleanName) {
          if (f.members.length > 0) {
            f.headOfFamily = f.members[0].fullName;
          }
        }
      }
    }
  });

  if (famChanged) {
    setStored(KEYS.FAMILIES, families);
  }

  // 6. Delete from TRANSACTIONS
  let transactions = getStored(KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
  const origTrxLen = transactions.length;
  transactions = transactions.filter(t => {
    const tTitle = (t.title || "").toLowerCase();
    if (cleanName && tTitle.includes(cleanHeadName(cleanName))) return false;
    return true;
  });
  if (transactions.length !== origTrxLen) {
    setStored(KEYS.TRANSACTIONS, transactions);
  }

  // 7. Delete from IURAN_PAYMENTS
  const allPayments = getStored(KEYS.IURAN_PAYMENTS, {});
  let paymentsChanged = false;
  Object.keys(allPayments).forEach(mKey => {
    const monthList = allPayments[mKey] || [];
    const filtered = monthList.filter(item => {
      if (typeof item === 'object') {
        const itemName = (item.name || "").toLowerCase();
        if (cleanName && itemName.includes(cleanHeadName(cleanName))) return false;
      }
      return true;
    });
    if (filtered.length !== monthList.length) {
      allPayments[mKey] = filtered;
      paymentsChanged = true;
    }
  });
  if (paymentsChanged) {
    setStored(KEYS.IURAN_PAYMENTS, allPayments);
  }

  // 8. Clear CURRENT_USER if logged in as this deleted user
  try {
    const item = localStorage.getItem(KEYS.CURRENT_USER);
    if (item) {
      const curr = JSON.parse(item);
      if ((userId && curr.id === userId) || (cleanName && curr.name?.toLowerCase().trim() === cleanName)) {
        localStorage.removeItem(KEYS.CURRENT_USER);
      }
    }
  } catch (err) {
    console.error(err);
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event("users-data-changed"));
    window.dispatchEvent(new Event("families-data-changed"));
    window.dispatchEvent(new Event("finance-data-changed"));
  }
}

function cleanHeadName(name) {
  return (name || "").replace(/^(bpk\.|ibu\.|h\.|hj\.)\s*/i, "").trim().toLowerCase();
}

export function initStorage() {
  let users = getStored(KEYS.USERS, INITIAL_USERS);
  let families = getStored(KEYS.FAMILIES, INITIAL_FAMILIES);

  // Total purge of deleted dummy families and their derived accounts
  const removedDummyFamIds = ["kk-6", "kk-7", "kk-8", "kk-9"];
  const removedDummyNames = ["bpk. bambang sugianto", "bambang sugianto", "bpk. hendra gunawan", "hendra gunawan", "bpk. eko prasetyo", "eko prasetyo", "bpk. dedi kurniawan", "dedi kurniawan"];
  families = families.filter(f => !removedDummyFamIds.includes(f.id) && !removedDummyNames.includes((f.headOfFamily || "").toLowerCase().trim()));
  users = users.filter(u => !removedDummyFamIds.some(id => u.id === `derived-${id}` || u.username === `warga_${id}`) && !removedDummyNames.includes((u.name || "").toLowerCase().trim()));
  setStored(KEYS.FAMILIES, families);
  setStored(KEYS.USERS, users);

  let sessions = getStored(KEYS.ACTIVE_SESSIONS, {});
  let sessionsUpdated = false;
  removedDummyFamIds.forEach(id => {
    if (sessions[id]) { delete sessions[id]; sessionsUpdated = true; }
    if (sessions[`derived-${id}`]) { delete sessions[`derived-${id}`]; sessionsUpdated = true; }
  });
  if (sessionsUpdated) {
    setStored(KEYS.ACTIVE_SESSIONS, sessions);
  }

  const defaultUserIds = [
    "user-admin-1", 
    "user-bendahara-1", 
    "user-warga-1", 
    "user-warga-2", 
    "user-warga-3",
    "user-1790431976879",
    "user-1790433466331",
    "user-1790435683163",
    "user-1790439460209",
    "user-1790439500480"
  ];

  let usersUpdated = false;
  let familiesUpdated = false;

  // Purge any deleted entities from storage
  const deletedEntities = getDeletedEntities();
  if (deletedEntities.length > 0) {
    const origUserLen = users.length;
    users = users.filter(u => !isDeletedEntity(u.id, u.name, u.username));
    if (users.length !== origUserLen) usersUpdated = true;

    const origFamLen = families.length;
    families = families.filter(f => !isDeletedEntity(f.id, f.headOfFamily));
    // Also purge deleted members from inside families
    families.forEach(f => {
      if (Array.isArray(f.members)) {
        const mLen = f.members.length;
        f.members = f.members.filter(m => !isDeletedEntity(m.id, m.fullName));
        if (f.members.length !== mLen) familiesUpdated = true;
      }
    });
    if (families.length !== origFamLen) familiesUpdated = true;
  }

  // Only seed users/families if they have NOT been marked as deleted
  INITIAL_USERS.forEach(su => {
    if (isDeletedEntity(su.id, su.name, su.username)) return;
    if (!users.some(u => u.id === su.id || u.username === su.username || (u.name && u.name.toLowerCase() === su.name.toLowerCase()))) {
      users.push(su);
      usersUpdated = true;
    }
  });

  INITIAL_FAMILIES.forEach(sf => {
    if (isDeletedEntity(sf.id, sf.headOfFamily)) return;
    if (!families.some(f => f.id === sf.id || (f.headOfFamily && f.headOfFamily.toLowerCase() === sf.headOfFamily.toLowerCase()))) {
      families.push(sf);
      familiesUpdated = true;
    }
  });

  if (familiesUpdated) {
    setStored(KEYS.FAMILIES, families);
  }

  users = users.map(u => {
    let newU = { ...u };
    const cleanJab = (newU.jabatan || "").toLowerCase().trim();
    const isKetua = cleanJab === "ketua gang" || (newU.icon === "👑" && cleanJab.includes("ketua"));

    if (!newU.jabatan) {
      newU.jabatan = newU.role === "admin" ? "Ketua Gang" : (newU.role === "bendahara" ? "Bendahara Kas" : "Warga Biasa");
      newU.icon = newU.role === "admin" ? "👑" : (newU.role === "bendahara" ? "💰" : "👤");
      usersUpdated = true;
    } else if (!isKetua) {
      if (newU.role === "admin") {
        newU.role = cleanJab.includes("bendahara") ? "bendahara" : "anggota";
        usersUpdated = true;
      }
      if (newU.icon === "👑") {
        if (cleanJab.includes("bendahara")) newU.icon = "💰";
        else if (cleanJab.includes("keagamaan")) newU.icon = "🕌";
        else if (cleanJab.includes("humas")) newU.icon = "🤝";
        else if (cleanJab.includes("keamanan")) newU.icon = "🛡️";
        else if (cleanJab.includes("kebersihan")) newU.icon = "🧹";
        else if (cleanJab.includes("olahraga")) newU.icon = "🏆";
        else if (cleanJab.includes("sekretaris")) newU.icon = "📜";
        else if (cleanJab.includes("wakil")) newU.icon = "🎖️";
        else if (cleanJab.includes("sesepuh")) newU.icon = "👴";
        else newU.icon = "👤";
        usersUpdated = true;
      }
    }
    return newU;
  });

  if (usersUpdated || !localStorage.getItem(KEYS.USERS)) {
    setStored(KEYS.USERS, users);
  }

  // Ensure default login status is logged out for everyone
  if (!localStorage.getItem("gc_default_logout_v1")) {
    try {
      localStorage.removeItem(KEYS.CURRENT_USER);
      localStorage.setItem("gc_default_logout_v1", "true");
    } catch {}
  }

  // Force sync CURRENT_USER if logged in
  try {
    const item = localStorage.getItem(KEYS.CURRENT_USER);
    if (item) {
      let curr = JSON.parse(item);
      const match = users.find(u => u.id === curr.id || (u.name && curr.name && u.name.trim().toLowerCase() === curr.name.trim().toLowerCase()));
      if (match && (curr.name !== match.name || curr.jabatan !== match.jabatan || curr.role !== match.role || curr.icon !== match.icon || curr.avatar !== match.avatar)) {
        curr = { ...curr, ...match };
        setStored(KEYS.CURRENT_USER, curr);
      }
    }
  } catch (err) {
    console.error("Error syncing current user:", err);
  }

  // Sync Chat Messages
  let chats = getStored(KEYS.CHAT_MESSAGES, INITIAL_CHAT_MESSAGES);
  let chatUpdated = false;
  chats = chats.map(c => {
    let newC = { ...c };
    const sender = users.find(u => u.id === newC.senderId);
    if (sender && (newC.senderName !== sender.name || newC.senderRole !== sender.role)) {
      newC.senderName = sender.name;
      newC.senderRole = sender.role;
      newC.senderAvatar = sender.avatar;
      chatUpdated = true;
    }
    return newC;
  });
  if (chatUpdated) {
    setStored(KEYS.CHAT_MESSAGES, chats);
  }

  // Sync Families
  let famUpdated = false;
  families = families.map(f => {
    let newF = { ...f };
    const head = users.find(u => u.id === newF.assignedUserId);
    if (head && newF.headOfFamily !== head.name) {
      newF.headOfFamily = head.name;
      famUpdated = true;
    }
    return newF;
  });
  if (famUpdated) {
    setStored(KEYS.FAMILIES, families);
  }

  getStored(KEYS.MONTHLY_BALANCES, INITIAL_MONTHLY_BALANCES);
  getStored(KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
  getStored(KEYS.MOMENTS, INITIAL_MOMENTS);
  getStored(KEYS.GUEST_REPORTS, INITIAL_GUEST_REPORTS);
  
  if (!localStorage.getItem(KEYS.THEME)) {
    localStorage.setItem(KEYS.THEME, JSON.stringify(DEFAULT_THEME_CONFIG));
  }
}

// --- THEME SERVICE ---
export const themeService = {
  getTheme() {
    initStorage();
    const stored = getStored(KEYS.THEME, DEFAULT_THEME_CONFIG);
    if (typeof stored === "string") {
      return { ...DEFAULT_THEME_CONFIG, themeId: stored };
    }
    return stored || DEFAULT_THEME_CONFIG;
  },
  setTheme(themeConfig) {
    if (typeof themeConfig === "string") {
      const prev = this.getTheme();
      const next = { ...prev, themeId: themeConfig };
      setStored(KEYS.THEME, next);
      return next;
    }
    setStored(KEYS.THEME, themeConfig);
    return themeConfig;
  }
};

// --- AUTH / USER SERVICE ---
export const authService = {
  getCurrentUser() {
    initStorage();
    try {
      const item = localStorage.getItem(KEYS.CURRENT_USER);
      if (item) {
        let curr = JSON.parse(item);
        if (curr && (curr.isLoggedOut || !curr.id)) return null;
        const users = this.getAllUsers();
        const updated = users.find(u => u.id === curr.id || (u.name && curr.name && u.name.trim().toLowerCase() === curr.name.trim().toLowerCase()));
        if (updated) {
          return { ...curr, ...updated };
        }
        return curr;
      }
      // Default to logged out / guest mode
      return null;
    } catch {
      return null;
    }
  },
  
  setCurrentUser(user) {
    if (user) {
      setStored(KEYS.CURRENT_USER, user);
      const sessions = getStored(KEYS.ACTIVE_SESSIONS, {});
      const now = Date.now();
      const activeId = user.id;
      const activeName = (user.name || "").toLowerCase().trim();
      const allUsers = this.getAllUsers();

      sessions[activeId] = now;
      allUsers.forEach(u => {
        const uName = (u.name || "").toLowerCase().trim();
        if (
          (activeId && u.id === activeId) ||
          (activeName && uName && uName === activeName)
        ) {
          sessions[u.id] = now;
        }
      });
      setStored(KEYS.ACTIVE_SESSIONS, sessions);
    } else {
      const current = this.getCurrentUser();
      const sessions = getStored(KEYS.ACTIVE_SESSIONS, {});
      if (current) {
        const currId = current.id;
        const currName = (current.name || "").toLowerCase().trim();
        const allUsers = this.getAllUsers();

        delete sessions[currId];
        allUsers.forEach(u => {
          const uName = (u.name || "").toLowerCase().trim();
          if (
            (currId && u.id === currId) ||
            (currName && uName && uName === currName)
          ) {
            delete sessions[u.id];
          }
        });
        setStored(KEYS.ACTIVE_SESSIONS, sessions);
      }
      localStorage.removeItem(KEYS.CURRENT_USER);
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event("users-data-changed"));
    }
  },
  
  getAllUsers() {
    initStorage();
    const rawUsers = getStored(KEYS.USERS, INITIAL_USERS);
    const families = getStored(KEYS.FAMILIES, INITIAL_FAMILIES);

    // Deduplicate rawUsers by ID or lowercase name to prevent double entries in storage
    const uniqueUsersMap = new Map();
    let hasDuplicatesInStorage = false;

    rawUsers.forEach(u => {
      const cleanName = (u.name || "").trim().toLowerCase();
      const key = u.id || cleanName;

      if (!key) {
        uniqueUsersMap.set(u.id || `anon-${Date.now()}`, u);
        return;
      }

      if (uniqueUsersMap.has(key)) {
        hasDuplicatesInStorage = true;
        const existing = uniqueUsersMap.get(key);
        const merged = {
          ...existing,
          ...u
        };
        uniqueUsersMap.set(key, merged);
      } else {
        uniqueUsersMap.set(key, u);
      }
    });

    const cleanUsers = Array.from(uniqueUsersMap.values());

    // Strictly enforce 1 Admin rule & sanitize non-Ketua Gang accounts
    cleanUsers.forEach(u => {
      const cleanJab = (u.jabatan || "").toLowerCase().trim();
      const isKetua = cleanJab === "ketua gang" || (u.icon === "👑" && cleanJab.includes("ketua"));

      if (!isKetua) {
        if (u.role === "admin") {
          u.role = cleanJab.includes("bendahara") ? "bendahara" : "anggota";
          hasDuplicatesInStorage = true;
        }
        if (u.icon === "👑") {
          if (cleanJab.includes("bendahara")) u.icon = "💰";
          else if (cleanJab.includes("keagamaan")) u.icon = "🕌";
          else if (cleanJab.includes("humas")) u.icon = "🤝";
          else if (cleanJab.includes("keamanan")) u.icon = "🛡️";
          else if (cleanJab.includes("kebersihan")) u.icon = "🧹";
          else if (cleanJab.includes("olahraga")) u.icon = "🏆";
          else if (cleanJab.includes("sekretaris")) u.icon = "📜";
          else if (cleanJab.includes("wakil")) u.icon = "🎖️";
          else if (cleanJab.includes("sesepuh")) u.icon = "👴";
          else u.icon = "👤";
          hasDuplicatesInStorage = true;
        }
      }
    });

    if (hasDuplicatesInStorage) {
      setStored(KEYS.USERS, cleanUsers);
    }

    const userNames = new Set(cleanUsers.map(u => (u.name || "").toLowerCase().trim()));
    const userHouses = new Set(cleanUsers.map(u => (u.houseNo || "").toLowerCase().trim()));
    const result = [...cleanUsers];

    // Strictly 1 Kepala Rumah Tangga per KK in the Chat/User list
    families.forEach(f => {
      const famId = f.id;
      const headName = (f.headOfFamily || "").trim();
      if (!headName) return;

      const cleanHead = headName.toLowerCase();
      const houseNo = (f.houseNumber || "").trim();
      const cleanBlock = (f.block || "").trim();

      let formattedHouse = houseNo;
      if (cleanBlock && !houseNo.toLowerCase().includes(cleanBlock.toLowerCase())) {
        formattedHouse = `${cleanBlock} ${houseNo}`;
      }
      const cleanHouse = formattedHouse.toLowerCase().trim();

      const linkedUser = f.assignedUserId ? cleanUsers.find(u => u.id === f.assignedUserId) : null;
      const existsInUsers = linkedUser || userNames.has(cleanHead) || (cleanHouse && userHouses.has(cleanHouse));

      if (!existsInUsers) {
        result.push({
          id: `derived-${famId}`,
          name: headName,
          username: `warga_${famId}`,
          password: "123",
          role: "anggota",
          jabatan: "Kepala Keluarga",
          icon: "👤",
          houseNo: formattedHouse || "RT 028",
          phone: f.phone || "",
          avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`
        });
        userNames.add(cleanHead);
        if (cleanHouse) userHouses.add(cleanHouse);
      }
    });

    return result;
  },
  
  login(username, password) {
    const users = this.getAllUsers();
    const cleanUser = (username || "").trim().toLowerCase();
    const cleanPass = String(password || "").trim();

    // 1. Try matching by exact username
    let found = users.find(
      u => (u.username || "").toLowerCase().trim() === cleanUser && String(u.password || "").trim() === cleanPass
    );

    // 2. Also allow login by full name if resident typed their real name
    if (!found) {
      found = users.find(
        u => (u.name || "").toLowerCase().trim() === cleanUser && String(u.password || "").trim() === cleanPass
      );
    }

    if (found) {
      this.setCurrentUser(found);
      return { success: true, user: found };
    }
    return { success: false, message: "Username atau password salah. Coba pilih akun cepat di bawah." };
  },

  logout() {
    this.setCurrentUser(null);
    try {
      localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify({ isLoggedOut: true }));
    } catch {}
  },
  
  updateUserAccount(userId, { name, jabatan, icon, role, username, password, phone, houseNo }) {
    initStorage();
    const rawUsers = getStored(KEYS.USERS, INITIAL_USERS);
    let users = [...rawUsers];

    const cleanName = (name || "").trim().toLowerCase();
    const cleanHouse = (houseNo || "").trim().toLowerCase();

    // First try to find existing user account by explicit ID or matching Name
    let userIndex = users.findIndex(u => 
      (userId && u.id === userId) ||
      (cleanName && (u.name || "").trim().toLowerCase() === cleanName)
    );

    const families = familyService.getFamilies();
    let targetFam = null;
    if (userId && userId.startsWith("derived-")) {
      const famId = userId.replace("derived-", "");
      targetFam = families.find(f => f.id === famId);
    } else {
      targetFam = families.find(f => f.assignedUserId === userId || (cleanName && (f.headOfFamily || "").trim().toLowerCase() === cleanName));
    }

    if (userIndex === -1) {
      // Create permanent real user account for this family
      const famId = targetFam ? targetFam.id : Date.now();
      const newUser = {
        id: `user-${Date.now()}`,
        name: (name || targetFam?.headOfFamily || "Warga").trim(),
        username: (username || `warga_${famId}`).trim().toLowerCase(),
        password: password || "123",
        role: role || "anggota",
        jabatan: jabatan ? jabatan.trim() : "Warga Biasa",
        icon: icon || "👤",
        houseNo: houseNo || (targetFam ? `${targetFam.block || ''} ${targetFam.houseNumber || ''}`.trim() : "RT 028"),
        phone: phone !== undefined ? phone : (targetFam?.phone || ""),
        avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`
      };
      users.push(newUser);
      userIndex = users.length - 1;
      userId = newUser.id;

      if (targetFam) {
        targetFam.assignedUserId = newUser.id;
        setStored(KEYS.FAMILIES, families);
      }
    } else {
      userId = users[userIndex].id;
      if (targetFam && targetFam.assignedUserId !== userId) {
        targetFam.assignedUserId = userId;
        setStored(KEYS.FAMILIES, families);
      }
    }

    if (userIndex !== -1) {
      const u = { ...users[userIndex] };

      // Unique username check: exclude current user AND any entry with identical name (same person)
      if (username) {
        const cleanUser = username.toLowerCase().trim();
        if (cleanUser !== (u.username || "").toLowerCase()) {
          const dup = users.find(
            x => x.id !== userId &&
            (x.username || "").toLowerCase() === cleanUser &&
            (x.name || "").trim().toLowerCase() !== (u.name || "").trim().toLowerCase()
          );
          if (dup) {
            throw new Error(`Username '${cleanUser}' sudah dipakai oleh ${dup.name}. Gunakan username lain.`);
          }
          u.username = cleanUser;
        }
      }

      if (name) u.name = name.trim();
      if (jabatan !== undefined) u.jabatan = jabatan.trim();
      if (icon !== undefined) u.icon = icon;
      if (role !== undefined) {
        u.role = role;
        // Strictly 1 Admin Rule: If promoting a user to admin, demote previous admins
        if (role === "admin") {
          users.forEach((otherUser, idx) => {
            if (idx !== userIndex && otherUser.role === "admin") {
              otherUser.role = "anggota";
            }
          });
        }
      }
      if (password) u.password = password;
      if (phone !== undefined) u.phone = phone;
      if (houseNo !== undefined) u.houseNo = houseNo;

      users[userIndex] = u;
      setStored(KEYS.USERS, users);

      const current = this.getCurrentUser();
      if (current && (current.id === userId || (current.name && u.name && current.name.toLowerCase() === u.name.toLowerCase()))) {
        this.setCurrentUser(u);
      }

      // Sync name/phone in families if headOfFamily or assignedUserId
      let famChanged = false;
      families.forEach(f => {
        if (f.assignedUserId === userId || (u.name && f.headOfFamily && f.headOfFamily.toLowerCase() === u.name.toLowerCase())) {
          f.assignedUserId = u.id;
          if (name) f.headOfFamily = name;
          if (phone !== undefined) f.phone = phone;
          famChanged = true;
        }
      });
      if (famChanged) setStored(KEYS.FAMILIES, families);

      // Sync Chat Messages
      const chats = getStored(KEYS.CHAT_MESSAGES, INITIAL_CHAT_MESSAGES);
      let chatChanged = false;
      chats.forEach(c => {
        if (c.senderId === userId || (u.name && c.senderName && c.senderName.toLowerCase() === u.name.toLowerCase())) {
          c.senderId = u.id;
          if (name) c.senderName = name.trim();
          if (role) c.senderRole = role;
          if (u.avatar) c.senderAvatar = u.avatar;
          if (u.houseNo) c.senderHouse = u.houseNo;
          chatChanged = true;
        }
      });
      if (chatChanged) setStored(KEYS.CHAT_MESSAGES, chats);

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event("users-data-changed"));
        window.dispatchEvent(new Event("families-data-changed"));
      }

      return u;
    }
    return null;
  },

  updateUserProfile(userId, { name, phone, avatar }) {
    const users = this.getAllUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
      const updatedUser = {
        ...users[index],
        name: name !== undefined ? name : users[index].name,
        phone: phone !== undefined ? phone : users[index].phone,
        avatar: avatar !== undefined ? avatar : users[index].avatar
      };
      users[index] = updatedUser;
      setStored(KEYS.USERS, users);
      
      const current = this.getCurrentUser();
      if (current && current.id === userId) {
        this.setCurrentUser(updatedUser);
      }

      const newName = updatedUser.name;
      const newAvatar = updatedUser.avatar;

      // 1. Sync name/phone in families if assigned head of family or matching house number
      const families = familyService.getFamilies();
      let famChanged = false;
      families.forEach(f => {
        if (f.assignedUserId === userId || (f.houseNumber && f.houseNumber === updatedUser.houseNo)) {
          if (newName) f.headOfFamily = newName;
          if (phone) f.phone = phone;
          famChanged = true;
        }
      });
      if (famChanged) setStored(KEYS.FAMILIES, families);

      // 2. Sync name in guest reports
      const reports = getStored(KEYS.GUEST_REPORTS, INITIAL_GUEST_REPORTS);
      let repChanged = false;
      reports.forEach(r => {
        if (r.reporterUserId === userId || (r.houseNumber && r.houseNumber === updatedUser.houseNo)) {
          if (newName) r.reporterName = newName;
          repChanged = true;
        }
      });
      if (repChanged) setStored(KEYS.GUEST_REPORTS, reports);

      // 3. Sync name/avatar in community chat messages
      const chats = getStored(KEYS.CHAT_MESSAGES, INITIAL_CHAT_MESSAGES);
      let chatChanged = false;
      chats.forEach(c => {
        if (c.senderId === userId) {
          if (newName) c.senderName = newName;
          if (newAvatar) c.senderAvatar = newAvatar;
          chatChanged = true;
        }
      });
      if (chatChanged) setStored(KEYS.CHAT_MESSAGES, chats);

      // 4. Sync recordedBy name in transactions if updated user is Admin/Bendahara
      const transactions = getStored(KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
      let trxChanged = false;
      transactions.forEach(t => {
        if (t.recordedBy && newName) {
          const oldName = users[index].name;
          if (t.recordedBy.includes(oldName)) {
            t.recordedBy = t.recordedBy.replace(oldName, newName);
            trxChanged = true;
          }
        }
      });
      if (trxChanged) setStored(KEYS.TRANSACTIONS, transactions);

      return updatedUser;
    }
    return null;
  },

  changePassword(userId, oldPassword, newPassword) {
    const users = this.getAllUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
      if (users[index].password !== oldPassword) {
        return { success: false, message: "Password lama Anda tidak sesuai." };
      }
      users[index].password = newPassword;
      setStored(KEYS.USERS, users);
      
      const current = this.getCurrentUser();
      if (current && current.id === userId) {
        this.setCurrentUser(users[index]);
      }
      return { success: true, user: users[index] };
    }
    return { success: false, message: "Pengguna tidak ditemukan." };
  },
  
  deleteUser(userId) {
    const users = this.getAllUsers();
    const target = users.find(u => u.id === userId);
    cascadeDeleteUser(userId, target?.name);
  },

  registerUser({ name, username, password, role, jabatan, accessDescription, icon, houseNo, kkNo, phone }) {
    initStorage();
    let users = getStored(KEYS.USERS, INITIAL_USERS);
    const families = familyService.getFamilies();
    const cleanName = (name || "").trim();
    const cleanUsername = (username || "").trim().toLowerCase();

    // Check duplicate name or username against stored real users
    const existingByName = users.find(u => (u.name || "").toLowerCase() === cleanName.toLowerCase());
    const existingByUsername = users.find(u => (u.username || "").toLowerCase() === cleanUsername);
    const existing = existingByName || existingByUsername;

    if (existing) {
      // Check if this existing user has an active family KK
      const hasActiveFamily = families.some(
        f => f.assignedUserId === existing.id || (f.headOfFamily && f.headOfFamily.toLowerCase() === cleanName.toLowerCase())
      );
      if (hasActiveFamily) {
        if (existingByName) {
          throw new Error(`Warga dengan nama '${cleanName}' sudah terdaftar (${existingByName.houseNo || "RT 028"}). Pendaftaran dibatalkan agar tidak duplikat.`);
        }
        if (existingByUsername && (existingByUsername.name || "").toLowerCase() !== cleanName.toLowerCase()) {
          throw new Error(`Username '${cleanUsername}' sudah digunakan oleh ${existingByUsername.name}. Gunakan username lain.`);
        }
      } else {
        // Old user account from a deleted KK, remove it so re-registration succeeds!
        users = users.filter(u => u.id !== existing.id);
      }
    }

    const newUser = {
      id: `user-${Date.now()}`,
      name: cleanName,
      username: cleanUsername,
      password: password || "123",
      role: role || "anggota",
      jabatan: jabatan || (role === "admin" ? "Pengurus RT" : role === "bendahara" ? "Bendahara Kas" : "Warga Gang"),
      accessDescription: accessDescription || (role === "admin" ? "Hak Kelola Web, Warga & Kas" : "Akses Lapor Tamu & Obrolan Warga"),
      icon: icon || "👤",
      houseNo: houseNo || "",
      kkNo: kkNo || "",
      phone: phone || "",
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`
    };
    users.push(newUser);
    setStored(KEYS.USERS, users);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event("users-data-changed"));
    }
    return newUser;
  }
};

// --- CHAT SERVICE ---
export const chatService = {
  getMessages() {
    const raw = getStored(KEYS.CHAT_MESSAGES, INITIAL_CHAT_MESSAGES);
    const users = authService.getAllUsers();
    return raw.map(msg => {
      const user = users.find(u => u.id === msg.senderId);
      if (user) {
        return {
          ...msg,
          senderName: user.name,
          senderRole: user.role,
          senderAvatar: user.avatar,
          senderHouse: user.houseNo || msg.senderHouse
        };
      }
      return msg;
    });
  },

  clearMessages() {
    setStored(KEYS.CHAT_MESSAGES, []);
    return [];
  },

  checkAndSendMonthlyPaymentReminder() {
    try {
      const now = new Date();
      const day = now.getDate();
      if (day < 10) return;

      const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const monthNames = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni", 
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
      ];
      const monthName = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;

      const raw = getStored(KEYS.CHAT_MESSAGES, []);
      const tag = `[REMINDER_IURAN_${monthKey}]`;

      const alreadySent = raw.some(m => typeof m.message === "string" && (m.message.includes(tag) || m.message.includes(`Periode: ${monthName}`)));

      if (!alreadySent) {
        const reminderText = `📢 PENGINGAT IURAN KAS RT 028 GANG CINTA\nPeriode: ${monthName}\n\n${tag}\nMengingatkan bapak/ibu warga Gang Cinta (RT 028 RW 005) yang belum menyelesaikan pembayaran iuran bulanan kas & iuran lainnya.\n\nMohon untuk dapat menyelesaikan pembayaran iuran sebesar Rp 110.000 kepada Bendahara Nogi (No. 02).\n\nTerima kasih banyak atas perhatian dan partisipasinya dalam menjaga lingkungan Gang Cinta kita bersama! 🙏😊`;

        const bendaharaUser = {
          id: "user-bendahara-1",
          name: "Nogi",
          role: "bendahara",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
          houseNo: "No. 02"
        };

        this.sendMessage({ user: bendaharaUser, message: reminderText });
      }
    } catch (err) {
      console.error("Error checking monthly payment reminder:", err);
    }
  },

  sendMessage({ user, message }) {
    const messages = this.getMessages();
    const newMsg = {
      id: `chat-${Date.now()}`,
      senderId: user.id,
      senderName: user.name,
      senderRole: user.role,
      senderAvatar: user.avatar,
      senderHouse: user.houseNo || "RT 028 RW 005",
      message: message.trim(),
      timestamp: new Date().toISOString()
    };
    messages.push(newMsg);
    setStored(KEYS.CHAT_MESSAGES, messages);
    return newMsg;
  },

  getOnlineUsers(currentUser) {
    const activeUser = currentUser || authService.getCurrentUser();
    const allUsers = authService.getAllUsers();
    const sessions = getStored(KEYS.ACTIVE_SESSIONS, {});
    const now = Date.now();
    const THREE_MINUTES = 3 * 60 * 1000; // 3 minutes timeout for active status

    if (activeUser) {
      const activeId = activeUser.id;
      const activeName = (activeUser.name || "").toLowerCase().trim();

      sessions[activeId] = now;

      // Update session timestamp for matching user entry by exact ID or exact Name
      allUsers.forEach(u => {
        const uName = (u.name || "").toLowerCase().trim();
        if (
          (activeId && u.id === activeId) ||
          (activeName && uName && uName === activeName)
        ) {
          sessions[u.id] = now;
        }
      });

      setStored(KEYS.ACTIVE_SESSIONS, sessions);
    }

    return allUsers.map(u => {
      const uName = (u.name || "").toLowerCase().trim();
      const activeName = activeUser ? (activeUser.name || "").toLowerCase().trim() : "";
      const activeId = activeUser ? activeUser.id : "";

      const isMatchingId = activeId && u.id === activeId;
      const isMatchingName = activeName && uName && uName === activeName;

      const isCurrentUser = !!(activeUser && (isMatchingId || isMatchingName));

      const lastSeen = sessions[u.id];
      const isRecentlyActive = lastSeen ? (now - lastSeen < THREE_MINUTES) : false;
      const isOnline = isCurrentUser || isRecentlyActive;

      let lastActiveText = "Offline";
      if (isCurrentUser) {
        lastActiveText = "Sedang Aktif";
      } else if (isOnline && lastSeen) {
        const diffSecs = Math.floor((now - lastSeen) / 1000);
        const diffMins = Math.floor(diffSecs / 60);
        lastActiveText = diffMins < 1 ? "Aktif Baru Saja" : `Aktif ${diffMins}m lalu`;
      } else if (lastSeen) {
        const diffMins = Math.floor((now - lastSeen) / 60000);
        if (diffMins < 60) {
          lastActiveText = `${diffMins}m yang lalu`;
        } else {
          const diffHours = Math.floor(diffMins / 60);
          lastActiveText = `${diffHours} jam yang lalu`;
        }
      }

      return {
        ...u,
        isOnline,
        lastActive: lastActiveText
      };
    });
  }
};

// --- KK / RESIDENTS SERVICE ---
export const familyService = {
  getFamilies() {
    return getStored(KEYS.FAMILIES, INITIAL_FAMILIES);
  },
  
  getFamilyById(id) {
    const families = this.getFamilies();
    return families.find(f => f.id === id) || null;
  },
  
  getFamilyByUserId(userId) {
    const families = this.getFamilies();
    return families.find(f => f.assignedUserId === userId) || null;
  },

  getTotalJiwa() {
    const families = this.getFamilies();
    return families.reduce((acc, f) => {
      if (Array.isArray(f.members) && f.members.length > 0) {
        return acc + f.members.length;
      }
      return acc + (f.headOfFamily ? 1 : 0);
    }, 0);
  },
  
  createFamily({ kkNumber, headOfFamily, block, houseNumber, address, houseStatus, phone, emergencyContact, assignedUserId, nik, gender, job, birthPlace, birthDate, bloodType }) {
    const families = this.getFamilies();
    const cleanBlock = (block || "").trim() || "Blok F4";
    const newFamily = {
      id: `kk-${Date.now()}`,
      kkNumber: kkNumber || "-",
      headOfFamily: (headOfFamily || "").trim(),
      block: cleanBlock,
      houseNumber: houseNumber || "",
      address: address || `Gang Cinta RT 028 RW 005, Perumahan Bumi Nagara Lestari, ${cleanBlock} ${houseNumber}`,
      houseStatus: houseStatus || "Milik Sendiri",
      phone: phone || "",
      emergencyContact: emergencyContact || "",
      assignedUserId: assignedUserId || null,
      isProfileCompleted: false,
      members: [
        {
          id: `mem-${Date.now()}`,
          fullName: (headOfFamily || "").trim(),
          nik: nik || "",
          relation: "Kepala Keluarga",
          gender: gender || "Laki-laki",
          birthPlace: birthPlace || "",
          birthDate: birthDate || "",
          job: job || "",
          religion: "Islam",
          bloodType: bloodType || "-"
        }
      ]
    };
    families.unshift(newFamily);
    setStored(KEYS.FAMILIES, families);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event("families-data-changed"));
      window.dispatchEvent(new Event("finance-data-changed"));
    }
    return newFamily;
  },
  
  updateFamily(familyId, updatedData) {
    const families = this.getFamilies();
    const index = families.findIndex(f => f.id === familyId);
    if (index !== -1) {
      const updatedFam = { ...families[index], ...updatedData, isProfileCompleted: true };
      families[index] = updatedFam;
      setStored(KEYS.FAMILIES, families);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event("families-data-changed"));
        window.dispatchEvent(new Event("finance-data-changed"));
      }

      const newHeadName = updatedFam.headOfFamily;
      const assignedUserId = updatedFam.assignedUserId;
      const houseNo = updatedFam.houseNumber;

      if (newHeadName) {
        // Sync Users
        const users = getStored(KEYS.USERS, INITIAL_USERS);
        let userChanged = false;
        users.forEach(u => {
          if ((assignedUserId && u.id === assignedUserId) || (houseNo && u.houseNo === houseNo)) {
            u.name = newHeadName;
            userChanged = true;
          }
        });
        if (userChanged) setStored(KEYS.USERS, users);

        // Sync Current User if logged in
        const current = authService.getCurrentUser();
        if (current && ((assignedUserId && current.id === assignedUserId) || (houseNo && current.houseNo === houseNo))) {
          current.name = newHeadName;
          authService.setCurrentUser(current);
        }

        // Sync Guest Reports
        const reports = getStored(KEYS.GUEST_REPORTS, INITIAL_GUEST_REPORTS);
        let repChanged = false;
        reports.forEach(r => {
          if ((assignedUserId && r.reporterUserId === assignedUserId) || (houseNo && r.houseNumber === houseNo)) {
            r.reporterName = newHeadName;
            repChanged = true;
          }
        });
        if (repChanged) setStored(KEYS.GUEST_REPORTS, reports);

        // Sync Chat Messages
        const chats = getStored(KEYS.CHAT_MESSAGES, INITIAL_CHAT_MESSAGES);
        let chatChanged = false;
        chats.forEach(c => {
          if ((assignedUserId && c.senderId === assignedUserId) || (houseNo && c.senderHouse === houseNo)) {
            c.senderName = newHeadName;
            chatChanged = true;
          }
        });
        if (chatChanged) setStored(KEYS.CHAT_MESSAGES, chats);
      }

      return updatedFam;
    }
    return null;
  },
  
  deleteFamily(familyId) {
    let families = this.getFamilies();
    const targetFam = families.find(f => f.id === familyId);
    families = families.filter(f => f.id !== familyId);
    setStored(KEYS.FAMILIES, families);

    if (targetFam) {
      // 1. Cascade delete ALL members in this family
      (targetFam.members || []).forEach(m => {
        if (m && m.fullName) {
          cascadeDeleteUser(m.assignedUserId || m.id, m.fullName);
          addDeletedEntity({ id: m.id, name: m.fullName });
        }
      });

      // 2. Cascade delete head and assigned users
      cascadeDeleteUser(targetFam.assignedUserId, targetFam.headOfFamily);
      cascadeDeleteUser(`derived-${familyId}`, targetFam.headOfFamily);
      addDeletedEntity({ id: familyId, name: targetFam.headOfFamily, kkNumber: targetFam.kkNumber });

      // 3. Cascade delete associated financial transactions
      let transactions = getStored(KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
      const cleanHead = (targetFam.headOfFamily || "").toLowerCase().trim();
      const memberNames = (targetFam.members || []).map(m => (m?.fullName || "").toLowerCase().trim());
      const origTrxLen = transactions.length;
      transactions = transactions.filter(t => {
        if (t.familyId && t.familyId === familyId) return false;
        const tTitle = (t.title || "").toLowerCase();
        if (cleanHead && tTitle.includes(cleanHeadName(cleanHead))) return false;
        if (memberNames.some(mn => mn && tTitle.includes(cleanHeadName(mn)))) return false;
        return true;
      });
      if (transactions.length !== origTrxLen) {
        setStored(KEYS.TRANSACTIONS, transactions);
      }

      // 4. Cascade delete associated dues payments (IURAN_PAYMENTS)
      const allPayments = getStored(KEYS.IURAN_PAYMENTS, {});
      let paymentsChanged = false;
      Object.keys(allPayments).forEach(mKey => {
        const monthList = allPayments[mKey] || [];
        const filtered = monthList.filter(item => {
          if (typeof item === 'object') {
            if (item.familyId === familyId) return false;
            const itemName = (item.name || "").toLowerCase();
            if (cleanHead && itemName.includes(cleanHeadName(cleanHead))) return false;
            if (memberNames.some(mn => mn && itemName.includes(cleanHeadName(mn)))) return false;
            return true;
          }
          return item !== familyId;
        });
        if (filtered.length !== monthList.length) {
          allPayments[mKey] = filtered;
          paymentsChanged = true;
        }
      });
      if (paymentsChanged) {
        setStored(KEYS.IURAN_PAYMENTS, allPayments);
      }
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event("families-data-changed"));
      window.dispatchEvent(new Event("users-data-changed"));
      window.dispatchEvent(new Event("finance-data-changed"));
    }
  },

  deleteMember(familyId, memberId, memberFullName) {
    let families = this.getFamilies();
    const targetFamIndex = families.findIndex(f => f.id === familyId);
    if (targetFamIndex === -1) return false;

    const targetFam = families[targetFamIndex];
    const targetMember = (targetFam.members || []).find(m => m.id === memberId || (memberFullName && m.fullName?.toLowerCase().trim() === memberFullName.toLowerCase().trim()));
    const memberName = targetMember?.fullName || memberFullName || "";
    const cleanName = memberName.toLowerCase().trim();

    // 1. Remove member from family's members array
    const remainingMembers = (targetFam.members || []).filter(m => {
      if (memberId && m.id === memberId) return false;
      if (cleanName && m.fullName?.toLowerCase().trim() === cleanName) return false;
      return true;
    });

    targetFam.members = remainingMembers;

    // 2. If the deleted member was headOfFamily, reassign to next member if one exists
    if (cleanName && targetFam.headOfFamily?.toLowerCase().trim() === cleanName) {
      if (remainingMembers.length > 0) {
        targetFam.headOfFamily = remainingMembers[0].fullName;
      }
    }

    families[targetFamIndex] = { ...targetFam };
    setStored(KEYS.FAMILIES, families);

    // 3. Cascade wipe user account, session, chats, reports, transactions
    if (memberName) {
      cascadeDeleteUser(targetMember?.assignedUserId || memberId, memberName);
      addDeletedEntity({ id: memberId, name: memberName });
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event("families-data-changed"));
      window.dispatchEvent(new Event("users-data-changed"));
      window.dispatchEvent(new Event("finance-data-changed"));
    }
    return targetFam;
  }
};

// --- FINANCE SERVICE ---
export const financeService = {
  getCategories() {
    return FINANCIAL_CATEGORIES;
  },
  
  getTransactions() {
    return getStored(KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
  },
  
  getMonthlyBalances() {
    return getStored(KEYS.MONTHLY_BALANCES, INITIAL_MONTHLY_BALANCES);
  },
  
  setCategoryStartingBalances(monthKey, categoryBalancesObj) {
    const balances = this.getMonthlyBalances();
    const d = new Date(`${monthKey}-01`);
    const monthName = d.toLocaleString('id-ID', { month: 'long', year: 'numeric' });
    
    balances[monthKey] = {
      monthName,
      categories: {
        sampah: 0, // Always 0: trash collection is disbursed directly every month
        keamanan: 0, // Always 0: security collection is disbursed directly every month
        kas: Number(categoryBalancesObj.kas || 0),
        sosial: Number(categoryBalancesObj.sosial || 0),
        olahraga: Number(categoryBalancesObj.olahraga || 0)
      }
    };
    setStored(KEYS.MONTHLY_BALANCES, balances);
    if (typeof window !== 'undefined') window.dispatchEvent(new Event("finance-data-changed"));
    return balances[monthKey];
  },
  
  getMonthlySummary(monthKey, isRecursive = false) {
    const balances = this.getMonthlyBalances();
    const hasExplicitBalance = !!balances[monthKey]?.categories;
    const monthBalanceData = balances[monthKey]?.categories || {};

    // Calculate previous month key for automatic rollover (Ending Month M -> Starting Month M+1)
    let prevEndingBalances = { kas: 0, sosial: 0, olahraga: 0 };
    if (!hasExplicitBalance && !isRecursive) {
      try {
        const [yStr, mStr] = monthKey.split("-");
        let y = parseInt(yStr, 10);
        let m = parseInt(mStr, 10) - 1;
        if (m < 1) { m = 12; y -= 1; }
        const prevMonthKey = `${y}-${String(m).padStart(2, '0')}`;
        
        // Fetch previous month summary recursively (stopping at depth 1)
        const prevSummary = this.getMonthlySummary(prevMonthKey, true);
        if (prevSummary && prevSummary.categoryBreakdown) {
          prevEndingBalances = {
            kas: prevSummary.categoryBreakdown.kas?.ending || 0,
            sosial: prevSummary.categoryBreakdown.sosial?.ending || 0,
            olahraga: prevSummary.categoryBreakdown.olahraga?.ending || 0
          };
        }
      } catch (err) {
        console.error("Error computing prev month rollover:", err);
      }
    }

    const allTransactions = this.getTransactions();
    const monthTransactions = allTransactions.filter(t => t.date.startsWith(monthKey));
    
    // Per-category calculation: Sampah & Keamanan starting balance is strictly 0
    const categoryBreakdown = {
      sampah: { starting: 0, income: 0, expense: 0, ending: 0, items: [] },
      keamanan: { starting: 0, income: 0, expense: 0, ending: 0, items: [] },
      kas: { 
        starting: monthBalanceData.kas !== undefined ? monthBalanceData.kas : prevEndingBalances.kas, 
        income: 0, expense: 0, ending: 0, items: [] 
      },
      sosial: { 
        starting: monthBalanceData.sosial !== undefined ? monthBalanceData.sosial : prevEndingBalances.sosial, 
        income: 0, expense: 0, ending: 0, items: [] 
      },
      olahraga: { 
        starting: monthBalanceData.olahraga !== undefined ? monthBalanceData.olahraga : prevEndingBalances.olahraga, 
        income: 0, expense: 0, ending: 0, items: [] 
      }
    };

    let totalStartingBalance = 0;
    let totalIncome = 0;
    let totalExpense = 0;

    Object.keys(categoryBreakdown).forEach(k => {
      totalStartingBalance += categoryBreakdown[k].starting;
    });

    const expenseList = [];
    const incomeList = [];

    monthTransactions.forEach(t => {
      const amt = Number(t.amount);
      const cat = t.category;
      if (t.type === "income") {
        totalIncome += amt;
        incomeList.push(t);
        if (categoryBreakdown[cat]) {
          categoryBreakdown[cat].income += amt;
        }
      } else {
        totalExpense += amt;
        expenseList.push(t);
        if (categoryBreakdown[cat]) {
          categoryBreakdown[cat].expense += amt;
          categoryBreakdown[cat].items.push(t);
        }
      }
    });

    // Compute ending balance for each category
    Object.keys(categoryBreakdown).forEach(k => {
      const c = categoryBreakdown[k];
      c.ending = c.starting + c.income - c.expense;
    });

    const totalEndingBalance = totalStartingBalance + totalIncome - totalExpense;

    return {
      monthKey,
      startingBalance: totalStartingBalance,
      totalIncome,
      totalExpense,
      endingBalance: totalEndingBalance,
      categoryBreakdown,
      expenseList,
      incomeList,
      transactions: monthTransactions
    };
  },
  
  addTransaction(trx) {
    const transactions = this.getTransactions();
    const newTrx = {
      id: `trx-${Date.now()}`,
      date: trx.date,
      category: trx.category,
      type: trx.type,
      amount: Number(trx.amount),
      title: trx.title,
      description: trx.description,
      receiptUrl: trx.receiptUrl || "",
      recordedBy: trx.recordedBy || "Bendahara Kas"
    };
    transactions.unshift(newTrx);
    setStored(KEYS.TRANSACTIONS, transactions);
    if (typeof window !== 'undefined') window.dispatchEvent(new Event("finance-data-changed"));
    return newTrx;
  },

  updateTransaction(id, updatedData) {
    const transactions = this.getTransactions();
    const index = transactions.findIndex(t => t.id === id);
    if (index !== -1) {
      transactions[index] = {
        ...transactions[index],
        ...updatedData,
        amount: Number(updatedData.amount)
      };
      setStored(KEYS.TRANSACTIONS, transactions);
      if (typeof window !== 'undefined') window.dispatchEvent(new Event("finance-data-changed"));
      return transactions[index];
    }
    return null;
  },
  
  deleteTransaction(id) {
    let transactions = this.getTransactions();
    transactions = transactions.filter(t => t.id !== id);
    setStored(KEYS.TRANSACTIONS, transactions);
    if (typeof window !== 'undefined') window.dispatchEvent(new Event("finance-data-changed"));
  },

  clearCategoryData(monthKey, categoryId) {
    // 1. Filter out transactions for this category in monthKey
    let transactions = this.getTransactions();
    transactions = transactions.filter(t => !(t.date.startsWith(monthKey) && t.category === categoryId));
    setStored(KEYS.TRANSACTIONS, transactions);

    // 2. Reset starting balance for this category in monthKey to 0
    const balances = this.getMonthlyBalances();
    if (balances[monthKey]?.categories) {
      balances[monthKey].categories[categoryId] = 0;
      setStored(KEYS.MONTHLY_BALANCES, balances);
    }
    if (typeof window !== 'undefined') window.dispatchEvent(new Event("finance-data-changed"));
  }
};

// --- MOMENTS / GALLERY SERVICE ---
export const momentService = {
  getMoments() {
    return getStored(KEYS.MOMENTS, INITIAL_MOMENTS);
  },
  
  addMoment({ title, category, eventDate, description, imageUrl, location, uploadedBy }) {
    const moments = this.getMoments();
    const newMoment = {
      id: `moment-${Date.now()}`,
      title,
      category: category || "Umum",
      eventDate: eventDate || new Date().toISOString().split("T")[0],
      description,
      imageUrl,
      location: location || "Gang Cinta RT 028 RW 005, Perumahan Bumi Nagara Lestari",
      uploadedBy: uploadedBy || "Admin Pengurus",
      createdAt: new Date().toISOString(),
      likes: 0
    };
    moments.unshift(newMoment);
    setStored(KEYS.MOMENTS, moments);
    return newMoment;
  },
  
  deleteMoment(id) {
    let moments = this.getMoments();
    moments = moments.filter(m => m.id !== id);
    setStored(KEYS.MOMENTS, moments);
  },
  
  toggleLike(id) {
    const moments = this.getMoments();
    const moment = moments.find(m => m.id === id);
    if (moment) {
      moment.likes = (moment.likes || 0) + 1;
      setStored(KEYS.MOMENTS, moments);
      return moment.likes;
    }
    return 0;
  }
};

// --- GUEST REPORT SERVICE ---
export const guestReportService = {
  getGuestReports(currentUser) {
    const reports = getStored(KEYS.GUEST_REPORTS, INITIAL_GUEST_REPORTS);
    if (!currentUser) return [];
    if (currentUser.role === "admin") {
      return reports;
    }
    // Strictly confidential: Only return the user's own reports!
    return reports.filter(r => r.reporterUserId === currentUser.id);
  },
  
  addGuestReport(reportData, currentUser) {
    const reports = getStored(KEYS.GUEST_REPORTS, INITIAL_GUEST_REPORTS);
    const newReport = {
      id: `guest-${Date.now()}`,
      reporterUserId: currentUser.id,
      reporterName: currentUser.name,
      houseNumber: currentUser.houseNo || reportData.houseNumber,
      guestName: reportData.guestName,
      guestNik: reportData.guestNik,
      guestKkNumber: reportData.guestKkNumber,
      guestAddress: reportData.guestAddress,
      relationship: reportData.relationship,
      startDate: reportData.startDate,
      durationDays: Number(reportData.durationDays) || 1,
      endDate: reportData.endDate,
      contactPhone: reportData.contactPhone,
      reason: reportData.reason,
      status: "pending",
      notesFromAdmin: "",
      reportedAt: new Date().toISOString()
    };
    reports.unshift(newReport);
    setStored(KEYS.GUEST_REPORTS, reports);
    return newReport;
  },
  
  updateReportStatus(reportId, status, notesFromAdmin, extraData = {}) {
    const reports = getStored(KEYS.GUEST_REPORTS, INITIAL_GUEST_REPORTS);
    const report = reports.find(r => r.id === reportId);
    if (report) {
      report.status = status;
      if (notesFromAdmin !== undefined) {
        report.notesFromAdmin = notesFromAdmin;
      }
      if (extraData.decisionBy) report.decisionBy = extraData.decisionBy;
      if (extraData.decisionDate) report.decisionDate = extraData.decisionDate;
      setStored(KEYS.GUEST_REPORTS, reports);
      return report;
    }
    return null;
  },
  
  deleteReport(reportId) {
    let reports = getStored(KEYS.GUEST_REPORTS, INITIAL_GUEST_REPORTS);
    reports = reports.filter(r => r.id !== reportId);
    setStored(KEYS.GUEST_REPORTS, reports);
  }
};

// --- DEFAULT DUES COMPONENTS & CONFIG SERVICE ---
export const DEFAULT_DUES_COMPONENTS = [
  { id: "sampah", name: "Iuran Sampah (Kebersihan)", amount: 30000, enabled: true, category: "sampah", isDefault: true },
  { id: "keamanan", name: "Iuran Keamanan", amount: 35000, enabled: true, category: "keamanan", isDefault: true },
  { id: "kas", name: "Kas Gang / RT", amount: 15000, enabled: true, category: "kas", isDefault: true },
  { id: "makam", name: "Iuran Makam", amount: 10000, enabled: true, category: "sosial", isDefault: true },
  { id: "keagamaan", name: "Keagamaan (Masjid / Mushola)", amount: 10000, enabled: true, category: "sosial", isDefault: true },
  { id: "agustusan", name: "Iuran Agustusan ke RT", amount: 10000, enabled: true, category: "kas", isDefault: true }
];

export const duesConfigService = {
  getRawConfigs() {
    return getStored(KEYS.DUES_CONFIG, {});
  },

  getAllComponents(monthKey = "2026-09") {
    const raw = this.getRawConfigs();
    if (raw[monthKey] && Array.isArray(raw[monthKey])) {
      return raw[monthKey];
    }
    if (raw["default"] && Array.isArray(raw["default"])) {
      return raw["default"];
    }
    return DEFAULT_DUES_COMPONENTS;
  },

  getMonthlyConfig(monthKey = "2026-09") {
    const allComponents = this.getAllComponents(monthKey);
    const activeComponents = allComponents.filter(c => c.enabled);
    const totalAmount = activeComponents.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
    return {
      monthKey,
      components: activeComponents,
      allComponents,
      totalAmount
    };
  },

  saveMonthlyConfig(monthKey = "2026-09", componentsArray) {
    const raw = this.getRawConfigs();
    raw[monthKey] = componentsArray;
    setStored(KEYS.DUES_CONFIG, raw);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("dues-config-changed"));
      window.dispatchEvent(new Event("finance-data-changed"));
    }
    return componentsArray;
  },

  resetMonthlyConfig(monthKey = "2026-09") {
    const raw = this.getRawConfigs();
    delete raw[monthKey];
    setStored(KEYS.DUES_CONFIG, raw);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("dues-config-changed"));
      window.dispatchEvent(new Event("finance-data-changed"));
    }
    return DEFAULT_DUES_COMPONENTS;
  }
};

// --- INITIAL IURAN PAYMENTS ---
export const INITIAL_IURAN_PAYMENTS = {};

// --- IURAN STATUS & REMINDER SERVICE ---
export const iuranService = {
  getPayments(monthKey = "2026-09") {
    const families = familyService.getFamilies();
    const allTrx = financeService.getTransactions();
    const monthTrx = allTrx.filter(t => t.date && t.date.startsWith(monthKey) && t.type === "income");

    const manualPayments = getStored(KEYS.IURAN_PAYMENTS, {})[monthKey] || [];
    const monthlyConfig = duesConfigService.getMonthlyConfig(monthKey);
    const defaultTargetAmount = monthlyConfig.totalAmount;

    return families.map(f => {
      // Dynamically match income transaction in calendar/transactions for this resident
      const matchingTrx = monthTrx.find(t => {
        if (t.familyId && t.familyId === f.id) return true;
        const searchStr = `${t.title || ""} ${t.description || ""}`.toLowerCase();
        const headClean = (f.headOfFamily || "")
          .replace(/^(bpk\.|ibu\.|hj\.|h\.)\s*/i, "")
          .toLowerCase()
          .trim();
        const houseClean = (f.houseNumber || "").toLowerCase().trim();
        const houseNoDigits = houseClean.replace(/[^0-9]/g, "");

        const matchName = headClean && headClean.length > 2 && searchStr.includes(headClean);
        const matchHouse = houseClean && (
          searchStr.includes(houseClean) || 
          (houseNoDigits && (searchStr.includes(`no. ${houseNoDigits}`) || searchStr.includes(`no.${houseNoDigits}`) || searchStr.includes(` no ${houseNoDigits}`)))
        );
        return matchName || matchHouse;
      });

      const manualP = manualPayments.find(item => item.familyId === f.id);

      // Status is LUNAS IF AND ONLY IF there is an actual matching income transaction in Kalender Kas
      const isPaid = !!matchingTrx;

      return {
        familyId: f.id,
        headOfFamily: f.headOfFamily,
        houseNumber: f.houseNumber,
        phone: f.phone,
        status: isPaid ? "paid" : "unpaid",
        amount: matchingTrx ? Number(matchingTrx.amount) : (manualP && isPaid ? manualP.amount : defaultTargetAmount),
        paidAt: matchingTrx ? matchingTrx.date : (manualP && isPaid ? manualP.paidAt : null),
        note: matchingTrx ? (matchingTrx.description || matchingTrx.title) : (manualP && isPaid ? manualP.note : "")
      };
    });
  },

  markAsPaid(monthKey, familyId, note = "Tunai Ke Bendahara", amount = null, dateStr = null) {
    const targetAmount = amount !== null && amount !== undefined 
      ? Number(amount) 
      : duesConfigService.getMonthlyConfig(monthKey).totalAmount;

    const all = getStored(KEYS.IURAN_PAYMENTS, INITIAL_IURAN_PAYMENTS);
    if (!all[monthKey]) {
      this.getPayments(monthKey);
    }
    const list = all[monthKey] || [];
    const targetDate = dateStr || new Date().toISOString().split("T")[0];

    const index = list.findIndex(p => p.familyId === familyId);
    if (index !== -1) {
      list[index] = {
        ...list[index],
        status: "paid",
        amount: targetAmount,
        paidAt: targetDate,
        note
      };
    } else {
      list.push({
        familyId,
        status: "paid",
        amount: targetAmount,
        paidAt: targetDate,
        note
      });
    }
    all[monthKey] = list;
    setStored(KEYS.IURAN_PAYMENTS, all);

    // Sync/Create corresponding Income transaction in financeService if not existing
    const families = familyService.getFamilies();
    const fam = families.find(f => f.id === familyId);
    if (fam) {
      const allTrx = getStored(KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
      const existing = allTrx.find(t => 
        t.date && t.date.startsWith(monthKey) && 
        t.type === "income" && 
        (t.familyId === familyId || (t.title && t.title.toLowerCase().includes(fam.headOfFamily.toLowerCase())))
      );
      if (!existing) {
        financeService.addTransaction({
          date: targetDate.startsWith(monthKey) ? targetDate : `${monthKey}-05`,
          category: "kas",
          type: "income",
          amount: Number(targetAmount),
          title: `Penerimaan Iuran Bulanan - ${fam.headOfFamily} (${fam.houseNumber})`,
          description: `Setoran iuran warga (${note})`,
          familyId: familyId,
          recordedBy: "Bendahara Kas"
        });
      }
    }

    return list;
  },

  markAsUnpaid(monthKey, familyId) {
    const all = getStored(KEYS.IURAN_PAYMENTS, INITIAL_IURAN_PAYMENTS);
    const list = all[monthKey] || [];
    const index = list.findIndex(p => p.familyId === familyId);
    if (index !== -1) {
      list[index] = {
        ...list[index],
        status: "unpaid",
        paidAt: null,
        note: ""
      };
    }
    all[monthKey] = list;
    setStored(KEYS.IURAN_PAYMENTS, all);

    // Remove corresponding dues income transaction if exists
    const families = familyService.getFamilies();
    const fam = families.find(f => f.id === familyId);
    if (fam) {
      let allTrx = getStored(KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
      allTrx = allTrx.filter(t => !(
        t.date && t.date.startsWith(monthKey) && 
        t.type === "income" && 
        (t.familyId === familyId || (t.title && t.title.toLowerCase().includes(fam.headOfFamily.toLowerCase())))
      ));
      setStored(KEYS.TRANSACTIONS, allTrx);
    }

    return list;
  },

  getWAReminderMessage(headOfFamily, houseNumber, monthKey = "2026-09", amount = null) {
    const config = duesConfigService.getMonthlyConfig(monthKey);
    const totalDuesAmount = (amount !== null && amount !== undefined) ? amount : config.totalAmount;

    let mName = monthKey;
    try {
      const [y, m] = monthKey.split("-");
      const d = new Date(parseInt(y, 10), parseInt(m, 10) - 1, 1);
      mName = d.toLocaleString('id-ID', { month: 'long', year: 'numeric' });
    } catch {
      mName = monthKey;
    }

    const formattedAmount = Number(totalDuesAmount).toLocaleString("id-ID");

    const users = getStored(KEYS.USERS, INITIAL_USERS);
    const bendaharaUser = users.find(u => u.role === "bendahara");
    const bName = bendaharaUser?.name || "Bendahara Gang Cinta";
    const bHouse = bendaharaUser?.houseNo ? ` (${bendaharaUser.houseNo})` : "";

    let posBreakdownText = "";
    if (config.components && config.components.length > 0) {
      posBreakdownText = config.components
        .map(c => `• ${c.name}: Rp ${Number(c.amount).toLocaleString("id-ID")}`)
        .join("\n");
    }

    return `Assalamu'alaikum wr. wb.

Kepada Yth. Bapak/Ibu ${headOfFamily} (${houseNumber}, Gang Cinta RT 028 RW 005),

Mengingatkan dengan hormat mengenai Iuran Bulanan Warga untuk bulan *${mName}* sebesar *Rp ${formattedAmount}*.

*Rincian Pos Iuran:*
${posBreakdownText}

Pembayaran dapat dilakukan melalui Bendahara ${bName}${bHouse} secara tunai atau via Transfer Bank.

Terima kasih banyak atas perhatian dan kesadaran Bapak/Ibu dalam menjaga kebersihan, keamanan & kerukunan lingkungan Gang Cinta kita bersama. 🙏😊

Wassalamu'alaikum wr. wb.
*Pengurus RT 028 RW 005 Gang Cinta*`;
  },

  sendWAReminder(headOfFamily, houseNumber, phone, monthKey = "2026-09", amount = null) {
    const text = this.getWAReminderMessage(headOfFamily, houseNumber, monthKey, amount);
    let cleanPhone = (phone || "").replace(/[^0-9]/g, "");
    if (cleanPhone.startsWith("0")) {
      cleanPhone = "62" + cleanPhone.slice(1);
    }
    if (!cleanPhone) {
      return { success: false, text, message: "Nomor WhatsApp belum terdaftar." };
    }
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
    return { success: true, text, url };
  }
};

// --- SECTION COLOR SERVICE ---
export const sectionColorService = {
  getColors() {
    return getStored("gang_cinta_section_colors_v1", {});
  },
  getBoxColor(boxId, defaultColor = "white") {
    const colors = this.getColors();
    return colors[boxId] || defaultColor;
  },
  setBoxColor(boxId, colorId) {
    const colors = this.getColors();
    colors[boxId] = colorId;
    setStored("gang_cinta_section_colors_v1", colors);
    return colors;
  }
};

// --- DIGITAL SIGNATURE SERVICE ---
export const signatureService = {
  getSignatures() {
    return getStored(KEYS.SIGNATURES, {
      adminSignature: null,
      bendaharaSignature: null
    });
  },
  saveSignature(role, dataUrl) {
    const sigs = this.getSignatures();
    if (role === "admin") {
      sigs.adminSignature = dataUrl;
    } else if (role === "bendahara") {
      sigs.bendaharaSignature = dataUrl;
    }
    setStored(KEYS.SIGNATURES, sigs);
    return sigs;
  },
  deleteSignature(role) {
    const sigs = this.getSignatures();
    if (role === "admin") {
      sigs.adminSignature = null;
    } else if (role === "bendahara") {
      sigs.bendaharaSignature = null;
    }
    setStored(KEYS.SIGNATURES, sigs);
    return sigs;
  }
};

// --- REPORT APPROVAL SERVICE ---
export const approvalService = {
  getApprovals() {
    return getStored(KEYS.REPORT_APPROVALS, {
      "2026-09": {
        adminApproved: true,
        adminApprovedAt: "20 September 2026",
        bendaharaApproved: true,
        bendaharaApprovedAt: "20 September 2026"
      }
    });
  },
  getMonthApproval(monthKey = "2026-09") {
    const approvals = this.getApprovals();
    return approvals[monthKey] || {
      adminApproved: false,
      adminApprovedAt: null,
      bendaharaApproved: false,
      bendaharaApprovedAt: null
    };
  },
  toggleApproval(monthKey, role, userName) {
    const approvals = this.getApprovals();
    const current = approvals[monthKey] || {
      adminApproved: false,
      adminApprovedAt: null,
      bendaharaApproved: false,
      bendaharaApprovedAt: null
    };

    const dateStr = new Date().toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' });

    if (role === "admin") {
      current.adminApproved = !current.adminApproved;
      current.adminApprovedAt = current.adminApproved ? dateStr : null;
      current.adminName = userName || current.adminName;
    } else if (role === "bendahara") {
      current.bendaharaApproved = !current.bendaharaApproved;
      current.bendaharaApprovedAt = current.bendaharaApproved ? dateStr : null;
      current.bendaharaName = userName || current.bendaharaName;
    }

    approvals[monthKey] = current;
    setStored(KEYS.REPORT_APPROVALS, approvals);
    return current;
  }
};

// --- WELCOME MESSAGE SERVICE ---
export const welcomeService = {
  getAdminWelcomeConfig() {
    initStorage();
    const raw = getStored(KEYS.ADMIN_WELCOME_TEXT, null);
    const defaultConfig = {
      text: "Sebagai Ketua Gang Cinta (Perumahan Bumi Nagara Lestari RT 028 RW 005), Anda berwenang mengelola dokumentasi momen kegiatan, registrasi KK & nomor rumah, persetujuan ijin tamu menginap, serta tema website.",
      isBold: false,
      isItalic: false,
      isUnderline: false,
      fontSize: "normal",
      fontFamily: "sans"
    };

    if (!raw) return defaultConfig;

    if (typeof raw === "object" && raw.text !== undefined) {
      return { ...defaultConfig, ...raw };
    }

    if (typeof raw === "string") {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object" && parsed.text !== undefined) {
          return { ...defaultConfig, ...parsed };
        }
      } catch {
        // Plain string fallback
      }
      return { ...defaultConfig, text: raw };
    }

    return defaultConfig;
  },

  setAdminWelcomeConfig(config) {
    setStored(KEYS.ADMIN_WELCOME_TEXT, config);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event("admin-welcome-changed"));
    }
    return config;
  },

  getAdminWelcomeText() {
    return this.getAdminWelcomeConfig().text;
  },

  setAdminWelcomeText(text) {
    const curr = this.getAdminWelcomeConfig();
    return this.setAdminWelcomeConfig({ ...curr, text });
  },

  getGalleryHeaderConfig() {
    initStorage();
    const raw = getStored(KEYS.GALLERY_HEADER_CONFIG, null);
    const defaultConfig = {
      title: "Momen & Cerita Gang Cinta",
      description: "Kumpulan dokumentasi foto setiap kegiatan, peringatan hari besar, gotong royong, dan kebersamaan warga Gang Cinta, Perumahan Bumi Nagara Lestari (RT 028 RW 005).",
      isBold: false,
      isItalic: false,
      isUnderline: false,
      fontSize: "normal",
      fontFamily: "sans"
    };

    if (!raw) return defaultConfig;

    if (typeof raw === "object" && (raw.title !== undefined || raw.description !== undefined)) {
      return { ...defaultConfig, ...raw };
    }

    if (typeof raw === "string") {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          return { ...defaultConfig, ...parsed };
        }
      } catch {
        // fallback
      }
    }

    return defaultConfig;
  },

  setGalleryHeaderConfig(config) {
    setStored(KEYS.GALLERY_HEADER_CONFIG, config);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event("gallery-header-changed"));
    }
    return config;
  },

  getGuestReportHeaderConfig() {
    initStorage();
    const raw = getStored(KEYS.GUEST_REPORT_HEADER_CONFIG, null);
    const defaultConfig = {
      title: "Pelaporan Tamu & Keluarga Menginap",
      description: "Aturan wajib lapor 1x24 jam. Ijin / persetujuan tamu menginap hanya dapat diberikan oleh Ketua Gang Cinta demi kenyamanan & keamanan warga Perumahan Bumi Nagara Lestari."
    };

    if (!raw) return defaultConfig;

    if (typeof raw === "object" && (raw.title !== undefined || raw.description !== undefined)) {
      return { ...defaultConfig, ...raw };
    }

    if (typeof raw === "string") {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          return { ...defaultConfig, ...parsed };
        }
      } catch {
        // fallback
      }
    }

    return defaultConfig;
  },

  setGuestReportHeaderConfig(config) {
    setStored(KEYS.GUEST_REPORT_HEADER_CONFIG, config);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event("guest-report-header-changed"));
    }
    return config;
  }
};
