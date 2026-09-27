import { 
  themeService, 
  authService, 
  familyService, 
  financeService, 
  momentService, 
  guestReportService, 
  chatService 
} from "./storageService";

// API Service connecting frontend with Express backend & automatic fallback to local database
const BASE_URL = "/api";

async function request(endpoint, options = {}) {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers
      },
      ...options
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(err.message || `HTTP Error ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    // Return null to trigger graceful fallback
    return null;
  }
}

export const api = {
  // Theme
  async getTheme() {
    const res = await request("/theme");
    if (res && res.theme) return res.theme;
    return themeService.getTheme();
  },
  async setTheme(theme) {
    const res = await request("/theme", {
      method: "POST",
      body: JSON.stringify({ theme })
    });
    if (res && res.theme) return res.theme;
    return themeService.setTheme(theme);
  },

  // Auth & Profile
  async login(username, password) {
    const res = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password })
    });
    if (res && res.success) return res;
    return authService.login(username, password);
  },
  async getUsers() {
    const res = await request("/users");
    if (Array.isArray(res)) return res;
    return authService.getAllUsers();
  },
  async updateProfile(userId, { name, phone, avatar }) {
    const res = await request("/profile", {
      method: "PUT",
      body: JSON.stringify({ userId, name, phone, avatar })
    });
    if (res && res.user) return res.user;
    return authService.updateUserProfile(userId, { name, phone, avatar });
  },
  async changePassword(userId, oldPassword, newPassword) {
    const res = await request("/profile/password", {
      method: "PUT",
      body: JSON.stringify({ userId, oldPassword, newPassword })
    });
    if (res) return res;
    return authService.changePassword(userId, oldPassword, newPassword);
  },
  async registerUser(userData) {
    const res = await request("/users", {
      method: "POST",
      body: JSON.stringify(userData)
    });
    if (res && res.user) return res.user;
    return authService.registerUser(userData);
  },

  // Families
  async getFamilies() {
    const res = await request("/families");
    if (Array.isArray(res)) return res;
    return familyService.getFamilies();
  },
  async createFamily(data) {
    const res = await request("/families", {
      method: "POST",
      body: JSON.stringify(data)
    });
    if (res && res.family) return res.family;
    return familyService.createFamily(data);
  },
  async updateFamily(id, data) {
    const res = await request(`/families/${id}`, {
      method: "PUT",
      body: JSON.stringify(data)
    });
    if (res && res.family) return res.family;
    return familyService.updateFamily(id, data);
  },
  async deleteFamily(id) {
    const res = await request(`/families/${id}`, { method: "DELETE" });
    if (res && res.success) return res;
    return familyService.deleteFamily(id);
  },
  async deleteMember(familyId, memberId, memberName) {
    const res = await request(`/families/${familyId}/members/${memberId}`, { method: "DELETE" });
    if (res && res.success) return res;
    return familyService.deleteMember(familyId, memberId, memberName);
  },
  async deleteUser(userId) {
    const res = await request(`/users/${userId}`, { method: "DELETE" });
    if (res && res.success) return res;
    return authService.deleteUser(userId);
  },

  // Finance
  async getMonthlySummary(monthKey) {
    return financeService.getMonthlySummary(monthKey);
  },
  async getTransactions() {
    const res = await request("/finance/transactions");
    if (Array.isArray(res)) return res;
    return financeService.getTransactions();
  },
  async addTransaction(trx) {
    const res = await request("/finance/transactions", {
      method: "POST",
      body: JSON.stringify(trx)
    });
    if (res && res.transaction) return res.transaction;
    return financeService.addTransaction(trx);
  },
  async deleteTransaction(id) {
    const res = await request(`/finance/transactions/${id}`, { method: "DELETE" });
    if (res && res.success) return res;
    return financeService.deleteTransaction(id);
  },
  async setStartingBalances(monthKey, categories) {
    const res = await request("/finance/starting-balances", {
      method: "POST",
      body: JSON.stringify({ monthKey, categories })
    });
    if (res && res.data) return res.data;
    return financeService.setStartingBalances(monthKey, categories);
  },

  // Moments
  async getMoments() {
    const res = await request("/moments");
    if (Array.isArray(res)) return res;
    return momentService.getMoments();
  },
  async addMoment(momentData) {
    const res = await request("/moments", {
      method: "POST",
      body: JSON.stringify(momentData)
    });
    if (res && res.moment) return res.moment;
    return momentService.addMoment(momentData);
  },
  async deleteMoment(id) {
    const res = await request(`/moments/${id}`, { method: "DELETE" });
    if (res && res.success) return res;
    return momentService.deleteMoment(id);
  },
  async likeMoment(id) {
    const res = await request(`/moments/${id}/like`, { method: "POST" });
    if (res && res.likes !== undefined) return res.likes;
    return momentService.likeMoment(id);
  },

  // Guest Reports
  async getGuestReports(user) {
    if (!user) return [];
    const query = new URLSearchParams({ userId: user.id, role: user.role });
    const res = await request(`/guests?${query.toString()}`);
    if (Array.isArray(res)) return res;
    return guestReportService.getReports(user);
  },
  async addGuestReport(reportData) {
    const res = await request("/guests", {
      method: "POST",
      body: JSON.stringify(reportData)
    });
    if (res && res.report) return res.report;
    return guestReportService.createReport(reportData);
  },
  async updateGuestReport(id, updates) {
    const res = await request(`/guests/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates)
    });
    if (res && res.report) return res.report;
    return guestReportService.updateReport(id, updates);
  },
  async deleteGuestReport(id) {
    const res = await request(`/guests/${id}`, { method: "DELETE" });
    if (res && res.success) return res;
    return guestReportService.deleteReport(id);
  },

  // Chat
  async getChatMessages() {
    const res = await request("/chat");
    if (Array.isArray(res)) return res;
    return chatService.getMessages();
  },
  async sendChatMessage({ user, message }) {
    const res = await request("/chat", {
      method: "POST",
      body: JSON.stringify({ user, message })
    });
    if (res && res.chat) return res.chat;
    return chatService.sendMessage({ user, message });
  },
  async clearChatMessages() {
    const res = await request("/chat", { method: "DELETE" });
    if (res && res.success) return res;
    return chatService.clearMessages();
  },

  // Kartu Keluarga OCR Auto-Fill
  async parseKK(imageData) {
    return await request("/parse-kk", {
      method: "POST",
      body: JSON.stringify({ image: imageData })
    });
  }
};
