import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  ShieldCheck, 
  Clock, 
  Coins, 
  Building, 
  Server, 
  CheckCircle2, 
  AlertCircle, 
  KeyRound, 
  RotateCcw, 
  Save, 
  Eye, 
  EyeOff, 
  Database,
  Layers,
  BookMarked
} from 'lucide-react';
import { settingsService } from '../../services/api/settings';
import type { LibrarySettings, SystemInfo } from '../../services/api/settings';
import { useAuth } from '../../context/AuthContext';

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'rules' | 'profile' | 'security' | 'system'>('rules');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Settings State
  const [settings, setSettings] = useState<LibrarySettings>({
    fine_per_day: 5.0,
    max_borrow_limit: 5,
    loan_period_days: 14,
    library_name: 'Central Campus Library',
    contact_email: 'library@campus.edu',
    contact_phone: '+1 (555) 019-2834',
    operating_hours: 'Mon-Fri: 8:00 AM - 8:00 PM, Sat: 9:00 AM - 4:00 PM',
  });

  // Password State
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  // System Info State
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [pingLatency, setPingLatency] = useState<number | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const startTime = performance.now();
      const [settingsData, sysData] = await Promise.all([
        settingsService.getSettings(),
        settingsService.getSystemInfo().catch(() => null)
      ]);
      const latency = Math.round(performance.now() - startTime);
      setPingLatency(latency);
      setSettings(settingsData);
      if (sysData) setSystemInfo(sysData);
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.response?.data?.detail || 'Failed to load library settings',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage(null);
    try {
      const updated = await settingsService.updateSettings(settings);
      setSettings(updated);
      setStatusMessage({ type: 'success', text: 'Settings updated successfully!' });
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.response?.data?.detail || 'Failed to save settings',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = async () => {
    if (!window.confirm('Reset all library rules and configuration back to system defaults?')) {
      return;
    }
    setSaving(true);
    setStatusMessage(null);
    try {
      const reset = await settingsService.resetDefaultSettings();
      setSettings(reset);
      setStatusMessage({ type: 'success', text: 'Settings reset to factory defaults.' });
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err.response?.data?.detail || 'Failed to reset settings',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New password and confirmation do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      return;
    }

    try {
      setChangingPassword(true);
      const res = await settingsService.changePassword({
        old_password: passwordForm.oldPassword,
        new_password: passwordForm.newPassword,
      });
      setPasswordSuccess(res.message || 'Password changed successfully!');
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPasswordSuccess(''), 5000);
    } catch (err: any) {
      setPasswordError(err.response?.data?.detail || 'Failed to change password. Verify your current password.');
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-3"></div>
        <p className="text-gray-500 font-medium">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
            <SettingsIcon className="w-7 h-7 text-indigo-600" />
            System & Library Settings
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage borrowing policies, institutional profile, administrative credentials, and system health.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleResetDefaults}
            disabled={saving}
            className="inline-flex items-center px-3.5 py-2 border border-gray-300 rounded-lg text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-xs cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5 text-gray-500" />
            Reset Defaults
          </button>
        </div>
      </div>

      {/* Global Status Message */}
      {statusMessage && (
        <div
          className={`flex items-center gap-3 p-4 rounded-xl border text-sm transition-all ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span className="font-medium">{statusMessage.text}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex space-x-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab('rules')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
            activeTab === 'rules'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <Coins className="w-4 h-4" />
          Borrowing & Rules
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <Building className="w-4 h-4" />
          Library Profile
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
            activeTab === 'security'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Admin Security
        </button>
        <button
          onClick={() => setActiveTab('system')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
            activeTab === 'system'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
          }`}
        >
          <Server className="w-4 h-4" />
          System Health
        </button>
      </div>

      {/* Tab 1: Borrowing & Rules */}
      {activeTab === 'rules' && (
        <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <h2 className="text-lg font-semibold text-gray-900">Borrowing Policies & Fine Structure</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              These rules dynamically govern transaction due dates, limits per student, and overdue penalties.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50/70 p-5 rounded-xl border border-gray-200">
              <label className="block text-sm font-semibold text-gray-800 flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-indigo-600" />
                Default Loan Period
              </label>
              <p className="text-xs text-gray-500 mb-3">Number of days allowed before a book is due for return.</p>
              <div className="flex items-center">
                <input
                  type="number"
                  min="1"
                  max="180"
                  required
                  value={settings.loan_period_days}
                  onChange={(e) => setSettings({ ...settings, loan_period_days: parseInt(e.target.value) || 1 })}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm font-semibold"
                />
                <span className="ml-3 text-sm font-medium text-gray-500 whitespace-nowrap">Days</span>
              </div>
            </div>

            <div className="bg-gray-50/70 p-5 rounded-xl border border-gray-200">
              <label className="block text-sm font-semibold text-gray-800 flex items-center gap-2 mb-1">
                <BookMarked className="w-4 h-4 text-indigo-600" />
                Max Books per Member
              </label>
              <p className="text-xs text-gray-500 mb-3">Maximum active issued books permitted simultaneously.</p>
              <div className="flex items-center">
                <input
                  type="number"
                  min="1"
                  max="30"
                  required
                  value={settings.max_borrow_limit}
                  onChange={(e) => setSettings({ ...settings, max_borrow_limit: parseInt(e.target.value) || 1 })}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm font-semibold"
                />
                <span className="ml-3 text-sm font-medium text-gray-500 whitespace-nowrap">Books</span>
              </div>
            </div>

            <div className="bg-gray-50/70 p-5 rounded-xl border border-gray-200">
              <label className="block text-sm font-semibold text-gray-800 flex items-center gap-2 mb-1">
                <Coins className="w-4 h-4 text-indigo-600" />
                Fine Rate per Day
              </label>
              <p className="text-xs text-gray-500 mb-3">Penalty charged per overdue day upon return.</p>
              <div className="flex items-center">
                <span className="mr-2 text-sm font-bold text-gray-700">₹</span>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  required
                  value={settings.fine_per_day}
                  onChange={(e) => setSettings({ ...settings, fine_per_day: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm font-semibold"
                />
                <span className="ml-3 text-sm font-medium text-gray-500 whitespace-nowrap">/ day</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving Changes...' : 'Save Borrowing Rules'}
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Institution & Profile */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
          <div className="border-b border-gray-100 pb-4">
            <h2 className="text-lg font-semibold text-gray-900">Institution & Contact Information</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Details displayed to students and used in correspondence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Library / Institution Name</label>
              <input
                type="text"
                required
                value={settings.library_name}
                onChange={(e) => setSettings({ ...settings, library_name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Official Helpdesk Email</label>
              <input
                type="email"
                required
                value={settings.contact_email}
                onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Contact Phone Number</label>
              <input
                type="text"
                value={settings.contact_phone || ''}
                onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Operating Hours</label>
              <input
                type="text"
                value={settings.operating_hours || ''}
                onChange={(e) => setSettings({ ...settings, operating_hours: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Update Library Profile'}
            </button>
          </div>
        </form>
      )}

      {/* Tab 3: Admin Security */}
      {activeTab === 'security' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Admin Credentials Summary */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Current Session</h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                  Administrator
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-2 text-sm">
              <div>
                <p className="text-gray-500 text-xs">Account Identifier</p>
                <p className="font-medium font-mono text-gray-800">#ADM-{String(user?.id || 1).padStart(4, '0')}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Administrator Name</p>
                <p className="font-medium text-gray-800">{user?.name || 'Administrator'}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Account Clearance</p>
                <p className="font-medium text-gray-800 capitalize">{user?.role || 'Admin'} Access (Full Privileges)</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Authentication Protocol</p>
                <p className="font-medium text-gray-800">JWT Bearer (HS256)</p>
              </div>
            </div>
          </div>

          {/* Change Password Form */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-indigo-600" />
                Change Admin Password
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Ensure your administrative password is strong and updated periodically.
              </p>
            </div>

            {passwordError && (
              <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-lg">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                {passwordSuccess}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <div className="relative">
                  <input
                    type={showOldPassword ? 'text' : 'password'}
                    required
                    value={passwordForm.oldPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showOldPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      placeholder="Minimum 6 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="Re-enter new password"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="inline-flex items-center px-5 py-2.5 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  {changingPassword ? 'Updating Password...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab 4: System Health & Info */}
      {activeTab === 'system' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <Server className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">API Server</p>
                <p className="text-lg font-bold text-gray-900">Online</p>
                <p className="text-xs text-emerald-600 flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                  {pingLatency !== null ? `${pingLatency}ms response` : 'Connected'}
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Database</p>
                <p className="text-lg font-bold text-gray-900">{systemInfo?.database_type || 'SQLite 3'}</p>
                <p className="text-xs text-gray-500 mt-0.5">library.db</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="p-3 bg-violet-50 text-violet-600 rounded-xl">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Total Records</p>
                <p className="text-lg font-bold text-gray-900">
                  {systemInfo ? (systemInfo.counts.books + systemInfo.counts.members + systemInfo.counts.categories) : '—'}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {systemInfo?.counts.books || 0} books · {systemInfo?.counts.members || 0} members
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">API Version</p>
                <p className="text-lg font-bold text-gray-900">{systemInfo?.version || '1.0.0'}</p>
                <p className="text-xs text-gray-500 mt-0.5">{systemInfo?.api_prefix || '/api'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
            <h3 className="text-base font-semibold text-gray-900">System Information & Diagnostics</h3>
            <div className="divide-y divide-gray-100 text-sm">
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-gray-500">Application Framework</span>
                <span className="font-medium text-gray-900">FastAPI (Python) + React (Vite)</span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-gray-500">Active Borrow Transactions</span>
                <span className="font-medium text-gray-900">{systemInfo?.counts.active_borrows ?? 0}</span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-gray-500">Fine Records Tracked</span>
                <span className="font-medium text-gray-900">{systemInfo?.counts.fines ?? 0}</span>
              </div>
              <div className="py-2.5 flex justify-between items-center">
                <span className="text-gray-500">Server Time (UTC)</span>
                <span className="font-mono text-xs text-gray-700">{systemInfo?.server_time || new Date().toISOString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
