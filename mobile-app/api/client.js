import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================
// PENTEST API CONFIGURATION
// ============================================
// Configure for your penetration testing environment
// 
// LOCAL DEV (Emulator):      http://10.0.2.2:5000/api
// LOCAL DEV (Physical):      http://YOUR_IP:5000/api  
// DOCKER:                    http://localhost:5000/api
// PRODUCTION TARGET:         https://target-domain.com/api
// ============================================

const PENTEST_CONFIG = {
  // Set target API for testing
  TARGET_API: 'http://10.0.2.2:5000/api',  // Android emulator default
  // TARGET_API: 'http://192.168.1.100:5000/api',  // Physical device - UPDATE THIS
  
  // Pentest mode - enables detailed logging
  PENTEST_MODE: true,
  
  // Capture requests for analysis
  CAPTURE_REQUESTS: true,
  
  // Token storage key
  TOKEN_KEY: 'pentest_token',
  USER_KEY: 'pentest_user',
};

const API_URL = PENTEST_CONFIG.TARGET_API;

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-G973F) PentestMobile/1.0',
  },
});

// Request capture storage for pentest analysis
let capturedRequests = [];

export const getCapturedRequests = () => capturedRequests;
export const clearCapturedRequests = () => { capturedRequests = []; };

// ============================================
// REQUEST INTERCEPTOR - PENTEST VERSION
// ============================================
api.interceptors.request.use(
  async (config) => {
    try {
      // Get auth token from storage
      const token = await AsyncStorage.getItem(PENTEST_CONFIG.TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // PENTEST: Log all requests
      if (PENTEST_CONFIG.PENTEST_MODE) {
        const requestLog = {
          timestamp: new Date().toISOString(),
          method: config.method.toUpperCase(),
          url: config.url,
          baseURL: config.baseURL,
          fullURL: `${config.baseURL}${config.url}`,
          headers: config.headers,
          data: config.data,
        };
        
        console.log('═══════════════════════════════════════');
        console.log('🔴 PENTEST REQUEST');
        console.log('═══════════════════════════════════════');
        console.log(`Method: ${requestLog.method}`);
        console.log(`URL: ${requestLog.fullURL}`);
        console.log(`Headers:`, JSON.stringify(requestLog.headers, null, 2));
        console.log(`Body:`, JSON.stringify(requestLog.data, null, 2));
        console.log('═══════════════════════════════════════');
        
        if (PENTEST_CONFIG.CAPTURE_REQUESTS) {
          capturedRequests.push(requestLog);
        }
      }
      
    } catch (error) {
      console.error('Error in request interceptor:', error);
    }
    return config;
  },
  (error) => {
    if (PENTEST_CONFIG.PENTEST_MODE) {
      console.error('🔴 Request Error:', error);
    }
    return Promise.reject(error);
  }
);

// ============================================
// RESPONSE INTERCEPTOR - PENTEST VERSION  
// ============================================
api.interceptors.response.use(
  (response) => {
    if (PENTEST_CONFIG.PENTEST_MODE) {
      const responseLog = {
        timestamp: new Date().toISOString(),
        status: response.status,
        statusText: response.statusText,
        url: response.config.url,
        data: response.data,
        headers: response.headers,
      };
      
      console.log('═══════════════════════════════════════');
      console.log('🟢 PENTEST RESPONSE');
      console.log('═══════════════════════════════════════');
      console.log(`Status: ${responseLog.status} ${responseLog.statusText}`);
      console.log(`URL: ${responseLog.url}`);
      console.log(`Data:`, JSON.stringify(responseLog.data, null, 2));
      console.log('═══════════════════════════════════════');
      
      // Link with request
      const lastRequest = capturedRequests[capturedRequests.length - 1];
      if (lastRequest) {
        lastRequest.response = responseLog;
      }
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    if (PENTEST_CONFIG.PENTEST_MODE) {
      console.log('═══════════════════════════════════════');
      console.log('🟡 PENTEST ERROR RESPONSE');
      console.log('═══════════════════════════════════════');
      console.log(`Status: ${error.response?.status}`);
      console.log(`Message: ${error.message}`);
      console.log(`Data:`, JSON.stringify(error.response?.data, null, 2));
      console.log('═══════════════════════════════════════');
    }
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Clear auth data
      await AsyncStorage.removeItem(PENTEST_CONFIG.TOKEN_KEY);
      await AsyncStorage.removeItem(PENTEST_CONFIG.USER_KEY);
      
      console.log('🔒 Authentication failed - cleared tokens');
    }
    
    // Handle network errors
    if (!error.response) {
      error.message = 'Network Error - Check target connection';
    }
    
    return Promise.reject(error);
  }
);

// ============================================
// PENTEST UTILITIES
// ============================================

// Export request history for analysis
export const exportRequestLog = () => {
  const log = {
    exportedAt: new Date().toISOString(),
    target: PENTEST_CONFIG.TARGET_API,
    totalRequests: capturedRequests.length,
    requests: capturedRequests,
  };
  
  console.log('📋 Exporting captured requests...');
  console.log(JSON.stringify(log, null, 2));
  return log;
};

// Test specific vulnerability patterns
export const testInjection = async (endpoint, payload) => {
  console.log(`🧪 Testing injection on ${endpoint}`);
  console.log(`Payload: ${JSON.stringify(payload)}`);
  
  try {
    const response = await api.post(endpoint, payload);
    console.log('⚠️  WARNING: Payload accepted - check for vulnerability!');
    return { vulnerable: true, response };
  } catch (error) {
    if (error.response?.status === 400 || error.response?.status === 422) {
      console.log('✅ Payload rejected - validation working');
      return { vulnerable: false, error };
    }
    console.log('⚠️  Check response for bypass indicators');
    return { vulnerable: null, error };
  }
};

// Switch API target dynamically
export const setApiTarget = (newTarget) => {
  PENTEST_CONFIG.TARGET_API = newTarget;
  api.defaults.baseURL = newTarget;
  console.log(`🎯 API target switched to: ${newTarget}`);
};

// ============================================
// API ENDPOINTS
// ============================================
export const ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  
  // Users
  USERS: {
    PROFILE: '/users/profile',
    UPDATE: '/users/update',
    CHANGE_PASSWORD: '/users/change-password',
  },
  
  // Game
  GAME: {
    START: '/game/start',
    ACTION: '/game/action',
    END: '/game/end',
    STATE: '/game/state',
  },
  
  // Leaderboard
  LEADERBOARD: {
    GLOBAL: '/leaderboard/global',
    WEEKLY: '/leaderboard/weekly',
    FRIENDS: '/leaderboard/friends',
  },
  
  // Shop
  SHOP: {
    ITEMS: '/shop/items',
    BUY: '/shop/buy',
    INVENTORY: '/shop/inventory',
  },
  
  // Tournaments
  TOURNAMENTS: {
    LIST: '/tournaments',
    JOIN: (id) => `/tournaments/${id}/join`,
    LEADERBOARD: (id) => `/tournaments/${id}/leaderboard`,
  },
  
  // Support
  SUPPORT: {
    TICKETS: '/support/tickets',
    CREATE: '/support/tickets',
    REPLY: (id) => `/support/tickets/${id}/reply`,
  },
  
  // Admin - HIGH VALUE PENTEST TARGETS
  ADMIN: {
    DASHBOARD: '/admin/dashboard',            // ⭐ Access control test
    USERS: '/admin/users',                    // ⭐ Information disclosure
    USER: (id) => `/admin/users/${id}`,       // ⭐ IDOR test
    TRANSACTIONS: '/admin/transactions',      // ⭐ Sensitive data
    ANALYTICS: '/admin/analytics',            // ⭐ Business logic
    TICKETS: '/admin/tickets',                // ⭐ Access control
    TICKET_REPLY: (id) => `/admin/tickets/${id}/reply`,
    SHOP: '/admin/shop',                      // ⭐ Privileged operations
    SHOP_ITEM: (id) => `/admin/shop/${id}`,
    ADD_CURRENCY: '/admin/add-currency',      // ⭐⭐ CRITICAL - Financial manipulation
  },
  
  // Misc
  HEALTH: '/health',
};

export { PENTEST_CONFIG };
export default api;
