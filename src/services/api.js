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

/**
 * Get all bikes
 */
export const getAllBikes = async () => {
    const response = await api.get('/Bikes');
    return response.data;
};

/**
 * Get bike by id
 * @param {number} id 
 */
export const getBikeById = async (id) => {
    const response = await api.get(`/Bikes/${id}`);
    return response.data;
};

/**
 * Create a new bike listing
 * @param {Object} bikeData 
 */
export const createBike = async (bikeData) => {
    const payload = new FormData();

    // Map frontend keys to backend DTO property names (PascalCase)
    const keyMap = {
        sellerId: 'SellerId',
        title: 'Title',
        description: 'Description',
        price: 'Price',
        brandId: 'BrandId',
        categoryId: 'CategoryId',
        frameSize: 'FrameSize',
        bikeCondition: 'BikeCondition',
        isAnonymous: 'IsAnonymous'
    };

    Object.keys(bikeData).forEach(key => {
        if (key === 'imageFiles') {
            if (bikeData.imageFiles && bikeData.imageFiles.length > 0) {
                bikeData.imageFiles.forEach(file => payload.append('ImageFiles', file));
            }
        } else if (key === 'imageUrls') {
            if (bikeData.imageUrls && bikeData.imageUrls.length > 0) {
                bikeData.imageUrls.forEach(url => payload.append('ImageUrls', url));
            }
        } else if (keyMap[key]) {
            const value = bikeData[key];
            // Only append if value is valid (not null, undefined, empty string, or NaN)
            if (value !== null && value !== undefined && value !== '' && !Number.isNaN(value)) {
                payload.append(keyMap[key], String(value));
            }
        }
    });

    const config = { headers: { 'Content-Type': 'multipart/form-data' } };
    const response = await api.post('/Bikes', payload, config);
    return response.data;
};

export const updateBike = async (id, bikeData) => {
    const payload = new FormData();

    // Map frontend keys to backend DTO property names (PascalCase)
    const keyMap = {
        title: 'Title',
        description: 'Description',
        price: 'Price',
        brandId: 'BrandId',
        categoryId: 'CategoryId',
        frameSize: 'FrameSize',
        bikeCondition: 'BikeCondition',
        status: 'Status',
        isAnonymous: 'IsAnonymous'
    };

    Object.keys(bikeData).forEach(key => {
        if (key === 'imageFiles') {
            if (bikeData.imageFiles && bikeData.imageFiles.length > 0) {
                bikeData.imageFiles.forEach(file => payload.append('ImageFiles', file));
            }
        } else if (key === 'imageUrls') {
            // Send existing image URLs to keep them, or an empty list to clear them
            if (bikeData.imageUrls && bikeData.imageUrls.length > 0) {
                bikeData.imageUrls.forEach(url => payload.append('ImageUrls', url));
            } else {
                // If the user removed all images, we should still notify the backend
                // but FormData doesn't send "empty arrays" well. 
                // The backend BikeService handles null ImageUrls by keeping the RemoveRange wipe.
            }
        } else if (keyMap[key]) {
            const value = bikeData[key];
            if (value !== null && value !== undefined && value !== '' && !Number.isNaN(value)) {
                payload.append(keyMap[key], String(value));
            }
        }
    });

    const config = { headers: { 'Content-Type': 'multipart/form-data' } };
    const response = await api.put(`/Bikes/${id}`, payload, config);
    return response.data;
};

/**
 * Delete a bike listing
 * @param {number} id 
 */
export const deleteBike = async (id) => {
    const response = await api.delete(`/Bikes/${id}`);
    return response.data;
};

export default api;
