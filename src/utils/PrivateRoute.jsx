import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const PrivateRoute = () => {
    let { user } = useContext(AuthContext);

    //Affects user logged in or redirect if not
    
    return user ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;