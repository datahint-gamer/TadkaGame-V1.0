import api, { ENDPOINTS } from './client';

// ============================================
// AUTH SERVICES
// ============================================
export const authService = {
  login: async (email, password) => {
    const response = await api.post(ENDPOINTS.AUTH.LOGIN, { email, password });
    return response.data;
  },
  
  register: async (userData) => {
    const response = await api.post(ENDPOINTS.AUTH.REGISTER, userData);
    return response.data;
  },
  
  logout: async () => {
    const response = await api.post(ENDPOINTS.AUTH.LOGOUT);
    return response.data;
  },
  
  getMe: async () => {
    const response = await api.get(ENDPOINTS.AUTH.ME);
    return response.data;
  },
  
  refreshToken: async () => {
    const response = await api.post(ENDPOINTS.AUTH.REFRESH);
    return response.data;
  },
  
  forgotPassword: async (email) => {
    const response = await api.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
    return response.data;
  },
  
  resetPassword: async (token, password) => {
    const response = await api.post(ENDPOINTS.AUTH.RESET_PASSWORD, { token, password });
    return response.data;
  },
};

// ============================================
// USER SERVICES
// ============================================
export const userService = {
  getProfile: async () => {
    const response = await api.get(ENDPOINTS.USERS.PROFILE);
    return response.data;
  },
  
  updateProfile: async (data) => {
    const response = await api.put(ENDPOINTS.USERS.UPDATE, data);
    return response.data;
  },
  
  changePassword: async (currentPassword, newPassword) => {
    const response = await api.put(ENDPOINTS.USERS.CHANGE_PASSWORD, {
      currentPassword,
      newPassword,
    });
    return response.data;
  },
  
  updateSettings: async (settings) => {
    const response = await api.put(ENDPOINTS.USERS.UPDATE, { settings });
    return response.data;
  },
};

// ============================================
// GAME SERVICES
// ============================================
export const gameService = {
  startGame: async (gameType = 'classic') => {
    const response = await api.post(ENDPOINTS.GAME.START, { gameType });
    return response.data;
  },
  
  gameAction: async (sessionId, action, data) => {
    const response = await api.post(ENDPOINTS.GAME.ACTION, {
      sessionId,
      action,
      data,
    });
    return response.data;
  },
  
  endGame: async (sessionId, score) => {
    const response = await api.post(ENDPOINTS.GAME.END, {
      sessionId,
      score,
    });
    return response.data;
  },
  
  getGameState: async (sessionId) => {
    const response = await api.get(`${ENDPOINTS.GAME.STATE}/${sessionId}`);
    return response.data;
  },
};

// ============================================
// LEADERBOARD SERVICES
// ============================================
export const leaderboardService = {
  getGlobal: async (page = 1, limit = 50) => {
    const response = await api.get(ENDPOINTS.LEADERBOARD.GLOBAL, {
      params: { page, limit },
    });
    return response.data;
  },
  
  getWeekly: async () => {
    const response = await api.get(ENDPOINTS.LEADERBOARD.WEEKLY);
    return response.data;
  },
  
  getFriends: async () => {
    const response = await api.get(ENDPOINTS.LEADERBOARD.FRIENDS);
    return response.data;
  },
};

// ============================================
// SHOP SERVICES
// ============================================
export const shopService = {
  getItems: async (category) => {
    const response = await api.get(ENDPOINTS.SHOP.ITEMS, {
      params: { category },
    });
    return response.data;
  },
  
  buyItem: async (itemId, quantity = 1) => {
    const response = await api.post(ENDPOINTS.SHOP.BUY, {
      itemId,
      quantity,
    });
    return response.data;
  },
  
  getInventory: async () => {
    const response = await api.get(ENDPOINTS.SHOP.INVENTORY);
    return response.data;
  },
};

