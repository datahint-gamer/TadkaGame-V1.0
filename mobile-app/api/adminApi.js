import api from './client';

// Admin Dashboard APIs
export const adminApi = {
  // Dashboard Stats
  getDashboardStats: () => api.get('/admin/dashboard'),
  
  // User Management
  getUsers: (params) => api.get('/admin/users', { params }),
  getUserById: (id) => api.get(`/admin/users/${id}`),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  banUser: (id, reason, expiresAt) => api.put(`/admin/users/${id}`, { 
    isBanned: true, 
    banReason: reason,
    banExpiresAt: expiresAt 
  }),
  unbanUser: (id) => api.put(`/admin/users/${id}`, { isBanned: false }),
  addCurrency: (userId, coins, gems, reason) => 
    api.post('/admin/add-currency', { userId, coins, gems, reason }),
  
  // Transactions
  getTransactions: (params) => api.get('/admin/transactions', { params }),
  
  // Shop Management
  createShopItem: (data) => api.post('/admin/shop-items', data),
  updateShopItem: (id, data) => api.put(`/admin/shop-items/${id}`, data),
  deleteShopItem: (id) => api.delete(`/admin/shop-items/${id}`),
  
  // Support Tickets
  getTickets: (params) => api.get('/admin/tickets', { params }),
  replyToTicket: (id, content) => api.post(`/admin/tickets/${id}/reply`, { content }),
  assignTicket: (id, adminId) => api.put(`/admin/tickets/${id}/assign`, { adminId }),
  closeTicket: (id) => api.put(`/admin/tickets/${id}/close`),
  
  // Analytics
  getAnalytics: (params) => api.get('/admin/analytics', { params }),
  
  // System
  getSystemLogs: (params) => api.get('/admin/logs', { params }),
  broadcastMessage: (message, type = 'info') => 
    api.post('/admin/broadcast', { message, type }),
};

// Regular User APIs (that connect to backend)
export const userApi = {
  // Auth
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.post('/auth/refresh'),
  changePassword: (data) => api.post('/auth/change-password', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
  
  // User Profile
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  uploadAvatar: (formData) => api.post('/users/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getUserStats: () => api.get('/users/stats'),
  
  // Game
  startGame: (data) => api.post('/game/start', data),
  endGame: (sessionId, data) => api.post(`/game/end/${sessionId}`, data),
  getGameHistory: (params) => api.get('/game/history', { params }),
  getActiveSessions: () => api.get('/game/active'),
  
  // Leaderboard
  getLeaderboard: (type = 'global', period = 'weekly') => 
    api.get(`/leaderboard/${type}`, { params: { period } }),
  getUserRank: () => api.get('/leaderboard/rank'),
  
  // Shop
  getShopItems: () => api.get('/shop/items'),
  purchaseItem: (itemId, quantity = 1) => 
    api.post('/shop/purchase', { itemId, quantity }),
  getInventory: () => api.get('/shop/inventory'),
  useItem: (itemId) => api.post('/shop/use-item', { itemId }),
  
  // Tournaments
  getTournaments: (status) => api.get('/tournaments', { params: { status } }),
  joinTournament: (id) => api.post(`/tournaments/${id}/join`),
  getTournamentDetails: (id) => api.get(`/tournaments/${id}`),
  getTournamentLeaderboard: (id) => api.get(`/tournaments/${id}/leaderboard`),
  
  // Support
  createTicket: (data) => api.post('/support/tickets', data),
  getMyTickets: () => api.get('/support/tickets'),
  getTicketDetails: (id) => api.get(`/support/tickets/${id}`),
  replyToTicket: (id, content) => api.post(`/support/tickets/${id}/reply`, { content }),
  
  // Notifications
  getNotifications: () => api.get('/notifications'),
  markNotificationRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
  
  // Friends
  getFriends: () => api.get('/users/friends'),
  sendFriendRequest: (userId) => api.post('/users/friends/request', { userId }),
  acceptFriendRequest: (requestId) => api.put(`/users/friends/accept/${requestId}`),
  rejectFriendRequest: (requestId) => api.put(`/users/friends/reject/${requestId}`),
  removeFriend: (userId) => api.delete(`/users/friends/${userId}`),
  searchUsers: (query) => api.get('/users/search', { params: { q: query } }),
};

export default { adminApi, userApi };
