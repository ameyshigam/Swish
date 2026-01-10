import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { Home, Compass, Plus, User, Shield, Bell, Bookmark, Megaphone, MessageCircle, LogOut, Menu, X, LayoutDashboard, Users, GraduationCap, ShieldAlert, Camera, ArrowRight, Sun } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

// NavItem: supports expanded and collapsed sidebar variants and exact matching for root/admin
const NavItem = ({ to, icon: IconComponent, label, badge = 0, onClick, collapsed }) => {
    return (
        <NavLink
            to={to}
            onClick={onClick}
            end={to === '/' || to === '/admin'}
            className={({ isActive }) => {
                const baseCollapsed = 'flex items-center justify-center p-3 rounded-lg transition-all duration-200 group relative';
                const baseExpanded = 'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative';
                const active = 'bg-white text-black font-semibold';
                const inactive = 'text-slate-400 hover:text-white hover:bg-[#0b1720]';
                return `${collapsed ? baseCollapsed : baseExpanded} ${isActive ? active : inactive}`;
            }}
        >
            <IconComponent size={20} strokeWidth={2} />
            {!collapsed && <span className="font-medium">{label}</span>}
            {badge > 0 && (
                <span className={`${collapsed ? 'absolute -top-1 -right-1' : 'ml-auto'} bg-red-500 text-white text-[11px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center`}>
                    {badge > 99 ? '99+' : badge}
                </span>
            )}
        </NavLink>
    );
};

