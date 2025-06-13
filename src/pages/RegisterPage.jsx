import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const inputClass = "w-full bg-foreground p-3 rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-shadow text-text-primary";
const labelClass = "block mb-1.5 text-sm font-medium text-text-secondary";

export default function RegisterPage() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== password2) {
            setError("Passwords do not match.");
            return;
        }

        try {
            const response = await fetch(`${API_URL}/api/register/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });

            if (response.ok) {
                // Redirect to login page
                navigate('/login', { state: { message: 'Registration successful! Please log in.' } });
            } else {
                const data = await response.json();
                const errorMessage = Object.values(data).flat().join(' ');
                setError(`Registration failed: ${errorMessage}`);
            }
        } catch (err) {
            setError('An error occurred during registration.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <div className="w-full max-w-md p-8 space-y-6 bg-foreground rounded-lg shadow-md border border-border">
                <h1 className="text-3xl font-bold text-center text-text-primary">Create an Account</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="username" className={labelClass}>Username</label>
                        <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} className={inputClass} required />
                    </div>
                    <div>
                        <label htmlFor="email" className={labelClass}>Email</label>
                        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} required />
                    </div>
                    <div>
                        <label htmlFor="password" className={labelClass}>Password</label>
                        <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} required />
                    </div>
                    <div>
                        <label htmlFor="password2" className={labelClass}>Confirm Password</label>
                        <input id="password2" type="password" value={password2} onChange={(e) => setPassword2(e.target.value)} className={inputClass} required />
                    </div>
                    
                    {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                    
                    <button type="submit" className="w-full bg-primary text-white font-semibold py-3 px-4 rounded-md hover:bg-primary-hover ...">
                        Create Account
                    </button>
                </form>
                <p className="text-center text-sm text-text-secondary">
                    Already have an account?{' '}
                    <Link to="/login" className="font-medium text-primary hover:underline">
                        Log in
                    </Link>
                </p>
            </div>
        </div>
    );
}