import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5026/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor – attach token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor – handle 401
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

/**
 * Login user
 * @param {string} email
 * @param {string} password
 * @returns {Promise} response with token & user data
 */
export const loginUser = async (email, password) => {
    const response = await api.post('/Auth/login', { email, password });
    return response.data;
};

/**
 * Register a new user (defaults to Buyer)
 * @param {Object} userData 
 */
export const registerUser = async (userData) => {
    const response = await api.post('/Auth/register', userData);
    return response.data;
};

/**
 * Get all users
 */
export const getAllUsers = async () => {
    const response = await api.get('/Users');
    return response.data;
};

/**
 * Get user by id
 * @param {number} id 
 */
export const getUserById = async (id) => {
    const response = await api.get(`/Users/${id}`);
    return response.data;
};

/**
 * Create a new user
 * @param {Object} userData 
 */
export const createUser = async (userData) => {
    const response = await api.post('/Users', userData);
    return response.data;
};

/**
 * Update an existing user
 * @param {number} id 
 * @param {Object} userData 
 */
export const updateUser = async (id, userData) => {
    const response = await api.put(`/Users/${id}`, userData);
    return response.data;
};

/**
 * Update user role (Admin only)
 * @param {number} id 
 * @param {number} roleId 
 */
export const updateUserRole = async (id, roleId) => {
    const response = await api.put(`/Users/${id}/role`, { roleId });
    return response;
};

/**
 * Buyer requests to become a Seller
 * @param {number} id 
 */
export const requestSellerRole = async (id) => {
    const response = await api.post(`/Users/${id}/request-seller`);
    return response;
};

/**
 * Delete a user
 * @param {number} id 
 */
export const deleteUser = async (id) => {
    const response = await api.delete(`/Users/${id}`);
    return response.data;
};

/**
 * Get all bikes with optional filters
 * @param {Object} filters
 */
export const getBikes = async (filters = {}) => {
    const params = new URLSearchParams();

    if (filters.categoryId) params.append('categoryId', filters.categoryId);
    if (filters.brandId) params.append('brandId', filters.brandId);
    if (filters.minPrice) params.append('minPrice', filters.minPrice);
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
    if (filters.searchTitle) params.append('searchTitle', filters.searchTitle);

    const response = await api.get(`/Bikes?${params.toString()}`);
    return response.data;
};

/**
 * Get all brands
 */
export const getBrands = async () => {
    const response = await api.get('/Brands');
    return response.data;
};

/**
 * Get all categories
 */
export const getCategories = async () => {
    const response = await api.get('/Categories');
    return response.data;
};

/**
 * Get bike condition options
 * Falls back to client defaults if endpoint is unavailable
 */
export const getBikeConditions = async () => {
    try {
        const response = await api.get('/Bikes/conditions');
        return response.data;
    } catch {
        return ['New', 'Like New', 'Used', 'Needs Repair'];
    }
};

/**
 * Get bike details by ID
 * @param {number} id 
 */
export const getBikeById = async (id) => {
    const response = await api.get(`/Bikes/${id}`);
    return response.data;
};

/**
 * Get all orders
 */
export const getOrders = async () => {
    const response = await api.get('/Orders');
    return response.data;
};

/**
 * Get order by ID
 * @param {number} orderId
 */
export const getOrderById = async (orderId) => {
    const response = await api.get(`/Orders/${orderId}`);
    return response.data;
};

/**
 * Create a new order
 * @param {Object} payload
 */
export const createOrder = async (payload) => {
    const response = await api.post('/Orders', payload);
    return response.data;
};

/**
 * Add bike to buyer wishlist
 * @param {{buyerId: number, bikeId: number}} payload
 */
export const addToWishlist = async (payload) => {
    const response = await api.post('/Wishlists', payload);
    return response.data;
};

/**
 * Get all wishlist items (buyer will be filtered on client side)
 */
export const getWishlists = async () => {
    const response = await api.get('/Wishlists');
    return response.data;
};

/**
 * Buyer confirms received bike
 * @param {number} orderId
 */
export const confirmOrderReceived = async (orderId) => {
    const response = await api.put(`/Orders/confirm-received/${orderId}`);
    return response.data;
};

/**
 * Create a review for seller after order is received
 * @param {Object} payload
 */
export const createReview = async (payload) => {
    const response = await api.post('/Reviews', payload);
    return response.data;
};

/**
 * Get all reviews
 */
export const getReviews = async () => {
    const response = await api.get('/Reviews');
    return response.data;
};

/**
 * Update a review
 * @param {number} reviewId
 * @param {Object} payload
 */
