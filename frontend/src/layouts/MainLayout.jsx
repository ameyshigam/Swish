import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { Home, Compass, Plus, User, Shield, Bell, Bookmark, Megaphone, MessageCircle, LogOut, Menu, X, LayoutDashboard, Users, GraduationCap, ShieldAlert, Camera, ArrowRight, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import { getServerUrl } from '../utils/url';

// NavItem: supports expanded and collapsed sidebar variants and exact matching for root/admin
const NavItem = ({ to, icon: IconComponent, label, badge = 0, onClick, collapsed }) => {
    return (
        <NavLink
            to={to}
            onClick={onClick}
            end={to === '/' || to === '/admin'}
            className={({ isActive }) => {
                const baseCollapsed = 'flex items-center justify-center p-3 rounded-xl transition-all duration-300 group relative';
                const baseExpanded = 'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden';
                // Active: Gradient background with glow
                const active = 'bg-gradient-to-r from-violet-600/20 via-fuchsia-500/20 to-pink-500/20 text-foreground font-semibold border border-violet-500/30';
                // Inactive: Smooth transition on hover
                const inactive = 'text-muted-foreground hover:text-foreground hover:bg-muted/50';
                return `${collapsed ? baseCollapsed : baseExpanded} ${isActive ? active : inactive}`;
            }}
        >
            {({ isActive }) => (
                <>
                    {/* Active indicator bar */}
                    {isActive && !collapsed && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-violet-500 via-fuchsia-500 to-pink-500 rounded-r-full"></div>
                    )}
                    <div className={`flex items-center justify-center ${isActive ? 'text-violet-500' : ''}`}>
                        <IconComponent size={20} strokeWidth={2} />
                    </div>
                    {!collapsed && <span className="font-medium">{label}</span>}
                    {badge > 0 && (
                        <span className={`${collapsed ? 'absolute -top-1 -right-1' : 'ml-auto'} bg-gradient-to-r from-red-500 to-pink-500 text-white text-[11px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-lg shadow-red-500/30`}>
                            {badge > 99 ? '99+' : badge}
                        </span>
                    )}
                </>
            )}
        </NavLink>
    );
};

