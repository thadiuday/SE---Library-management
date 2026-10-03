import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  BookDown, 
  Clock, 
  DollarSign, 
  Search, 
  AlertCircle, 
  CheckCircle2, 
  LogOut, 
  GraduationCap, 
  MapPin, 
  ShieldCheck, 
  KeyRound, 
  CreditCard, 
  BookMarked,
  ArrowRight,
  Eye,
  EyeOff,
  Info
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { transactionService } from '../../services/api/transactions';
import type { BorrowTransaction, Fine } from '../../services/api/transactions';
import { bookService } from '../../services/api/books';
import type { Book, Category } from '../../services/api/books';
import { memberService } from '../../services/api/members';
import type { Member } from '../../services/api/members';
import api from '../../services/api';
import { useNavigate } from 'react-router-dom';

const StudentDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'overview' | 'loans' | 'catalog' | 'fines' | 'card'>('overview');
  
  // Data State
  const [memberProfile, setMemberProfile] = useState<Member | null>(null);
  const [transactions, setTransactions] = useState<BorrowTransaction[]>([]);
  const [fines, setFines] = useState<Fine[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Password state
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      setIsLoading(true);
      const [profileData, txData, finesData, catsData, booksData] = await Promise.all([
        memberService.getMyProfile().catch(() => null),
        transactionService.getTransactions().catch(() => []),
        transactionService.getFines().catch(() => []),
        bookService.getCategories().catch(() => []),
        bookService.getBooks({ page_size: 20 }).catch(() => ({ items: [] }))
      ]);

      if (profileData) setMemberProfile(profileData);
      setTransactions(txData);
      setFines(finesData);
      setCategories(catsData);
      setBooks(booksData.items);
    } catch (err) {
      console.error('Failed to load student dashboard', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchCatalog = async () => {
    try {
      const res = await bookService.getBooks({
        search: catalogSearch,
        category_id: selectedCategory || undefined,
        available: availableOnly ? true : undefined,
        page_size: 30
      });
      setBooks(res.items);
    } catch (err) {
      console.error('Catalog search failed', err);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearchCatalog();
    }, 300);
    return () => clearTimeout(timer);
  }, [catalogSearch, selectedCategory, availableOnly]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return;
    }

    setPasswordLoading(true);
    try {
      await api.post('/auth/change-password', {
        old_password: passwordForm.oldPassword,
        new_password: passwordForm.newPassword
      });
      setPasswordMessage({ type: 'success', text: 'Password successfully changed!' });
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPasswordMessage(null), 4000);
    } catch (err: any) {
      setPasswordMessage({
        type: 'error',
        text: err.response?.data?.detail || 'Current password is incorrect.'
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const activeLoans = transactions.filter(t => t.status === 'issued');
  const pastReturns = transactions.filter(t => t.status === 'returned');
  const unpaidFinesList = fines.filter(f => f.status === 'unpaid');
  const totalUnpaidFines = unpaidFinesList.reduce((sum, f) => sum + f.amount, 0);

  // Student Identity details (NO EMAIL EXPOSED)
  const studentName = memberProfile?.name || user?.name || 'Student Member';
  const studentId = memberProfile?.student_id || 'STU-2024-001';
  const department = memberProfile?.department || 'Undergraduate Studies';
  const academicYear = memberProfile?.year ? `Year ${memberProfile.year}` : 'Active Student';
  const memberStatus = memberProfile?.status || 'active';

  const initials = studentName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0])
    .join('')
    .toUpperCase() || 'ST';

  // Calculate days remaining or overdue
  const getDueStatus = (dueDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDateStr);
    due.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { label: `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? 's' : ''}`, color: 'bg-rose-50 text-rose-700 border-rose-200 font-bold' };
    } else if (diffDays === 0) {
      return { label: 'Due today!', color: 'bg-amber-50 text-amber-800 border-amber-300 font-bold' };
    } else if (diffDays <= 3) {
      return { label: `Due in ${diffDays} day${diffDays > 1 ? 's' : ''}`, color: 'bg-amber-50 text-amber-700 border-amber-200' };
    } else {
      return { label: `${diffDays} days remaining`, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
          <p className="text-xs text-slate-500 font-medium">Loading Student Library Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
              <BookOpen size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-slate-900">BiblioHub</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200/60 uppercase tracking-wider">
                  Student Portal
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">University Library Circulation</p>
            </div>
          </div>

          {/* Student Status & User Bar (NO EMAIL SHOWN) */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3 py-1 px-3 bg-slate-50 rounded-xl border border-slate-200/60">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold shadow-2xs">
                {initials}
              </div>
              <div className="text-left text-xs">
                <p className="font-bold text-slate-900 leading-tight">{studentName}</p>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                  <span className="font-mono font-medium text-indigo-600">{studentId}</span>
                  <span>•</span>
                  <span>{academicYear}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              title="Sign Out"
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-100 flex space-x-1 sm:space-x-4 overflow-x-auto">
          {[
            { id: 'overview', label: 'My Library Overview', icon: BookMarked },
            { id: 'loans', label: `My Borrowed Books (${activeLoans.length})`, icon: BookDown },
            { id: 'catalog', label: 'Search Library Catalog', icon: Search },
            { id: 'fines', label: `Fines & Dues ${totalUnpaidFines > 0 ? `($${totalUnpaidFines.toFixed(2)})` : ''}`, icon: DollarSign },
            { id: 'card', label: 'Digital Library Card', icon: CreditCard },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'border-indigo-600 text-indigo-600 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <tab.icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Welcome Banner */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 sm:p-10 border border-slate-800 shadow-xl text-white">
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />
              
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                      <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                      {department}
                    </span>
                    <span className="inline-flex items-center font-mono text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      ID: {studentId}
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                    Welcome back, {studentName}
                  </h1>
                  <p className="text-slate-300 text-sm max-w-xl">
                    View your currently borrowed books, keep track of due dates, and explore hundreds of physical books in the campus library stacks.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setActiveTab('catalog')}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
                  >
                    <Search className="w-4 h-4" />
                    Browse Catalog
                  </button>
                  <button
                    onClick={() => setActiveTab('card')}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition-all cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4 text-indigo-400" />
                    My Library Card
                  </button>
                </div>
              </div>
            </div>

            {/* Metric Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div 
                onClick={() => setActiveTab('loans')} 
                className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Active Checkouts</span>
                    <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                      {activeLoans.length} <span className="text-xs font-normal text-slate-400">/ 5 Limit</span>
                    </p>
                    <p className="text-xs text-slate-600">Currently in your possession</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 group-hover:scale-110 transition-transform">
                    <BookDown className="h-5 w-5" />
                  </div>
                </div>
              </div>

              <div 
                onClick={() => setActiveTab('loans')} 
                className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Due Timeline</span>
                    <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                      {activeLoans.filter(t => {
                        const due = new Date(t.due_date);
                        const today = new Date();
                        return (due.getTime() - today.getTime()) < (3 * 24 * 60 * 60 * 1000);
                      }).length}
                    </p>
                    <p className="text-xs text-slate-600">Books due soon or overdue</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-amber-50 text-amber-600 group-hover:scale-110 transition-transform">
                    <Clock className="h-5 w-5" />
                  </div>
                </div>
              </div>

              <div 
                onClick={() => setActiveTab('fines')} 
                className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Outstanding Fines</span>
                    <p className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${totalUnpaidFines > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                      ${totalUnpaidFines.toFixed(2)}
                    </p>
                    <p className="text-xs text-slate-600">{totalUnpaidFines > 0 ? 'Requires desk settlement' : 'Zero dues pending'}</p>
                  </div>
                  <div className={`p-3 rounded-2xl ${totalUnpaidFines > 0 ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'} group-hover:scale-110 transition-transform`}>
                    <DollarSign className="h-5 w-5" />
                  </div>
                </div>
              </div>

              <div 
                onClick={() => setActiveTab('card')} 
                className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Account Eligibility</span>
                    <p className="text-xl sm:text-2xl font-extrabold text-emerald-600 tracking-tight flex items-center gap-1.5 mt-1">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      {memberStatus === 'active' ? 'Eligible' : 'Suspended'}
                    </p>
                    <p className="text-xs text-slate-600">Borrowing card active</p>
                  </div>
                  <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                </div>
              </div>
            </div>

            {/* Currently Borrowed Books Section */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Books Currently in Your Possession</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Please ensure books are returned on or before the due date to avoid overdue charges ($5/day).</p>
                </div>
                <button
                  onClick={() => setActiveTab('loans')}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
                >
                  View loan history
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {activeLoans.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700">No active book loans</p>
                  <p className="text-xs text-slate-400 mt-1">You currently have no books checked out from the library.</p>
                  <button
                    onClick={() => setActiveTab('catalog')}
                    className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold shadow-xs hover:bg-indigo-700 transition-colors cursor-pointer"
                  >
                    Explore Library Catalog
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeLoans.map((loan) => {
                    const dueInfo = getDueStatus(loan.due_date);
                    return (
                      <div key={loan.id} className="p-5 rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors flex flex-col justify-between space-y-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-14 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 text-white flex items-center justify-center shrink-0 shadow-sm font-bold text-sm">
                            <BookOpen className="w-6 h-6" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-bold text-slate-900 text-base leading-tight truncate">
                              {loan.book?.title}
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">By {loan.book?.author || 'Unknown'}</p>
                            
                            {loan.book?.shelf_location && (
                              <div className="flex items-center gap-1 mt-2 text-[11px] text-slate-600 font-medium">
                                <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                                <span>Shelf: {loan.book.shelf_location}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between">
                          <div className="text-[11px] text-slate-500 space-y-0.5">
                            <p>Issued: <span className="font-medium text-slate-700">{loan.issue_date}</span></p>
                            <p>Due Date: <span className="font-bold text-slate-900">{loan.due_date}</span></p>
                          </div>
                          <span className={`px-2.5 py-1 rounded-full text-xs border ${dueInfo.color}`}>
                            {dueInfo.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: CURRENT LOANS & HISTORY */}
        {activeTab === 'loans' && (
          <div className="space-y-8">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-bold text-slate-900">Your Book Loans & History</h2>
                <p className="text-xs text-slate-500 mt-0.5">Comprehensive history of all books borrowed and returned by you.</p>
              </div>

              {/* Active Loans */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                  Active Loans ({activeLoans.length})
                </h3>

                {activeLoans.length === 0 ? (
                  <p className="text-xs text-slate-400 p-4 bg-slate-50 rounded-xl">No active loans.</p>
                ) : (
                  <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
                    {activeLoans.map((loan) => {
                      const dueInfo = getDueStatus(loan.due_date);
                      return (
                        <div key={loan.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">
                              <BookOpen className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900 text-sm">{loan.book?.title}</h4>
                              <p className="text-xs text-slate-500">Author: {loan.book?.author} • ISBN: {loan.book?.isbn}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 self-end sm:self-center">
                            <div className="text-right text-xs">
                              <p className="text-slate-400">Due Date</p>
                              <p className="font-bold text-slate-800">{loan.due_date}</p>
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-xs border ${dueInfo.color}`}>
                              {dueInfo.label}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Past Returned Books */}
              <div className="pt-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Previously Returned Books ({pastReturns.length})
                </h3>

                {pastReturns.length === 0 ? (
                  <p className="text-xs text-slate-400 p-4 bg-slate-50 rounded-xl">No previous return history.</p>
                ) : (
                  <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
                    {pastReturns.map((loan) => (
                      <div key={loan.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs shrink-0">
                            <CheckCircle2 className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-900 text-sm">{loan.book?.title}</h4>
                            <p className="text-xs text-slate-500">Borrowed: {loan.issue_date} • Returned: {loan.return_date}</p>
                          </div>
                        </div>

                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 self-end sm:self-center">
                          Returned
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SEARCH LIBRARY CATALOG */}
        {activeTab === 'catalog' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-bold text-slate-900">Explore Campus Library Catalog</h2>
                <p className="text-xs text-slate-500 mt-0.5">Search and check live physical availability and shelf location of books.</p>
              </div>

              {/* Search & Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative md:col-span-2">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={catalogSearch}
                    onChange={(e) => setCatalogSearch(e.target.value)}
                    placeholder="Search by title, author, or ISBN..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-900"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={selectedCategory || ''}
                    onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : null)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-700 cursor-pointer"
                  >
                    <option value="">All Categories ({categories.length})</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>

                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 shrink-0 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={availableOnly}
                      onChange={(e) => setAvailableOnly(e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4 cursor-pointer"
                    />
                    <span>Available only</span>
                  </label>
                </div>
              </div>

              {/* Books Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pt-2">
                {books.map((book) => {
                  const isAvailable = book.available_copies > 0;
                  return (
                    <div
                      key={book.id}
                      className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100">
                            {book.category?.name || 'General Collection'}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${
                            isAvailable
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}>
                            {isAvailable ? `${book.available_copies} Copies Available` : 'All Issued Out'}
                          </span>
                        </div>

                        <div>
                          <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-2">
                            {book.title}
                          </h3>
                          <p className="text-xs text-slate-500 mt-1">Author: <span className="text-slate-700 font-medium">{book.author}</span></p>
                        </div>

                        {book.description && (
                          <p className="text-xs text-slate-500 line-clamp-2 italic">
                            "{book.description}"
                          </p>
                        )}
                      </div>

                      <div className="pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">ISBN</span>
                          <span className="font-mono text-slate-800">{book.isbn}</span>
                        </div>
                        {book.shelf_location && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400 flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                              Stack Location
                            </span>
                            <span className="font-bold text-indigo-700">{book.shelf_location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {books.length === 0 && (
                  <div className="col-span-full p-12 text-center text-slate-400">
                    <Search className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-700">No books found</p>
                    <p className="text-xs text-slate-400 mt-1">Try changing your search terms or category filters.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: FINES & OVERDUES */}
        {activeTab === 'fines' && (
          <div className="space-y-8">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-bold text-slate-900">Overdue Fines & Penalty Ledger</h2>
                <p className="text-xs text-slate-500 mt-0.5">Detailed records of overdue library fines incurred on book returns.</p>
              </div>

              {/* Fines summary card */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">Total Outstanding Balance</p>
                  <p className="text-3xl font-extrabold tracking-tight">${totalUnpaidFines.toFixed(2)}</p>
                  <p className="text-xs text-slate-400">Calculated dynamically at standard $5.00/day policy</p>
                </div>

                <div className="p-4 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10 max-w-sm text-xs space-y-1">
                  <p className="font-bold flex items-center gap-1.5 text-indigo-200">
                    <Info className="w-4 h-4 text-indigo-300" />
                    Fine Payment Notice
                  </p>
                  <p className="text-slate-300 leading-normal">
                    Fines must be settled at the Central Library Front Desk before borrowing privileges can be renewed.
                  </p>
                </div>
              </div>

              {/* Fines Table */}
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
                {fines.map((fine) => (
                  <div key={fine.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          Ref #{fine.transaction_id}
                        </span>
                        <span className="text-sm font-bold text-slate-900">Overdue Penalty</span>
                      </div>
                      <p className="text-xs text-slate-500">
                        {fine.overdue_days} overdue days @ standard rate
                      </p>
                    </div>

                    <div className="flex items-center gap-4 self-end sm:self-center">
                      <p className="text-lg font-extrabold text-slate-900">${fine.amount.toFixed(2)}</p>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                        fine.status === 'paid'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {fine.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}

                {fines.length === 0 && (
                  <div className="p-12 text-center text-slate-400">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-700">No overdue penalties</p>
                    <p className="text-xs text-slate-400 mt-1">Your library borrowing record is clear and in excellent standing!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: DIGITAL CARD & SECURITY */}
        {activeTab === 'card' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Digital Library Card */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-xl font-bold text-slate-900">Official Student Library Card</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Use this identification card to checkout physical books at the circulation desk.</p>
                </div>

                {/* Holographic Card Graphic */}
                <div className="relative rounded-3xl overflow-hidden bg-gradient-to-tr from-slate-950 via-indigo-950 to-slate-900 text-white p-7 shadow-2xl border border-indigo-500/20 aspect-16/10 flex flex-col justify-between">
                  {/* Decorative Glow */}
                  <div className="absolute top-0 right-0 w-52 h-52 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
                  
                  {/* Card Header */}
                  <div className="relative z-10 flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white shadow-md">
                        <BookOpen size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold tracking-tight text-white">Central Campus Library</p>
                        <p className="text-[9px] text-indigo-300 uppercase tracking-widest font-semibold">Student Circulation Card</p>
                      </div>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                      ACTIVE
                    </span>
                  </div>

                  {/* Card Center: Student Name & ID */}
                  <div className="relative z-10 space-y-1">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Member Name</p>
                    <h3 className="text-xl font-extrabold text-white tracking-wide">{studentName}</h3>
                    <div className="flex items-center gap-3 pt-1 text-xs text-indigo-200">
                      <span>{department}</span>
                      <span>•</span>
                      <span>{academicYear}</span>
                    </div>
                  </div>

                  {/* Card Footer: Barcode Simulation & UID */}
                  <div className="relative z-10 pt-3 border-t border-slate-800/80 flex items-end justify-between">
                    <div>
                      <p className="text-[9px] text-slate-400 uppercase tracking-wider">Student ID Number</p>
                      <p className="font-mono text-sm font-bold text-white tracking-wider">{studentId}</p>
                    </div>

                    {/* Barcode lines */}
                    <div className="flex items-center gap-1 h-6 opacity-75">
                      {[3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8, 9, 7].map((w, idx) => (
                        <div key={idx} className={`h-full bg-white rounded-xs`} style={{ width: `${w * 1.2}px` }} />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card details list */}
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-500">Max Loan Allowance</span>
                    <span className="font-bold text-slate-900">5 Simultaneous Books</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-500">Standard Loan Duration</span>
                    <span className="font-bold text-slate-900">14 Calendar Days</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-500">Card Validity</span>
                    <span className="font-semibold text-emerald-700">Permanent / Degree Enrolled</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Change Student Password (NO EMAIL SHOWN) */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xs space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <KeyRound className="w-5 h-5 text-indigo-600" />
                    Security & Password
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Update your account password to protect your student portal.
                  </p>
                </div>

                {passwordMessage && (
                  <div className={`p-4 rounded-xl text-xs flex items-center gap-2 ${
                    passwordMessage.type === 'success' 
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}>
                    {passwordMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" /> : <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />}
                    <span>{passwordMessage.text}</span>
                  </div>
                )}

                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showOldPassword ? 'text' : 'password'}
                        required
                        value={passwordForm.oldPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                        placeholder="Enter current password"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all pr-10 font-medium text-slate-900"
                      />
                      <button
                        type="button"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        placeholder="Min. 6 characters"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all pr-10 font-medium text-slate-900"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      placeholder="Repeat new password"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-900"
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={passwordLoading}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      {passwordLoading ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentDashboard;
