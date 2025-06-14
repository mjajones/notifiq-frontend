import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const AuthProvider = ({ children }) => {
    const [authTokens, setAuthTokens] = useState(() => 
        localStorage.getItem('authTokens') ? JSON.parse(localStorage.getItem('authTokens')) : null
    );
    const [user, setUser] = useState(() => 
        localStorage.getItem('authTokens') ? jwtDecode(localStorage.getItem('authTokens')) : null
    );
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    const loginUser = async (username, password) => {
        const response = await fetch(`${API_URL}/api/token/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await response.json();

        if(response.status === 200){
            setAuthTokens(data);
            setUser(jwtDecode(data.access));
            localStorage.setItem('authTokens', JSON.stringify(data));
            navigate('/dashboard');
            return true;
        } else {
            return false;
        }
    };

    const logoutUser = () => {
        setAuthTokens(null);
        setUser(null);
        localStorage.removeItem('authTokens');
        navigate('/login');
    };

    const updateToken = async () => {
        if (!authTokens?.refresh) {
            logoutUser();
            return;
        }

        const response = await fetch(`${API_URL}/api/token/refresh/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 'refresh': authTokens.refresh })
        });

        const data = await response.json();
        
        if (response.status === 200) {
            setAuthTokens(data);
            setUser(jwtDecode(data.access));
            localStorage.setItem('authTokens', JSON.stringify(data));
        } else {
            logoutUser();
        }

        if (loading) {
            setLoading(false);
        }
    };

    const contextData = {
        user,
        authTokens,
        loginUser,
        logoutUser,
    };

    useEffect(() => {
        if (loading) {
            if (authTokens) {
                updateToken();
            } else {
                setLoading(false);
            }
        }
        
        const fourMinutes = 1000 * 60 * 4;
        let interval = setInterval(() => {
            if (authTokens) {
                updateToken();
            }
        }, fourMinutes);


        return () => clearInterval(interval);

    }, [authTokens, loading]);

    return(
        <AuthContext.Provider value={contextData} >
            {loading ? null : children}
        </AuthContext.Provider>
    );
};

export default AuthContext;