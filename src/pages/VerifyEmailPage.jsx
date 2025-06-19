import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function VerifyEmailPage() {
    const { uidb64, token } = useParams();
    const [message, setMessage] = useState('Verifying your email, please wait...');
    const [error, setError] = useState(false);

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                const response = await fetch(`${API_URL}/api/verify-email/${uidb64}/${token}/`);
                const data = await response.json();

                if (response.ok) {
                    setMessage(data.message || 'Email successfully verified! You can now log in.');
                    setError(false);
                } else {
                    setMessage(data.error || 'Activation link is invalid or has expired.');
                    setError(true);
                }
            } catch (err) {
                setMessage('An error occurred while trying to verify your email. Please try again later.');
                setError(true);
            }
        };

        verifyEmail();
    }, [uidb64, token]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <div className="w-full max-w-md p-8 space-y-6 text-center bg-foreground rounded-lg shadow-md border border-border">
                <h1 className="text-3xl font-bold text-text-primary">
                    Account Verification
                </h1>
                <p className={`text-lg ${error ? 'text-red-500' : 'text-green-500'}`}>
                    {message}
                </p>
                {!error && (
                    <Link 
                        to="/login" 
                        className="inline-block w-full bg-primary text-white font-semibold py-3 px-4 rounded-md hover:bg-primary-hover"
                    >
                        Go to Login
                    </Link>
                )}
            </div>
        </div>
    );
}