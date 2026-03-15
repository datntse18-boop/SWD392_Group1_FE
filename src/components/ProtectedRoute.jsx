import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

export default function ProtectedRoute({ children }) {
    const token = localStorage.getItem('accessToken');

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    try {
        const decoded = jwtDecode(token);
        const role = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
        if (role?.toUpperCase() !== 'ADMIN') {
            return <Navigate to="/" replace />;
        }
    } catch (err) {
        // If token is invalid/malformed
        localStorage.removeItem('accessToken');
        return <Navigate to="/login" replace />;
    }

    return children;
}