// ============================================
// TOURNAMENT SERVICES
// ============================================
export const tournamentService = {
  getTournaments: async (status = 'active') => {
    const response = await api.get(ENDPOINTS.TOURNAMENTS.LIST, {
      params: { status },
    });
    return response.data;
  },
  
  joinTournament: async (tournamentId) => {
    const response = await api.post(ENDPOINTS.TOURNAMENTS.JOIN(tournamentId));
    return response.data;
  },
  
  getTournamentLeaderboard: async (tournamentId) => {
    const response = await api.get(ENDPOINTS.TOURNAMENTS.LEADERBOARD(tournamentId));
    return response.data;
  },
};

// ============================================
// SUPPORT SERVICES
// ============================================
export const supportService = {
  getTickets: async () => {
    const response = await api.get(ENDPOINTS.SUPPORT.TICKETS);
    return response.data;
  },
  
  createTicket: async (subject, message, category = 'general') => {
    const response = await api.post(ENDPOINTS.SUPPORT.CREATE, {
      subject,
      message,
      category,
    });
    return response.data;
  },
  
  replyToTicket: async (ticketId, message) => {
    const response = await api.post(ENDPOINTS.SUPPORT.REPLY(ticketId), {
      message,
    });
    return response.data;
  },
};

// ============================================
// ADMIN SERVICES (Requires Admin Role)
// ============================================
export const adminService = {
  // Dashboard
  getDashboardStats: async () => {
    const response = await api.get(ENDPOINTS.ADMIN.DASHBOARD);
    return response.data;
  },
  
  // Users Management
  getUsers: async (params = {}) => {
    const response = await api.get(ENDPOINTS.ADMIN.USERS, { params });
    return response.data;
  },
  
  getUser: async (userId) => {
    const response = await api.get(ENDPOINTS.ADMIN.USER(userId));
    return response.data;
  },
  
  updateUser: async (userId, data) => {
    const response = await api.put(ENDPOINTS.ADMIN.USER(userId), data);
    return response.data;
  },
  
  banUser: async (userId, reason, duration) => {
    const response = await api.put(ENDPOINTS.ADMIN.USER(userId), {
      isBanned: true,
      banReason: reason,
      banDuration: duration,
    });
    return response.data;
  },
  
  unbanUser: async (userId) => {
    const response = await api.put(ENDPOINTS.ADMIN.USER(userId), {
      isBanned: false,
      banReason: null,
    });
    return response.data;
  },
  
  // Currency Management
  addCurrency: async (userId, type, amount, reason) => {
    const response = await api.post(ENDPOINTS.ADMIN.ADD_CURRENCY, {
      userId,
      type, // 'coins' or 'gems'
      amount,
      reason,
    });
    return response.data;
  },
  
  // Transactions
  getTransactions: async (params = {}) => {
    const response = await api.get(ENDPOINTS.ADMIN.TRANSACTIONS, { params });
    return response.data;
  },
  
  // Analytics
  getAnalytics: async (period = '7d') => {
    const response = await api.get(ENDPOINTS.ADMIN.ANALYTICS, {
      params: { period },
    });
    return response.data;
  },
  
  // Support Tickets
  getAllTickets: async (status) => {
    const response = await api.get(ENDPOINTS.ADMIN.TICKETS, {
      params: { status },
    });
    return response.data;
  },
  
  replyToTicket: async (ticketId, message) => {
    const response = await api.post(ENDPOINTS.ADMIN.TICKET_REPLY(ticketId), {
      message,
    });
    return response.data;
  },
  
  // Shop Management
  createShopItem: async (itemData) => {
    const response = await api.post(ENDPOINTS.ADMIN.SHOP, itemData);
    return response.data;
  },
  
  updateShopItem: async (itemId, itemData) => {
    const response = await api.put(ENDPOINTS.ADMIN.SHOP_ITEM(itemId), itemData);
    return response.data;
  },
  
  deleteShopItem: async (itemId) => {
    const response = await api.delete(ENDPOINTS.ADMIN.SHOP_ITEM(itemId));
    return response.data;
  },
};

export default {
  auth: authService,
  user: userService,
  game: gameService,
  leaderboard: leaderboardService,
  shop: shopService,
  tournament: tournamentService,
  support: supportService,
  admin: adminService,
};
