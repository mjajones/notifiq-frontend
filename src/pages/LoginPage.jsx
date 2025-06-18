import React, { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const inputClass = "w-full bg-foreground p-3 rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-shadow text-text-primary";
const labelClass = "block mb-1.5 text-sm font-medium text-text-secondary";

export default function LoginPage() {
    const [username, setUsername] = useState(''); // This state will now hold the email
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
                <h1 className="text-3xl font-bold text-center text-text-primary">Welcome Back!</h1>
                <p className="text-center text-text-secondary">Sign in to your NotifiQ account</p>
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
                    
                    {/* Forgot PW link */}
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