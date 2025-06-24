import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const ITStaffRoute = () => {
    const { user } = useContext(AuthContext);

    if (!user) {
        return <Navigate to="/login" />;
    }

    // Check if the user is in the IT Staff group OR is a superuser
    const isAuthorized = user.groups?.includes('IT Staff') || user.is_superuser;

    return isAuthorized ? <Outlet /> : <Navigate to="/tickets" />;
};

export default ITStaffRoute;