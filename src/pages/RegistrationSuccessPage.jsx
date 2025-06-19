import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { FiMail } from 'react-icons/fi';

export default function RegistrationSuccessPage() {
    const location = useLocation();
    // Get the email address passed from the registration page
    const email = location.state?.email || 'your email address';

    const handleResendEmail = () => {
        // In the future, you can add logic here to resend the verification email.
        alert('Resend email functionality not yet implemented.');
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <div className="w-full max-w-md p-8 space-y-6 text-center bg-foreground rounded-lg shadow-md border border-border">
                
                <div className="flex justify-center">
                    <div className="p-4 bg-primary/10 rounded-full">
                        <FiMail size={40} className="text-primary" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-text-primary">
                        Check your inbox
                    </h1>
                    <p className="text-text-secondary">
                        We've sent a verification link to <br />
                        <span className="font-semibold text-text-primary">{email}</span>.
                    </p>
                </div>
                
                <div className="pt-4">
                    <p className="text-sm text-text-secondary">
                        Didn't receive the email?
                    </p>
                    <button 
                        onClick={handleResendEmail}
                        className="font-medium text-primary hover:underline"
                    >
                        Click to resend
                    </button>
                </div>

                <Link 
                    to="/login" 
                    className="inline-block pt-4 text-sm text-text-secondary hover:text-primary"
                >
                    &larr; Back to Login
                </Link>
                
            </div>
        </div>
    );
}