const MainLayout = () => {
    const { logout, user } = useAuth();
    const [unreadNotifications, setUnreadNotifications] = useState(0);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        let mounted = true;

        const fetchUnreadCount = async () => {
            try {
                const res = await axios.get('/notifications/unread-count');
                if (mounted) setUnreadNotifications(res.data.count || 0);
            } catch (error) {
                console.error('Failed to fetch notification count', error);
            }
        };

        fetchUnreadCount();

        const handleNotificationsRead = () => setUnreadNotifications(0);
        window.addEventListener('notificationsRead', handleNotificationsRead);

        const interval = setInterval(fetchUnreadCount, 30000);
        return () => {
            mounted = false;
            clearInterval(interval);
            window.removeEventListener('notificationsRead', handleNotificationsRead);
        };
    }, []);

    const closeMobileMenu = () => setMobileMenuOpen(false);

    return (
        <div className="min-h-screen bg-[#03060a] text-white transition-colors">
            {/* Desktop Sidebar */}
                <aside className="fixed left-0 top-0 h-screen w-64 hidden lg:flex flex-col bg-[#03060a] border-r border-transparent z-20 overflow-y-auto custom-scrollbar">
                {/* Logo */}
                    <div className="p-6 border-b border-transparent">
                    <Link to="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-bold text-lg">S</div>
                        <span className="text-xl font-bold text-white tracking-tight">Swish</span>
                    </Link>
                </div>

                {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1">
                    {user?.role === 'Admin' ? (
                        <>
                            <NavItem to="/admin" icon={LayoutDashboard} label="Dashboard" collapsed={false} />
                            <NavItem to="/admin/students" icon={Users} label="Students" collapsed={false} />
                            <NavItem to="/admin/faculties" icon={GraduationCap} label="Faculties" collapsed={false} />
                            <NavItem to="/admin/reports" icon={ShieldAlert} label="Reports" collapsed={false} />
                            <NavItem to="/announcements" icon={Megaphone} label="Announcements" collapsed={false} />
                            <NavItem to="/profile" icon={User} label="My Profile" collapsed={false} />
                        </>
                    ) : (
                        <>
                            <NavItem to="/" icon={Home} label="Home" collapsed={false} />
                            <NavItem to="/explore" icon={Compass} label="Explore" collapsed={false} />
                            <NavItem to="/messages" icon={MessageCircle} label="Messages" collapsed={false} />
                            <NavItem to="/notifications" icon={Bell} label="Notifications" badge={unreadNotifications} collapsed={false} />
                            <NavItem to="/announcements" icon={Megaphone} label="Announcements" collapsed={false} />
                            <NavItem to="/bookmarks" icon={Bookmark} label="Saved" collapsed={false} />
                            <NavItem to="/profile" icon={User} label="Profile" collapsed={false} />
                        </>
                    )}
                </nav>

                {/* Create Post Button - Only for Non-Admins */}
                    {user?.role !== 'Admin' && (
                        <div className="p-4 border-t border-transparent space-y-3">
                            <Link to="/create" className="flex items-center justify-center gap-2 w-full py-3 bg-white text-black rounded-xl font-medium hover:bg-slate-100 transition-colors">
                                <Plus size={20} />
                                <span>Create Post</span>
                            </Link>
                            <Link to="/create-story" className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-tr from-orange-400 to-pink-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity">
                                <Camera size={20} />
                                <span>Add Story</span>
                            </Link>
                        </div>
                    )}

                {/* User Section */}
                    <div className="p-4 border-t border-transparent">
                    <div className="flex items-center justify-between mb-3">
                        <Link to="/profile" className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#0b1720] transition-colors flex-1">
                            <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white font-semibold text-sm">{user?.username?.[0]?.toUpperCase() || 'U'}</div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-white truncate text-sm">{user?.username}</p>
                                <p className="text-xs text-slate-400 truncate capitalize">{user?.role}</p>
                            </div>
                        </Link>
                        <button className="p-2 text-slate-400 hover:text-white transition-colors">
                            <Sun size={20} />
                        </button>
                    </div>
                    <Link onClick={(e) => { e.preventDefault(); logout(); }} className="flex items-center gap-2 w-full px-4 py-2.5 text-slate-400 hover:text-white rounded-xl text-sm font-medium transition-colors">
                        <ArrowRight size={16} />
                        Sign out
                    </Link>
                </div>
            </aside>

            {/* Tablet Sidebar */}
                <aside className="fixed left-0 top-0 h-screen w-20 hidden md:flex lg:hidden flex-col bg-[#03060a] border-r border-transparent z-20">
                    <div className="p-4 flex justify-center border-b border-slate-100/10">
                    <Link to="/" className="w-10 h-10 neo-avatar rounded-xl flex items-center justify-center text-white font-bold">S</Link>
                </div>

                <nav className="flex-1 p-3 space-y-2 flex flex-col items-center">
                    <NavItem to="/" icon={Home} collapsed />
                    <NavItem to="/explore" icon={Compass} collapsed />
                    <NavItem to="/messages" icon={MessageCircle} collapsed />
                    <NavItem to="/notifications" icon={Bell} badge={unreadNotifications} collapsed />
                    <NavItem to="/announcements" icon={Megaphone} collapsed />
                    <NavItem to="/bookmarks" icon={Bookmark} collapsed />
                    <NavItem to="/profile" icon={User} collapsed />
                    {user?.role === 'Admin' && <NavItem to="/admin" icon={Shield} collapsed />}
                </nav>

                    <div className="p-3 border-t border-transparent flex flex-col items-center gap-2">
                        <Link to="/create" className="w-12 h-12 glass neo-button neo-button-primary rounded-xl flex items-center justify-center">
                            <Plus size={22} />
                        </Link>
                        <button onClick={logout} className="p-3 text-slate-400 hover:text-red-500 rounded-xl transition-colors"><LogOut size={20} /></button>
                    </div>
            </aside>

            {/* Mobile Header */}
            <header className="md:hidden fixed top-0 left-0 right-0 z-30 bg-[#03060a] border-b border-transparent">
                    <div className="flex items-center justify-between px-4 py-3">
                        <Link to="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 glass rounded-lg flex items-center justify-center text-white font-bold text-sm">S</div>
                            <span className="text-lg font-bold text-[rgb(var(--color-text))]">Swish</span>
                        </Link>

                            <div className="flex items-center gap-2">
                            <NavLink to="/messages" className="p-2 text-slate-300"><MessageCircle size={22} /></NavLink>
                            <NavLink to="/notifications" className="relative p-2 text-slate-300">
                                <Bell size={22} />
                                {unreadNotifications > 0 && (
                                    <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{unreadNotifications > 9 ? '9+' : unreadNotifications}</span>
                                )}
                            </NavLink>
                            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-300"><Menu size={22} /></button>
                        </div>
                    </div>
            </header>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div className="md:hidden fixed inset-0 z-40 bg-black/40" onClick={closeMobileMenu}>
                        <div className="absolute right-0 top-0 h-full w-72 bg-[#0b1720] shadow-2xl animate-slide-in" onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between items-center p-4 border-b border-slate-100/10">
                                <span className="text-lg font-bold text-[rgb(var(--color-text))]">Menu</span>
                                <button onClick={closeMobileMenu} className="p-2 hover:bg-[#0b1720] rounded-lg"><X size={20} /></button>
                            </div>

                        <nav className="p-4 space-y-1">
                            <NavItem to="/" icon={Home} label="Home" onClick={closeMobileMenu} />
                            <NavItem to="/explore" icon={Compass} label="Explore" onClick={closeMobileMenu} />
                            <NavItem to="/messages" icon={MessageCircle} label="Messages" onClick={closeMobileMenu} />
                            <NavItem to="/create" icon={Plus} label="Create Post" onClick={closeMobileMenu} />
                            <NavItem to="/notifications" icon={Bell} label="Notifications" badge={unreadNotifications} onClick={closeMobileMenu} />
                            <NavItem to="/announcements" icon={Megaphone} label="Announcements" onClick={closeMobileMenu} />
                            <NavItem to="/bookmarks" icon={Bookmark} label="Saved" onClick={closeMobileMenu} />
                            <NavItem to="/profile" icon={User} label="Profile" onClick={closeMobileMenu} />
                            {user?.role === 'Admin' && (
                                <NavItem to="/admin" icon={Shield} label="Admin" onClick={closeMobileMenu} />
                            )}
                        </nav>

                            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-transparent bg-[#0b1720]">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3 p-2">
                                    <div className="w-10 h-10 rounded-full bg-[#0b1720] flex items-center justify-center text-slate-300 font-semibold">{user?.username?.[0]?.toUpperCase() || 'U'}</div>
                                    <div>
                                        <p className="font-semibold text-[rgb(var(--color-text))] text-sm">{user?.username}</p>
                                        <p className="text-xs text-[rgb(var(--color-text-secondary))]">{user?.role}</p>
                                    </div>
                                </div>
                            </div>
                                <button onClick={() => { logout(); closeMobileMenu(); }} className="flex items-center justify-center gap-2 w-full py-2.5 text-red-400 bg-red-900/10 hover:bg-red-900/20 rounded-xl text-sm font-medium transition-colors">
                                <LogOut size={16} />
                                Sign out
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="md:ml-20 lg:ml-64 min-h-screen bg-[#03060a]">
                    <div className="w-full px-4 lg:px-8 py-6 pt-20 md:pt-8 pb-24 md:pb-8">
                        <Outlet />
                    </div>
            </main>

            {/* Mobile Bottom Nav */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#03060a] border-t border-transparent safe-area-bottom">
                <div className="flex items-center justify-around py-2">
                        <NavLink to="/" className={({ isActive }) => `p-3 rounded-xl ${isActive ? 'text-[rgb(var(--color-text))] bg-[#0b1720]' : 'text-slate-300'}`}>
                        <Home size={24} />
                    </NavLink>
                        <NavLink to="/explore" className={({ isActive }) => `p-3 rounded-xl ${isActive ? 'text-[rgb(var(--color-text))] bg-[#0b1720]' : 'text-slate-300'}`}>
                        <Compass size={24} />
                    </NavLink>
                        <NavLink to="/create" className="w-12 h-12 bg-gradient-to-tr from-[#7c3aed] to-[#06b6d4] text-white rounded-xl flex items-center justify-center -mt-4 shadow-lg">
                        <Plus size={24} />
                    </NavLink>
                        <NavLink to="/bookmarks" className={({ isActive }) => `p-3 rounded-xl ${isActive ? 'text-[rgb(var(--color-text))] bg-[#0b1720]' : 'text-slate-300'}`}>
                        <Bookmark size={24} />
                    </NavLink>
                        <NavLink to="/profile" className={({ isActive }) => `p-3 rounded-xl ${isActive ? 'text-[rgb(var(--color-text))] bg-[#0b1720]' : 'text-slate-300'}`}>
                        <User size={24} />
                    </NavLink>
                </div>
            </nav>
        </div>
    );
};

export default MainLayout;