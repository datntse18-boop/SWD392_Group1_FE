import api, { updateUserRole } from './api';

export { updateUserRole };

// ===== FR-13: Admin — Bike Listings =====

/**
 * Get all bikes
 */
export const getAllBikes = async () => {
    const response = await api.get('/Bikes');
    return response.data;
};

/**
 * Approve a bike listing (Admin only)
 * @param {number} id 
 */
export const approveBike = async (id) => {
    const response = await api.put(`/Bikes/${id}/approve`);
    return response.data;
};

/**
 * Reject a bike listing (Admin only)
 * @param {number} id 
 */
export const rejectBike = async (id) => {
    const response = await api.put(`/Bikes/${id}/reject`);
    return response.data;
};

// ===== FR-14: Admin — User Management =====

/**
 * Ban a user (Admin only)
 * @param {number} id 
 */
export const banUser = async (id) => {
    const response = await api.put(`/Users/${id}/ban`);
    return response.data;
};

/**
 * Unban a user (Admin only)
 * @param {number} id 
 */
export const unbanUser = async (id) => {
    const response = await api.put(`/Users/${id}/unban`);
    return response.data;
};