export const updateReview = async (reviewId, payload) => {
    const response = await api.put(`/Reviews/${reviewId}`, payload);
    return response.data;
};

/**
 * Delete a review
 * @param {number} reviewId
 */
export const deleteReview = async (reviewId) => {
    const response = await api.delete(`/Reviews/${reviewId}`);
    return response.data;
};

/**
 * Create bike report (supports evidence image upload)
 * @param {FormData} formData
 */
export const createBikeReport = async (formData) => {
    const response = await api.post('/Reports', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

/**
 * Admin gets all reports
 */
export const getAllReports = async () => {
    const response = await api.get('/Reports');
    return response.data;
};

/**
 * Buyer gets own reports
 */
export const getMyReports = async () => {
    const response = await api.get('/Reports/my-reports');
    return response.data;
};

/**
 * Admin updates report status
 * @param {number} reportId
 * @param {string} status
 */
export const updateReportStatus = async (reportId, status) => {
    const response = await api.patch(`/Reports/${reportId}`, { status });
    return response.data;
};

/**
 * Buyer updates own pending report
 * @param {number} reportId
 * @param {FormData} formData
 */
export const updateMyPendingReport = async (reportId, formData) => {
    const response = await api.put(`/Reports/${reportId}/my-report`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

/**
 * Buyer deletes own pending report
 * @param {number} reportId
 */
export const deleteMyPendingReport = async (reportId) => {
    const response = await api.delete(`/Reports/${reportId}/my-report`);
    return response.data;
};

/**
 * Fake payment confirm callback (VietQR demo)
 * @param {number} orderId
 */
export const confirmPayment = async (orderId) => {
    const response = await api.post('/Payment/confirm', { orderId });
    return response.data;
};

/**
 * Create a bike listing (status will be handled by backend, expected PENDING)
 * @param {Object} payload
 */
export const createBikeListing = async (payload) => {
    const response = await api.post('/Bikes', payload);
    return response.data;
};

/**
 * Upload bike image to Cloudinary via Backend
 * @param {number} bikeId 
 * @param {File} file 
 */
export const uploadBikeImage = async (bikeId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/Bikes/${bikeId}/images`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

/**
 * Delete bike image by URL via Backend
 * @param {number} bikeId 
 * @param {string} imageUrl 
 */
export const deleteBikeImage = async (bikeId, imageUrl) => {
    const response = await api.delete(`/Bikes/${bikeId}/images`, {
        params: { imageUrl }
    });
    return response.data;
};

/**
 * Seller requests inspection for a bike listing
 * @param {number} bikeId
 */
export const requestBikeInspection = async (bikeId) => {
    const response = await api.post(`/Bikes/${bikeId}/inspection-request`);
    return response.data;
};

/**
 * Inspector gets pending inspection requests
 */
export const getPendingInspectionRequests = async () => {
    const response = await api.get('/InspectionReports/pending');
    return response.data;
};

/**
 * Get all inspection reports
 */
export const getInspectionReports = async () => {
    const response = await api.get('/InspectionReports');
    return response.data;
};

/**
 * Inspector completes an inspection report
 * @param {number} reportId
 * @param {Object} payload
 */
export const completeInspectionReport = async (reportId, payload) => {
    const response = await api.put(`/InspectionReports/${reportId}/complete`, payload);

    return response.data;
};

/**
 * Send a chat message
 * @param {Object} payload
 */
export const sendMessage = async (payload) => {
    const response = await api.post('/Messages', payload);
    return response.data;
};

/**
 * Get conversation between two users
 * @param {number} user1Id
 * @param {number} user2Id
 * @param {number | null} bikeId
 */
export const getConversationMessages = async (user1Id, user2Id, bikeId = null) => {
    const response = await api.get('/Messages/conversation', {
        params: {
            user1Id,
            user2Id,
            ...(bikeId ? { bikeId } : {}),
        },
    });
    return response.data;
};

/**
 * Get inbox summary for a user
 * @param {number} userId
 */
export const getMessageInbox = async (userId) => {
    const response = await api.get(`/Messages/inbox/${userId}`);
    return response.data;
};

/**
 * FR-11: Get inspection history for a specific bike
 * @param {number} bikeId
 */
export const getInspectionHistoryByBike = async (bikeId) => {
    const response = await api.get(`/InspectionReports/bike/${bikeId}/history`);
    return response.data;
};

/**
 * FR-12: Request re-inspection for a previously rejected report
 * @param {number} reportId
 */
export const requestReInspection = async (reportId) => {
    const response = await api.post(`/InspectionReports/${reportId}/re-inspect`);
    return response.data;
};

export default api;
