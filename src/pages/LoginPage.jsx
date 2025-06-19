import React, { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const inputClass = "w-full bg-foreground p-3 rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-shadow text-text-primary";
const labelClass = "block mb-1.5 text-sm font-medium text-text-secondary";

export default function LoginPage() {
    const [username, setUsername] = useState(''); // This state will hold the email
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { loginUser } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const success = await loginUser(username, password);
        if (success) {
            navigate('/dashboard');
        } else {
            setError('Failed to log in. Please check your email and password.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <div className="w-full max-w-md p-8 space-y-6 bg-foreground rounded-lg shadow-md border border-border">
                
                <div className="flex justify-center">
                    <img src="/notifiqlogo.png" alt="NotifiQ Desk Logo" className="w-auto h-12" />
                </div>

                <div className="text-center">
                    <h2 className="text-2xl font-bold text-text-primary">Welcome Back!</h2>
                    <p className="text-text-secondary mt-1">Sign in to your NotifiQ account</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className={labelClass}>Email Address</label>
                        <input
                            id="email"
                            type="email" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className={inputClass}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className={labelClass}>Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={inputClass}
                            required
                        />
                    </div>

                    {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                    
                    <div className="text-sm text-right">
                        <Link to="/forgot-password" className="font-medium text-primary hover:underline">
                            Forgot Password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-primary text-white font-semibold py-3 px-4 rounded-md hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary transition-colors"
                    >
                        Login
                    </button>
                </form>
                <p className="text-center text-sm text-text-secondary">
                    Don't have an account?{' '}
                    <Link to="/register" className="font-medium text-primary hover:underline">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
}