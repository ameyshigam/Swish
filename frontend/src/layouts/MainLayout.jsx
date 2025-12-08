import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { Home, Compass, Plus, User, LogOut, Shield, Bell, Bookmark, Menu, X, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';

const NavItem = ({ to, icon: Icon, label, badge, onClick, collapsed }) => (
    <NavLink
        to={to}
        onClick={onClick}
        className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${isActive
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
            }`
        }
    >
        <Icon size={20} strokeWidth={2} />
        {!collapsed && <span className="font-medium">{label}</span>}
        {badge > 0 && (
            <span className={`${collapsed ? 'absolute -top-1 -right-1' : 'ml-auto'} bg-red-500 text-white text-[11px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center`}>
                {badge > 99 ? '99+' : badge}
            </span>
        )}
    </NavLink>
);

const MainLayout = () => {
    const { logout, user } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const [unreadNotifications, setUnreadNotifications] = useState(0);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const fetchUnreadCount = async () => {
            try {
                const res = await axios.get('/notifications/unread-count');
                setUnreadNotifications(res.data.count);
            } catch (error) {
                console.error("Failed to fetch notification count");
            }
        };

        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, []);

    const closeMobileMenu = () => setMobileMenuOpen(false);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            {/* Desktop Sidebar */}
            <aside className="fixed left-0 top-0 h-screen w-64 hidden lg:flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-20">
                {/* Logo */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                    <Link to="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-900 dark:bg-white rounded-xl flex items-center justify-center text-white dark:text-slate-900 font-bold text-lg">
                            S
                        </div>
                        <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Swish</span>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    <NavItem to="/" icon={Home} label="Home" />
                    <NavItem to="/explore" icon={Compass} label="Explore" />
                    <NavItem to="/notifications" icon={Bell} label="Notifications" badge={unreadNotifications} />
                    <NavItem to="/bookmarks" icon={Bookmark} label="Saved" />
                    <NavItem to="/profile" icon={User} label="Profile" />
                    {user?.role === 'Admin' && (
                        <NavItem to="/admin" icon={Shield} label="Admin" />
                    )}
                </nav>

                {/* Create Post Button */}
                <div className="p-4 border-t border-slate-100">
                    <Link
                        to="/create"
                        className="flex items-center justify-center gap-2 w-full py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors"
                    >
                        <Plus size={20} />
                        Create Post
                    </Link>
                </div>

                {/* User Section */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-3">
                        <Link to="/profile" className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex-1">
                            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-semibold">
                                {user?.username?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-slate-900 dark:text-white truncate text-sm">{user?.username}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.role}</p>
                            </div>
                        </Link>
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
                            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                        >
                            {isDark ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                    </div>
                    <button
                        onClick={logout}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded-xl text-sm font-medium transition-colors"
                    >
                        <LogOut size={18} />
                        Sign out
                    </button>
                </div>
            </aside>

            {/* Tablet Sidebar */}
            <aside className="fixed left-0 top-0 h-screen w-20 hidden md:flex lg:hidden flex-col bg-white border-r border-slate-200 z-20">
                <div className="p-4 flex justify-center border-b border-slate-100">
                    <Link to="/" className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-bold">
                        S
                    </Link>
                </div>

                <nav className="flex-1 p-3 space-y-2 flex flex-col items-center">
                    <NavItem to="/" icon={Home} collapsed />
                    <NavItem to="/explore" icon={Compass} collapsed />
                    <NavItem to="/notifications" icon={Bell} badge={unreadNotifications} collapsed />
                    <NavItem to="/bookmarks" icon={Bookmark} collapsed />
                    <NavItem to="/profile" icon={User} collapsed />
                    {user?.role === 'Admin' && (
                        <NavItem to="/admin" icon={Shield} collapsed />
                    )}
                </nav>

                <div className="p-3 border-t border-slate-100 flex flex-col items-center gap-2">
                    <Link
                        to="/create"
                        className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-slate-800 transition-colors"
                    >
                        <Plus size={22} />
                    </Link>
                    <button onClick={logout} className="p-3 text-slate-400 hover:text-red-500 rounded-xl transition-colors">
                        <LogOut size={20} />
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <header className="md:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-slate-200">
                <div className="flex items-center justify-between px-4 py-3">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                            S
                        </div>
                        <span className="text-lg font-bold text-slate-900">Swish</span>
                    </Link>

                    <div className="flex items-center gap-1">
                        <NavLink to="/notifications" className="relative p-2 text-slate-600">
                            <Bell size={22} />
                            {unreadNotifications > 0 && (
                                <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                    {unreadNotifications > 9 ? '9+' : unreadNotifications}
                                </span>
                            )}
                        </NavLink>
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 text-slate-600"
                        >
                            <Menu size={22} />
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div className="md:hidden fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm" onClick={closeMobileMenu}>
                    <div
                        className="absolute right-0 top-0 h-full w-72 bg-white shadow-2xl animate-slide-in"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center p-4 border-b border-slate-100">
                            <span className="text-lg font-bold text-slate-900">Menu</span>
                            <button onClick={closeMobileMenu} className="p-2 hover:bg-slate-100 rounded-lg">
                                <X size={20} />
                            </button>
                        </div>

                        <nav className="p-4 space-y-1">
                            <NavItem to="/" icon={Home} label="Home" onClick={closeMobileMenu} />
                            <NavItem to="/explore" icon={Compass} label="Explore" onClick={closeMobileMenu} />
                            <NavItem to="/create" icon={Plus} label="Create Post" onClick={closeMobileMenu} />
                            <NavItem to="/notifications" icon={Bell} label="Notifications" badge={unreadNotifications} onClick={closeMobileMenu} />
                            <NavItem to="/bookmarks" icon={Bookmark} label="Saved" onClick={closeMobileMenu} />
                            <NavItem to="/profile" icon={User} label="Profile" onClick={closeMobileMenu} />
                            {user?.role === 'Admin' && (
                                <NavItem to="/admin" icon={Shield} label="Admin" onClick={closeMobileMenu} />
                            )}
                        </nav>

                        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-100 bg-white">
                            <div className="flex items-center gap-3 p-2 mb-2">
                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-semibold">
                                    {user?.username?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-900 text-sm">{user?.username}</p>
                                    <p className="text-xs text-slate-500">{user?.role}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => { logout(); closeMobileMenu(); }}
                                className="flex items-center justify-center gap-2 w-full py-2.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl text-sm font-medium transition-colors"
                            >
                                <LogOut size={16} />
                                Sign out
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="md:ml-20 lg:ml-64 min-h-screen">
                <div className="max-w-6xl mx-auto px-4 lg:px-8 py-6 pt-20 md:pt-8 pb-24 md:pb-8">
                    <Outlet />
                </div>
            </main>

            {/* Mobile Bottom Nav */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200 safe-area-bottom">
                <div className="flex items-center justify-around py-2">
                    <NavLink to="/" className={({ isActive }) => `p-3 rounded-xl ${isActive ? 'text-slate-900 bg-slate-100' : 'text-slate-400'}`}>
                        <Home size={24} />
                    </NavLink>
                    <NavLink to="/explore" className={({ isActive }) => `p-3 rounded-xl ${isActive ? 'text-slate-900 bg-slate-100' : 'text-slate-400'}`}>
                        <Compass size={24} />
                    </NavLink>
                    <NavLink
                        to="/create"
                        className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center -mt-4 shadow-lg"
                    >
                        <Plus size={24} />
                    </NavLink>
                    <NavLink to="/bookmarks" className={({ isActive }) => `p-3 rounded-xl ${isActive ? 'text-slate-900 bg-slate-100' : 'text-slate-400'}`}>
                        <Bookmark size={24} />
                    </NavLink>
                    <NavLink to="/profile" className={({ isActive }) => `p-3 rounded-xl ${isActive ? 'text-slate-900 bg-slate-100' : 'text-slate-400'}`}>
                        <User size={24} />
                    </NavLink>
                </div>
            </nav>
        </div>
    );
};

export default MainLayout;
