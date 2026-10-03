import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  BookOpen, 
  Users, 
  LayoutDashboard, 
  LogOut,
  Settings,
  Library,
  BookDown,
  DollarSign,
  UserCheck,
  ChevronDown,
  Plus
} from 'lucide-react';

const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const displayName = user?.name || 'Administrator';
  const displayRole = user?.role === 'admin' ? 'Super Administrator' : 'Library Staff';
  const avatarColor = user?.avatarColor || 'from-indigo-600 via-purple-600 to-violet-700';
  
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0])
    .join('')
    .toUpperCase() || 'AD';

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={19} /> },
    { name: 'Books Catalog', path: '/admin/books', icon: <Library size={19} /> },
    { name: 'Categories', path: '/admin/categories', icon: <BookOpen size={19} /> },
    { name: 'Members', path: '/admin/members', icon: <Users size={19} /> },
    { name: 'Transactions', path: '/admin/transactions', icon: <BookDown size={19} /> },
    { name: 'Fines & Dues', path: '/admin/fines', icon: <DollarSign size={19} /> },
  ];

  const getPageTitle = () => {
    if (location.pathname.startsWith('/admin/profile')) return 'My Profile';
    if (location.pathname.startsWith('/admin/settings')) return 'System Settings';
    if (location.pathname.startsWith('/admin/books/new')) return 'Add New Book';
    if (location.pathname.includes('/edit')) return 'Edit Book';
    const match = navItems.find(i => location.pathname.startsWith(i.path));
    return match ? match.name : 'Dashboard';
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans antialiased">
      {/* Sleek Dark Sidebar */}
      <aside className="w-68 bg-slate-950 text-slate-100 flex flex-col border-r border-slate-800/80 shrink-0 select-none">
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
          <Link to="/admin/dashboard" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <BookOpen size={22} className="text-white" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                BiblioHub
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-400/30">PRO</span>
              </span>
              <p className="text-[11px] text-slate-400 font-medium">Library Management</p>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Main Menu</p>
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <span className={isActive ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            );
          })}

          <div className="pt-4 mt-4 border-t border-slate-800/80">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Management</p>
            <Link
              to="/admin/profile"
              className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                location.pathname.startsWith('/admin/profile')
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <UserCheck size={19} className={location.pathname.startsWith('/admin/profile') ? 'text-white' : 'text-slate-400'} />
              <span>Admin Profile</span>
            </Link>

            <Link
              to="/admin/settings"
              className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                location.pathname.startsWith('/admin/settings')
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <Settings size={19} className={location.pathname.startsWith('/admin/settings') ? 'text-white' : 'text-slate-400'} />
              <span>Settings</span>
            </Link>
          </div>
        </div>

        {/* User Card in Sidebar (NO EMAIL SHOWN) */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/60">
          <Link
            to="/admin/profile"
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-800/70 transition-colors group cursor-pointer"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${avatarColor} flex items-center justify-center text-white font-bold text-sm shadow-md shrink-0`}>
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate group-hover:text-indigo-300 transition-colors">
                {displayName}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-[11px] text-slate-300 font-medium truncate">Online • Admin</span>
              </div>
            </div>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-8 flex items-center justify-between z-20 shrink-0 shadow-2xs">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {getPageTitle()}
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              System Operational
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin/transactions"
              className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors border border-indigo-200/60"
            >
              <Plus className="w-3.5 h-3.5" />
              Issue Book
            </Link>

            {/* Profile Dropdown (NO EMAIL) */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200 cursor-pointer"
              >
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${avatarColor} flex items-center justify-center text-white text-xs font-bold shadow-2xs`}>
                  {initials}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-semibold text-slate-800 leading-tight truncate max-w-[130px]">
                    {displayName}
                  </p>
                  <p className="text-[10px] text-slate-500 capitalize">{user?.role || 'Admin'}</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {profileDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setProfileDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-40 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-xs text-slate-400 font-medium">Signed in as</p>
                      <p className="text-sm font-bold text-slate-800 truncate">{displayName}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700">
                        {displayRole}
                      </span>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/admin/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                      >
                        <UserCheck className="w-4 h-4 text-slate-400" />
                        Admin Profile
                      </Link>
                      <Link
                        to="/admin/settings"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                      >
                        <Settings className="w-4 h-4 text-slate-400" />
                        System Settings
                      </Link>
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          logout();
                          navigate('/login');
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Body */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
