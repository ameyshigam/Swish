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

        if (!email.endsWith('@model.edu.in')) {
            return setError('Please use your college email ending with @model.edu.in');
        }

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
                {/* Vibrant Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-400"></div>

                {/* Animated Floating Orbs */}
                <div className="absolute inset-0">
                    <div className="absolute top-1/4 -left-20 w-96 h-96 bg-white/20 rounded-full blur-[100px] animate-pulse"></div>
                    <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-sky-300/30 rounded-full blur-[80px] animate-pulse delay-1000"></div>
                    <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-300/20 rounded-full blur-[60px] animate-pulse delay-500"></div>
                    <div className="absolute top-10 right-20 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse delay-700"></div>
                </div>

                {/* Noise Texture */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>

                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:60px_60px]"></div>

                <div className="relative z-10 flex flex-col justify-center px-16 text-white">
                    {/* Logo */}
                    <div className="flex items-center gap-4 mb-12">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-2xl border border-white/20">
                            S
                        </div>
                        <span className="text-4xl font-black tracking-tight drop-shadow-lg">Swish</span>
                    </div>

                    <h2 className="text-5xl font-black mb-6 leading-tight drop-shadow-lg">
                        Connect with your<br />campus community
                    </h2>
                    <p className="text-white/80 text-lg max-w-md leading-relaxed">
                        Share moments, discover events, and stay connected with fellow students and faculty.
                    </p>

                    {/* Stats with glassmorphism */}
                    <div className="mt-16 flex gap-6">
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:-translate-y-1">
                            <div className="text-4xl font-black">{formatCount(stats.users)}</div>
                            <div className="text-white/70 text-sm mt-1 font-medium">Active Users</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:-translate-y-1">
                            <div className="text-4xl font-black">{formatCount(stats.posts)}</div>
                            <div className="text-white/70 text-sm mt-1 font-medium">Posts Shared</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:-translate-y-1">
                            <div className="text-4xl font-black">{formatCount(stats.communities)}</div>
                            <div className="text-white/70 text-sm mt-1 font-medium">Communities</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="lg:hidden text-center mb-10">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-400 rounded-2xl flex items-center justify-center text-white font-bold text-xl mx-auto mb-4 shadow-xl shadow-cyan-500/30">
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
                                    placeholder="student@model.edu.in"
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
                            className="w-full py-4 bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 text-white rounded-xl font-semibold flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 hover:scale-[1.02] transition-all shadow-lg shadow-cyan-500/30"
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
