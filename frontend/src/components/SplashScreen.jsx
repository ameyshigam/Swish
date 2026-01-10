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
                        setTimeout(onComplete, 400);
                    }, 200);
                    return 100;
                }
                return prev + 3;
            });
        }, 25);

        return () => clearInterval(interval);
    }, [onComplete]);

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-white transition-opacity duration-400 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
            {/* Subtle Background */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] bg-slate-100/60 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-1/3 right-1/3 w-[300px] h-[300px] bg-slate-100/60 rounded-full blur-[100px]"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center">
                {/* Logo */}
                <div className="relative mb-8">
                    <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-2xl animate-bounce-in">
                        <span className="text-4xl font-bold text-slate-900">S</span>
                    </div>
                </div>

                {/* Brand Name */}
                <h1 className="text-4xl font-bold text-slate-900 mb-1 tracking-tight animate-fade-in">
                    Swish
                </h1>
                <p className="text-slate-500 text-sm font-medium mb-10 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                    Campus Network
                </p>

                {/* Progress Bar */}
                <div className="w-40 h-0.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-slate-900 rounded-full transition-all duration-75 ease-out"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>

                {/* Loading Text */}
                <p className="text-slate-600 text-xs mt-4 font-medium">
                    {progress < 100 ? 'Loading...' : 'Welcome'}
                </p>
            </div>
        </div>
    );
};

export default SplashScreen;

