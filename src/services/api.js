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

export default api;
