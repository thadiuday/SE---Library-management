import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  BookOpen, 
  Users, 
  LayoutDashboard, 
  LogOut,
  Settings,
  Library,
  BookDown,
  DollarSign
} from 'lucide-react';

const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Books', path: '/admin/books', icon: <Library size={20} /> },
    { name: 'Categories', path: '/admin/categories', icon: <BookOpen size={20} /> },
    { name: 'Members', path: '/admin/members', icon: <Users size={20} /> },
    { name: 'Transactions', path: '/admin/transactions', icon: <BookDown size={20} /> },
    { name: 'Fines', path: '/admin/fines', icon: <DollarSign size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-indigo-800 text-white flex flex-col">
        <div className="p-6 flex items-center space-x-3">
          <BookOpen size={28} className="text-indigo-300" />
          <span className="text-xl font-bold tracking-wider">LMS Admin</span>
        </div>
        
        <div className="px-6 py-4 border-t border-indigo-700">
          <p className="text-sm text-indigo-300">Welcome,</p>
          <p className="font-medium truncate">{user?.email}</p>
        </div>

        <nav className="flex-1 mt-6 px-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                location.pathname.startsWith(item.path)
                  ? 'bg-indigo-900 text-white shadow-sm'
                  : 'text-indigo-200 hover:bg-indigo-700 hover:text-white'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-indigo-700 space-y-2">
          <Link
            to="/admin/settings"
            className={`flex items-center space-x-3 px-4 py-2 w-full text-left rounded-lg transition-colors ${
              location.pathname.startsWith('/admin/settings')
                ? 'bg-indigo-900 text-white shadow-sm'
                : 'text-indigo-200 hover:bg-indigo-700 hover:text-white'
            }`}
          >
            <Settings size={20} />
            <span className="font-medium">Settings</span>
          </Link>
          <button 
            onClick={logout}
            className="flex items-center space-x-3 px-4 py-2 w-full text-left text-red-300 hover:bg-red-500 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-8">
          <h1 className="text-2xl font-semibold text-gray-800">
            {location.pathname.startsWith('/admin/settings')
              ? 'Settings'
              : navItems.find(i => location.pathname.startsWith(i.path))?.name || 'Dashboard'}
          </h1>
        </header>
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
