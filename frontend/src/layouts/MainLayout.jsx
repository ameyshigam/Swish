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
                const baseCollapsed = 'flex items-center justify-center p-3 rounded-lg transition-all duration-200 group relative';
                const baseExpanded = 'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden';
                // Active: Gradient vertical bar + subtle background
                const active = 'bg-primary/10 text-primary font-bold shadow-sm before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-6 before:bg-gradient-to-b before:from-primary before:to-purple-600 before:rounded-r-full';
                // Inactive: Smooth slide right on hover
                const inactive = 'text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:translate-x-1 transition-transform duration-200';
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
            <aside className="fixed left-0 top-0 h-screen w-64 hidden lg:flex flex-col bg-sidebar/80 backdrop-blur-xl border-r border-sidebar-border/50 z-20 overflow-y-auto custom-scrollbar">
                {/* Logo */}
                <div className="p-6 border-b border-sidebar-border/50">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-11 h-11 bg-gradient-to-br from-primary via-purple-600 to-pink-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary/30 group-hover:scale-105 transition-transform">S</div>
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
                        <Link to="/create" className="glow-button flex items-center justify-center gap-2 w-full py-3.5">
                            <Plus size={20} />
                            <span>Create Post</span>
                        </Link>
                        <Link to="/create-story" className="flex items-center justify-center gap-2 w-full py-3.5 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 text-white rounded-xl font-semibold hover:opacity-90 transition-all shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40">
                            <Camera size={20} />
                            <span>Add Story</span>
                        </Link>
                    </div>
                )}

                {/* User Section */}
                <div className="p-4 border-t border-sidebar-border/50">
                    <div className="flex items-center justify-between mb-3">
                        <Link to="/profile" className="flex items-center gap-3 p-2 rounded-xl hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground transition-colors flex-1">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex-shrink-0 overflow-hidden shadow-md">
                                {user?.profileData?.avatarUrl ? (
                                    <img src={getServerUrl(user.profileData.avatarUrl)} alt="Me" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-white font-semibold text-sm">
                                        {user?.username?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sidebar-foreground truncate text-sm">{user?.username}</p>
                                <p className="text-xs text-muted-foreground truncate capitalize">{user?.role}</p>
                            </div>
                        </Link>
                        <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50 rounded-xl transition-all">
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                    </div>
                    <button onClick={logout} className="flex items-center gap-2 w-full px-4 py-2.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl text-sm font-medium transition-colors">
                        <LogOut size={16} />
                        Sign out
                    </button>
                </div>
            </aside>

            {/* Tablet Sidebar */}
            <aside className="fixed left-0 top-0 h-screen w-20 hidden md:flex lg:hidden flex-col bg-sidebar/80 backdrop-blur-xl border-r border-sidebar-border/50 z-20">
                <div className="p-4 flex justify-center border-b border-sidebar-border/50">
                    <Link to="/" className="w-11 h-11 bg-gradient-to-br from-primary via-purple-600 to-pink-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-primary/30">S</Link>
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
                    <Link to="/create" className="w-12 h-12 bg-sidebar-primary text-sidebar-primary-foreground rounded-xl flex items-center justify-center">
                        <Plus size={22} />
                    </Link>
                    <button onClick={logout} className="p-3 text-muted-foreground hover:text-destructive rounded-xl transition-colors"><LogOut size={20} /></button>
                </div>
            </aside>

            {/* Mobile/Tablet Header - Visible below LG screens */}
            <header className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-card/95 backdrop-blur-lg border-b border-border shadow-sm">
                <div className="flex items-center justify-between px-4 py-3">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-sm">S</div>
                        <span className="text-lg font-bold text-foreground">Swish</span>
                    </Link>

                    <div className="flex items-center gap-2">
                        <NavLink to="/messages" className="p-2 text-muted-foreground"><MessageCircle size={22} /></NavLink>
                        <NavLink to="/notifications" className="relative p-2 text-muted-foreground">
                            <Bell size={22} />
                            {unreadNotifications > 0 && (
                                <span className="absolute top-1 right-1 bg-destructive text-destructive-foreground text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{unreadNotifications > 9 ? '9+' : unreadNotifications}</span>
                            )}
                        </NavLink>
                        <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 text-muted-foreground">
                            {theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}
                        </button>
                        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-muted-foreground"><Menu size={22} /></button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={closeMobileMenu}>
                    <div className="absolute right-0 top-0 h-full w-72 bg-background shadow-2xl animate-slide-in" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center p-4 border-b border-border">
                            <span className="text-lg font-bold text-foreground">Menu</span>
                            <button onClick={closeMobileMenu} className="p-2 hover:bg-muted rounded-lg text-muted-foreground"><X size={20} /></button>
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

                        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-background">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3 p-2">
                                    <div className="w-10 h-10 rounded-full bg-muted flex-shrink-0 overflow-hidden">
                                        {user?.profileData?.avatarUrl ? (
                                            <img src={getServerUrl(user.profileData.avatarUrl)} alt="Me" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-muted-foreground font-semibold">
                                                {user?.username?.[0]?.toUpperCase() || 'U'}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-foreground text-sm">{user?.username}</p>
                                        <p className="text-xs text-muted-foreground">{user?.role}</p>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => { logout(); closeMobileMenu(); }} className="flex items-center justify-center gap-2 w-full py-2.5 text-destructive bg-destructive/10 hover:bg-destructive/20 rounded-xl text-sm font-medium transition-colors">
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
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-card/95 backdrop-blur-lg border-t border-border shadow-lg safe-area-bottom">
                <div className="flex items-center justify-around py-2">
                    <NavLink to="/" className={({ isActive }) => `p-3 rounded-xl transition-all ${isActive ? 'text-white bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-cyan-500/30' : 'text-muted-foreground hover:text-foreground'}`}>
                        <Home size={24} />
                    </NavLink>
                    <NavLink to="/explore" className={({ isActive }) => `p-3 rounded-xl transition-all ${isActive ? 'text-white bg-gradient-to-br from-violet-500 to-purple-500 shadow-lg shadow-purple-500/30' : 'text-muted-foreground hover:text-foreground'}`}>
                        <Compass size={24} />
                    </NavLink>
                    <NavLink to="/create" className="w-12 h-12 bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 text-white rounded-xl flex items-center justify-center -mt-4 shadow-lg shadow-pink-500/40 hover:scale-105 transition-transform">
                        <Plus size={24} />
                    </NavLink>
                    <NavLink to="/bookmarks" className={({ isActive }) => `p-3 rounded-xl transition-all ${isActive ? 'text-white bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-orange-500/30' : 'text-muted-foreground hover:text-foreground'}`}>
                        <Bookmark size={24} />
                    </NavLink>
                    <NavLink to="/profile" className={({ isActive }) => `p-3 rounded-xl transition-all ${isActive ? 'text-white bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-teal-500/30' : 'text-muted-foreground hover:text-foreground'}`}>
                        <User size={24} />
                    </NavLink>
                </div>
            </nav>
        </div>
    );
};

export default MainLayout;