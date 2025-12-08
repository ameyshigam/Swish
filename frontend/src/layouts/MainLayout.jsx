import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Home, Compass, PlusSquare, User, LogOut, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SidebarItem = ({ to, icon: Icon, label }) => (
    <NavLink
        to={to}
        className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                : 'text-slate-500 hover:bg-white/50 hover:text-slate-900 hover:shadow-sm'
            }`
        }
    >
        <Icon size={20} className="group-hover:scale-110 transition-transform duration-200" />
        <span className="font-medium">{label}</span>
    </NavLink>
);

const MainLayout = () => {
    const { logout, user } = useAuth();

    return (
        <div className="flex min-h-screen bg-slate-50/50">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 h-screen w-64 glass border-r border-white/20 hidden md:flex flex-col p-6 z-10 transition-all duration-300">
                <div className="mb-10 flex items-center gap-3 px-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20">S</div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700 tracking-tight">Swish</h1>
                </div>

                <nav className="flex-1 space-y-2">
                    <SidebarItem to="/" icon={Home} label="Feed" />
                    <SidebarItem to="/explore" icon={Compass} label="Explore" />
                    <SidebarItem to="/create" icon={PlusSquare} label="Create Post" />
                    <SidebarItem to="/profile" icon={User} label="Profile" />
                    {user?.role === 'Admin' && (
                        <SidebarItem to="/admin" icon={Shield} label="Admin" />
                    )}
                </nav>

                <div className="pt-6 border-t border-slate-100/50">
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-500 hover:bg-red-50/50 rounded-xl w-full transition-all duration-200 group"
                    >
                        <LogOut size={20} className="group-hover:scale-110 transition-transform" />
                        <span className="font-medium">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Header (Visible only on small screens) */}
            <div className="md:hidden fixed top-0 w-full glass z-20 border-b border-slate-200/50 px-4 py-3 flex justify-between items-center bg-white/80">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">S</div>
                    <span className="font-bold text-xl text-slate-800">Swish</span>
                </div>
                {/* Mobile Menu Toggle would go here */}
            </div>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 min-h-screen">
                <div className="max-w-2xl mx-auto">
                    <Outlet />
                </div>
            </main>

            {/* Mobile Bottom Nav */}
            <nav className="md:hidden fixed bottom-0 w-full glass border-t border-slate-200/50 flex justify-around p-3 z-20 safe-area-bottom pb-5">
                <NavLink to="/" className={({ isActive }) => isActive ? 'text-blue-600 scale-110 transition-transform' : 'text-slate-400 hover:text-slate-600'}><Home size={26} /></NavLink>
                <NavLink to="/explore" className={({ isActive }) => isActive ? 'text-blue-600 scale-110 transition-transform' : 'text-slate-400 hover:text-slate-600'}><Compass size={26} /></NavLink>
                <NavLink to="/create" className={({ isActive }) => isActive ? 'text-blue-600 scale-110 transition-transform' : 'text-slate-400 hover:text-slate-600'}><PlusSquare size={26} /></NavLink>
                <NavLink to="/profile" className={({ isActive }) => isActive ? 'text-blue-600 scale-110 transition-transform' : 'text-slate-400 hover:text-slate-600'}><User size={26} /></NavLink>
            </nav>
        </div>
    );
};

export default MainLayout;
