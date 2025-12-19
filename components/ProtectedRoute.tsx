

import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface ProtectedRouteProps {
    allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
    const { isAuthenticated, user } = useAuth();
    const location = useLocation();

    if (!isAuthenticated || !user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check Role Access
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // If unauthorized, redirect to a safe page (e.g., Dashboard)
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;