const MainLayout = () => {
    const { logout, user } = useAuth();
    const { theme, setTheme } = useTheme();
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
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
            {/* Desktop Sidebar */}
            {/* Desktop Sidebar - Visible only on LG screens and up */}
            <aside className="fixed left-0 top-0 h-screen w-64 hidden lg:flex flex-col bg-sidebar/80 backdrop-blur-xl z-20 overflow-y-auto custom-scrollbar border-r border-sidebar-border/30">
                {/* Logo */}
                <div className="p-6 border-b border-sidebar-border/30">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-12 h-12 bg-gradient-to-br from-violet-600 via-fuchsia-500 to-pink-500 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-fuchsia-500/30 group-hover:scale-105 group-hover:shadow-fuchsia-500/50 transition-all duration-300">S</div>
                        <span className="text-xl font-bold text-sidebar-foreground tracking-tight">Swish</span>
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
                    <div className="p-4 border-t border-sidebar-border/30 space-y-3">
                        <Link to="/create" className="flex items-center justify-center gap-2 w-full py-3.5 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 text-white rounded-xl font-semibold hover:opacity-90 hover:scale-[1.02] transition-all shadow-lg shadow-fuchsia-500/30">
                            <Plus size={20} />
                            <span>Create Post</span>
                        </Link>
                        <Link to="/create-story" className="flex items-center justify-center gap-2 w-full py-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white rounded-xl font-semibold hover:opacity-90 hover:scale-[1.02] transition-all shadow-lg shadow-orange-500/30">
                            <Camera size={20} />
                            <span>Add Story</span>
                        </Link>
                    </div>
                )}

                {/* User Section */}
                <div className="p-4 border-t border-sidebar-border/30">
                    <div className="flex items-center justify-between mb-3 p-2 rounded-xl bg-gradient-to-r from-violet-500/5 via-fuchsia-500/5 to-pink-500/5 border border-sidebar-border/20">
                        <Link to="/profile" className="flex items-center gap-3 flex-1 hover:opacity-80 transition-opacity">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 p-[2px] flex-shrink-0 shadow-md shadow-fuchsia-500/20">
                                <div className="w-full h-full rounded-[10px] bg-sidebar overflow-hidden flex items-center justify-center">
                                    {user?.profileData?.avatarUrl ? (
                                        <img src={getServerUrl(user.profileData.avatarUrl)} alt="Me" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-foreground font-semibold text-sm">
                                            {user?.username?.[0]?.toUpperCase() || 'U'}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sidebar-foreground truncate text-sm">{user?.username}</p>
                                <p className="text-xs text-muted-foreground truncate capitalize">{user?.role}</p>
                            </div>
                        </Link>
                        <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50 rounded-xl transition-all">
                            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                    </div>
                    <button onClick={logout} className="flex items-center gap-2 w-full px-4 py-2.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-xl text-sm font-medium transition-all">
                        <LogOut size={16} />
                        Sign out
                    </button>
                </div>
            </aside>

            {/* Tablet Sidebar */}
            <aside className="fixed left-0 top-0 h-screen w-20 hidden md:flex lg:hidden flex-col bg-sidebar/80 backdrop-blur-xl border-r border-sidebar-border/30 z-20">
                <div className="p-4 flex justify-center border-b border-sidebar-border/30">
                    <Link to="/" className="w-12 h-12 bg-gradient-to-br from-violet-600 via-fuchsia-500 to-pink-500 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg shadow-fuchsia-500/30 hover:scale-105 transition-transform">S</Link>
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

                <div className="p-3 border-t border-sidebar-border/30 flex flex-col items-center gap-2">
                    <Link to="/create" className="w-12 h-12 bg-gradient-to-br from-violet-600 via-fuchsia-500 to-pink-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-fuchsia-500/30 hover:scale-105 transition-transform">
                        <Plus size={22} />
                    </Link>
                    <button onClick={logout} className="p-3 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"><LogOut size={20} /></button>
                </div>
            </aside>

            {/* Mobile/Tablet Header - Visible below LG screens */}
            <header className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-sm">
                <div className="flex items-center justify-between px-4 py-3">
                    <Link to="/" className="flex items-center gap-2.5">
                        <div className="w-9 h-9 bg-gradient-to-br from-violet-600 via-fuchsia-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-fuchsia-500/30">S</div>
                        <span className="text-lg font-bold text-foreground">Swish</span>
                    </Link>

                    <div className="flex items-center gap-1">
                        <NavLink to="/messages" className={({ isActive }) => `p-2.5 rounded-xl transition-all ${isActive ? 'text-violet-500 bg-violet-500/10' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}>
                            <MessageCircle size={22} />
                        </NavLink>
                        <NavLink to="/notifications" className={({ isActive }) => `relative p-2.5 rounded-xl transition-all ${isActive ? 'text-violet-500 bg-violet-500/10' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}>
                            <Bell size={22} />
                            {unreadNotifications > 0 && (
                                <span className="absolute top-1 right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-lg shadow-red-500/30">{unreadNotifications > 9 ? '9+' : unreadNotifications}</span>
                            )}
                        </NavLink>
                        <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-all">
                            {theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}
                        </button>
                        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-all"><Menu size={22} /></button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={closeMobileMenu}>
                    <div className="absolute right-0 top-0 h-full w-80 bg-background/95 backdrop-blur-xl shadow-2xl animate-slide-in border-l border-border/30" onClick={e => e.stopPropagation()}>
                        {/* Header */}
                        <div className="flex justify-between items-center p-4 border-b border-border/30">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 bg-gradient-to-br from-violet-600 via-fuchsia-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md">S</div>
                                <span className="text-lg font-bold text-foreground">Menu</span>
                            </div>
                            <button onClick={closeMobileMenu} className="p-2 hover:bg-muted/50 rounded-xl text-muted-foreground transition-colors"><X size={20} /></button>
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

                        {/* User Section */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border/30 bg-background/80 backdrop-blur-xl">
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-violet-500/5 via-fuchsia-500/5 to-pink-500/5 border border-border/20 mb-3">
                                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 p-[2px] flex-shrink-0 shadow-md shadow-fuchsia-500/20">
                                    <div className="w-full h-full rounded-[9px] bg-background overflow-hidden flex items-center justify-center">
                                        {user?.profileData?.avatarUrl ? (
                                            <img src={getServerUrl(user.profileData.avatarUrl)} alt="Me" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-foreground font-semibold">
                                                {user?.username?.[0]?.toUpperCase() || 'U'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <p className="font-semibold text-foreground text-sm">{user?.username}</p>
                                    <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
                                </div>
                            </div>
                            <button onClick={() => { logout(); closeMobileMenu(); }} className="flex items-center justify-center gap-2 w-full py-3 text-red-500 bg-red-500/10 hover:bg-red-500/20 rounded-xl text-sm font-semibold transition-all">
                                <LogOut size={16} />
                                Sign out
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="lg:ml-64 min-h-screen bg-background">
                <div className="w-full px-4 lg:px-8 py-6 pt-20 md:pt-8 pb-24 md:pb-8">
                    <Outlet />
                </div>
            </main>

            {/* Mobile/Tablet Bottom Nav - Visible below LG screens */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-background/80 backdrop-blur-xl border-t border-border/30 shadow-lg safe-area-bottom">
                <div className="flex items-center justify-around py-2 px-2">
                    <NavLink to="/" end className={({ isActive }) => `p-3 rounded-xl transition-all duration-300 ${isActive ? 'text-white bg-gradient-to-br from-violet-600 via-fuchsia-500 to-pink-500 shadow-lg shadow-fuchsia-500/30' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}>
                        <Home size={22} />
                    </NavLink>
                    <NavLink to="/explore" className={({ isActive }) => `p-3 rounded-xl transition-all duration-300 ${isActive ? 'text-white bg-gradient-to-br from-violet-600 via-fuchsia-500 to-pink-500 shadow-lg shadow-fuchsia-500/30' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}>
                        <Compass size={22} />
                    </NavLink>
                    <NavLink to="/create" className="w-14 h-14 bg-gradient-to-br from-violet-600 via-fuchsia-500 to-pink-500 text-white rounded-2xl flex items-center justify-center -mt-6 shadow-xl shadow-fuchsia-500/40 hover:scale-110 active:scale-95 transition-transform ring-4 ring-background">
                        <Plus size={26} />
                    </NavLink>
                    <NavLink to="/bookmarks" className={({ isActive }) => `p-3 rounded-xl transition-all duration-300 ${isActive ? 'text-white bg-gradient-to-br from-violet-600 via-fuchsia-500 to-pink-500 shadow-lg shadow-fuchsia-500/30' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}>
                        <Bookmark size={22} />
                    </NavLink>
                    <NavLink to="/profile" className={({ isActive }) => `p-3 rounded-xl transition-all duration-300 ${isActive ? 'text-white bg-gradient-to-br from-violet-600 via-fuchsia-500 to-pink-500 shadow-lg shadow-fuchsia-500/30' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}>
                        <User size={22} />
                    </NavLink>
                </div>
            </nav>
        </div>
    );
};

export default MainLayout;