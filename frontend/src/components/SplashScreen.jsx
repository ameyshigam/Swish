import React, { useState, useEffect } from 'react';

const SplashScreen = ({ onComplete }) => {
    const [progress, setProgress] = useState(0);
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(() => {
                        setFadeOut(true);
                        setTimeout(onComplete, 500);
                    }, 200);
                    return 100;
                }
                return prev + 2;
            });
        }, 20);

        return () => clearInterval(interval);
    }, [onComplete]);

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-background transition-all duration-500 ${fadeOut ? 'opacity-0 scale-105' : 'opacity-100 scale-100'}`}>
            {/* Premium Background */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-primary/30 via-purple-500/20 to-transparent rounded-full blur-[150px] animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-gradient-to-tl from-pink-500/20 via-primary/20 to-transparent rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex flex-col items-center">
                {/* Logo */}
                <div className="mb-8 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary to-pink-600 rounded-3xl blur-xl opacity-50 animate-pulse"></div>
                    <div className="relative w-24 h-24 bg-gradient-to-br from-primary via-purple-600 to-pink-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-primary/40 animate-bounce-in">
                        <span className="text-5xl font-black text-white">S</span>
                    </div>
                </div>

                {/* App Name */}
                <h1 className="text-5xl font-black text-foreground mb-2 tracking-tight animate-fade-in">
                    Swish
                </h1>
                <p className="text-muted-foreground text-base font-medium mb-12 animate-fade-in" style={{ animationDelay: '0.15s' }}>
                    Connect. Share. Inspire.
                </p>

                {/* Loading Bar */}
                <div className="w-48 h-1 bg-muted/50 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-primary via-purple-500 to-pink-500 rounded-full transition-all duration-100 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Status */}
                <p className="text-muted-foreground text-xs mt-6 font-medium tracking-wide">
                    {progress < 100 ? 'Loading experience...' : 'Welcome!'}
                </p>
            </div>
        </div>
    );
};

export default SplashScreen;
