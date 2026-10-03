import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Users, 
  BookDown, 
  DollarSign, 
  ArrowRight, 
  PlusCircle, 
  UserPlus, 
  ShieldCheck,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import api from '../../services/api';
import { bookService } from '../../services/api/books';
import { transactionService } from '../../services/api/transactions';
import type { BorrowTransaction } from '../../services/api/transactions';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalBooks: 0,
    activeMembers: 0,
    activeBorrows: 0,
    unpaidFines: 0
  });
  const [recentTransactions, setRecentTransactions] = useState<BorrowTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const displayName = user?.name || 'Administrator';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      const [booksRes, membersRes, transactionsRes, finesRes] = await Promise.all([
        bookService.getBooks({ page_size: 1 }),
        api.get('/members', { params: { page_size: 1 } }),
        transactionService.getTransactions({ limit: 10 }),
        transactionService.getFines()
      ]);

      const activeBorrows = transactionsRes.filter(t => t.status === 'issued').length;
      const unpaidFines = finesRes.filter(f => f.status === 'unpaid').reduce((sum, f) => sum + f.amount, 0);

      setStats({
        totalBooks: booksRes.total,
        activeMembers: membersRes.data.total,
        activeBorrows,
        unpaidFines
      });

      setRecentTransactions(transactionsRes.slice(0, 5));
    } catch (error) {
      console.error('Failed to load dashboard stats', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    { 
      name: 'Total Catalog Books', 
      value: stats.totalBooks, 
      icon: BookOpen, 
      gradient: 'from-blue-600 to-indigo-600',
      shadow: 'shadow-blue-500/20',
      link: '/admin/books',
      tag: 'Cataloged'
    },
    { 
      name: 'Registered Members', 
      value: stats.activeMembers, 
      icon: Users, 
      gradient: 'from-emerald-600 to-teal-600',
      shadow: 'shadow-emerald-500/20',
      link: '/admin/members',
      tag: 'Students'
    },
    { 
      name: 'Active Borrows', 
      value: stats.activeBorrows, 
      icon: BookDown, 
      gradient: 'from-violet-600 to-purple-600',
      shadow: 'shadow-violet-500/20',
      link: '/admin/transactions',
      tag: 'In Circulation'
    },
    { 
      name: 'Unpaid Overdue Fines', 
      value: `$${stats.unpaidFines.toFixed(2)}`, 
      icon: DollarSign, 
      gradient: 'from-rose-500 to-red-600',
      shadow: 'shadow-rose-500/20',
      link: '/admin/fines',
      tag: 'Pending'
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 sm:p-10 border border-slate-800 shadow-xl text-white">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                BiblioHub Management System
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Welcome back, {displayName}
            </h1>
            <p className="text-slate-300 text-sm max-w-xl">
              Circulation desks, catalog records, and member privileges are running normally.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/admin/transactions"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/30 transition-all hover:scale-102 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              Issue Book
            </Link>
            <Link
              to="/admin/profile"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 font-semibold text-sm border border-slate-700 transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              Admin Profile
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card) => (
          <Link
            key={card.name}
            to={card.link}
            className="group bg-white p-6 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md hover:border-slate-200 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{card.tag}</span>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{card.value}</p>
                <p className="text-xs text-slate-600 font-medium">{card.name}</p>
              </div>
              <div className={`p-3 rounded-2xl bg-gradient-to-tr ${card.gradient} text-white shadow-md ${card.shadow} group-hover:scale-110 transition-transform`}>
                <card.icon className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-indigo-600 font-semibold group-hover:translate-x-0.5 transition-transform">
              <span>View details</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Action Dock */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { title: 'Catalog New Book', icon: PlusCircle, link: '/admin/books/new', color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
          { title: 'Register Member', icon: UserPlus, link: '/admin/members', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
          { title: 'Circulation Desk', icon: BookDown, link: '/admin/transactions', color: 'text-violet-600 bg-violet-50 border-violet-100' },
          { title: 'Collect Overdues', icon: DollarSign, link: '/admin/fines', color: 'text-rose-600 bg-rose-50 border-rose-100' },
        ].map((item, idx) => (
          <Link
            key={idx}
            to={item.link}
            className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100 shadow-2xs hover:shadow-sm hover:border-slate-200 transition-all cursor-pointer group"
          >
            <div className={`p-2.5 rounded-xl border ${item.color} group-hover:scale-105 transition-transform`}>
              <item.icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">{item.title}</p>
              <p className="text-[11px] text-slate-400">Quick action</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Bottom Section: Recent Circulation Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Transactions List */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recent Circulation Activity</h2>
              <p className="text-xs text-slate-500 mt-0.5">Real-time book issues and returns by registered students</p>
            </div>
            <Link
              to="/admin/transactions"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              View all
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 font-bold text-xs">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {tx.book?.title || 'Unknown Title'}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      Borrower: <span className="font-medium text-slate-700">{tx.member?.name}</span> • <span className="font-mono text-[11px]">ID: {tx.member?.student_id}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[11px] text-slate-400 hidden sm:inline">
                    Due: {tx.due_date}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    tx.status === 'returned'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {tx.status === 'returned' ? 'Returned' : 'Issued'}
                  </span>
                </div>
              </div>
            ))}

            {recentTransactions.length === 0 && (
              <div className="py-8 text-center text-slate-400 text-xs">
                No circulation records found yet.
              </div>
            )}
          </div>
        </div>

        {/* Administration Info Widget */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-slate-900">Institution & Policies</h3>
            <p className="text-xs text-slate-500 mt-0.5">Quick active circulation rules</p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100/80">
              <span className="text-slate-600 font-medium">Standard Loan Duration</span>
              <span className="font-bold text-slate-900">14 Days</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100/80">
              <span className="text-slate-600 font-medium">Max Limit per Member</span>
              <span className="font-bold text-slate-900">5 Books</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100/80">
              <span className="text-slate-600 font-medium">Default Fine Rate</span>
              <span className="font-bold text-slate-900">$5.00 / day</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100/80">
              <span className="text-slate-600 font-medium">Clearance Level</span>
              <span className="font-bold text-indigo-700">Root Administrator</span>
            </div>
          </div>

          <div className="pt-2">
            <Link
              to="/admin/settings"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs transition-colors"
            >
              Configure Policies & Settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
