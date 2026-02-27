import axios from 'axios';

const api = axios.create({
    baseURL: 'https://localhost:7271/api',
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
 * Delete a user
 * @param {number} id 
 */
export const deleteUser = async (id) => {
    const response = await api.delete(`/Users/${id}`);
    return response.data;
};

export default api;
