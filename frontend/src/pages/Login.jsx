import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowRight, Loader2, AlertCircle, Mail } from 'lucide-react';
import axios from 'axios';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({ users: 0, posts: 0, communities: 0 });
    const { login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.get('/auth/public-stats');
                setStats(res.data);
            } catch (err) {
                console.error("Failed to fetch public stats", err);
            }
        };
        fetchStats();
    }, []);

    const formatCount = (num) => {
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K+';
        return num + '+';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await login(email, password);
            const role = res?.user?.role;
            if (role === 'Admin') navigate('/admin', { replace: true });
            else navigate('/', { replace: true });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex transition-colors duration-300">
            {/* Left Panel - Premium Branding */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                {/* Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900"></div>

                {/* Animated Orbs */}
                <div className="absolute inset-0">
                    <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-pulse"></div>
                    <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-purple-500/20 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '1s' }}></div>
                    <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-[60px] animate-pulse" style={{ animationDelay: '2s' }}></div>
                </div>

                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]"></div>

                <div className="relative z-10 flex flex-col justify-center px-16 text-white">
                    {/* Logo */}
                    <div className="flex items-center gap-4 mb-12">
                        <div className="w-14 h-14 bg-gradient-to-br from-primary via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-2xl shadow-primary/30">
                            S
                        </div>
                        <span className="text-4xl font-black tracking-tight">Swish</span>
                    </div>

                    <h2 className="text-4xl font-black mb-4 leading-tight">
                        Connect with your<br />campus community
                    </h2>
                    <p className="text-slate-400 text-lg max-w-md leading-relaxed">
                        Share moments, discover events, and stay connected with fellow students and faculty.
                    </p>

                    <div className="mt-16 flex gap-12">
                        <div className="group">
                            <div className="text-3xl font-black bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">{formatCount(stats.users)}</div>
                            <div className="text-slate-500 text-sm mt-1 font-medium">Active Users</div>
                        </div>
                        <div className="group">
                            <div className="text-3xl font-black bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">{formatCount(stats.posts)}</div>
                            <div className="text-slate-500 text-sm mt-1 font-medium">Posts Shared</div>
                        </div>
                        <div className="group">
                            <div className="text-3xl font-black bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">{formatCount(stats.communities)}</div>
                            <div className="text-slate-500 text-sm mt-1 font-medium">Communities</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="lg:hidden text-center mb-10">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg mx-auto mb-4 shadow-xl shadow-primary/30">
                            S
                        </div>
                        <span className="text-2xl font-black text-foreground">Swish</span>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-3xl font-black text-foreground mb-2">Welcome back</h2>
                        <p className="text-muted-foreground">Sign in to continue to your campus network</p>
                    </div>

                    {error && (
                        <div className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-xl mb-6 text-destructive text-sm animate-scale-in">
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-foreground mb-2">Email</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3.5 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-border transition-all"
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-foreground mb-2">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-4 py-3.5 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-border transition-all"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="neo-button-primary w-full rounded-xl flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed py-4"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Sign in
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="flex items-center justify-center gap-2 bg-muted/50 p-4 rounded-xl border border-border/50 mt-8">
                        <span className="text-muted-foreground">Don't have an account? </span>
                        <Link to="/register" className="text-foreground font-semibold hover:underline">
                            Create Account
                        </Link>
                    </div>

                    <div className="mt-12 pt-8 border-t border-border text-center text-xs text-muted-foreground">
                        By signing in, you agree to our Terms of Service and Privacy Policy
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
