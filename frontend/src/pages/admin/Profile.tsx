import React, { useState } from 'react';
import { 
  User, 
  ShieldCheck, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  Phone, 
  MapPin, 
  Save, 
  Sparkles,
  Eye,
  EyeOff,
  Lock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/auth';
import api from '../../services/api';

const AVATAR_GRADIENTS = [
  { id: 'indigo', label: 'Indigo Horizon', class: 'from-indigo-600 via-purple-600 to-violet-700' },
  { id: 'emerald', label: 'Emerald Forest', class: 'from-emerald-600 via-teal-600 to-cyan-700' },
  { id: 'rose', label: 'Sunset Rose', class: 'from-rose-500 via-pink-600 to-purple-600' },
  { id: 'amber', label: 'Amber Flame', class: 'from-amber-500 via-orange-600 to-red-600' },
  { id: 'sky', label: 'Oceanic Blue', class: 'from-blue-600 via-sky-600 to-indigo-700' }
];

const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const currentStored = authService.getStoredProfile();

  const [formData, setFormData] = useState({
    name: user?.name || currentStored.name || 'System Administrator',
    title: user?.title || currentStored.title || 'Director of Library Services',
    department: user?.department || currentStored.department || 'Library & Archives Division',
    phone: user?.phone || currentStored.phone || '+1 (555) 019-2834',
    officeLocation: 'Main Library, Room 204',
    bio: user?.bio || currentStored.bio || 'Managing campus collection cataloging, circulation policy, student registration, and institutional archives.',
    avatarColor: user?.avatarColor || currentStored.avatarColor || AVATAR_GRADIENTS[0].class
  });

  const [saveToast, setSaveToast] = useState(false);

  // Password state
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const initials = formData.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0])
    .join('')
    .toUpperCase() || 'AD';

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: formData.name,
      title: formData.title,
      department: formData.department,
      phone: formData.phone,
      bio: formData.bio,
      avatarColor: formData.avatarColor
    });
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3500);
  };

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
        text: err.response?.data?.detail || 'Failed to change password. Please verify current password.'
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Toast feedback */}
      {saveToast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 animate-bounce">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <div>
            <p className="text-sm font-semibold">Profile Updated</p>
            <p className="text-xs text-slate-300">Your administrative identity has been saved across the system.</p>
          </div>
        </div>
      )}

      {/* Hero Banner Card */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 shadow-xl p-8 sm:p-10 text-white">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-60 h-60 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
          {/* Avatar with dynamic gradient */}
          <div className="relative group shrink-0">
            <div className={`w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-tr ${formData.avatarColor} p-1 shadow-xl shadow-indigo-950/50 flex items-center justify-center`}>
              <div className="w-full h-full rounded-[22px] bg-slate-950/40 backdrop-blur-xs flex items-center justify-center text-white font-extrabold text-3xl sm:text-4xl tracking-wider">
                {initials}
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 bg-emerald-500 border-4 border-slate-900 rounded-full p-1.5 shadow-md">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 text-center md:text-left space-y-3">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                {formData.name}
              </h1>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Super Administrator
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-slate-800 text-slate-300 border border-slate-700">
                #ADM-{String(user?.id || 1).padStart(4, '0')}
              </span>
            </div>

            <p className="text-indigo-200 text-base font-medium">
              {formData.title}
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-slate-300 pt-1">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-indigo-400" />
                {formData.department}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-indigo-400" />
                {formData.officeLocation}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-indigo-400" />
                {formData.phone}
              </span>
            </div>

            <p className="text-xs text-slate-400 max-w-2xl pt-2 leading-relaxed italic">
              "{formData.bio}"
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Profile Settings Form */}
        <div className="lg:col-span-2 space-y-8">
          <form onSubmit={handleProfileSave} className="bg-white rounded-3xl p-7 border border-slate-100 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-600" />
                Administrative Profile Details
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Customize your public administrator display name, title, and theme appearance.
              </p>
            </div>

            {/* Avatar Theme Selection */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                Avatar Theme Color
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {AVATAR_GRADIENTS.map((gradient) => (
                  <button
                    key={gradient.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, avatarColor: gradient.class })}
                    className={`flex items-center gap-2.5 p-2 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                      formData.avatarColor === gradient.class
                        ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-lg bg-gradient-to-tr ${gradient.class} shrink-0`} />
                    <span className="truncate text-slate-700">{gradient.label.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Alex Morgan"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Designation / Role Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Chief Librarian & Archivist"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Department / Faculty
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="e.g. University Library Services"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Direct Contact Number
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Office / Desk Location
                </label>
                <input
                  type="text"
                  value={formData.officeLocation}
                  onChange={(e) => setFormData({ ...formData, officeLocation: e.target.value })}
                  placeholder="Building, Floor, Room number"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Administrator Bio & Scope
                </label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Describe your administrative duties..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-900 resize-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                Save Profile Changes
              </button>
            </div>
          </form>

          {/* Change Password Form (No Email Shown) */}
          <div className="bg-white rounded-3xl p-7 border border-slate-100 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Lock className="w-5 h-5 text-indigo-600" />
                Admin Credentials & Security
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Update your administrative login credentials to maintain secure database access.
              </p>
            </div>

            {passwordMessage && (
              <div className={`p-4 rounded-xl text-sm flex items-center gap-3 ${
                passwordMessage.type === 'success' 
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' 
                  : 'bg-rose-50 border border-rose-200 text-rose-800'
              }`}>
                {passwordMessage.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
                )}
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
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all pr-10"
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all pr-10"
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
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold rounded-xl shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                >
                  <KeyRound className="w-4 h-4" />
                  {passwordLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Roles, Permissions & Identity Overview */}
        <div className="space-y-6">
          {/* Identity Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
              Account Verification
            </h3>
            
            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Security Clearance</span>
                <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                  Level 4 • Root Admin
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">System Role</span>
                <span className="font-semibold text-slate-800 capitalize">
                  {user?.role || 'Administrator'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Account Status</span>
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Active & Verified
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Authentication</span>
                <span className="font-mono text-slate-700">OAuth2 Bearer (HS256)</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-500">Identifier UID</span>
                <span className="font-mono font-medium text-slate-800">
                  ADM-{String(user?.id || 1).padStart(4, '0')}
                </span>
              </div>
            </div>
          </div>

          {/* Administrative Privileges */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Active System Privileges
            </h3>
            <div className="space-y-3">
              {[
                { title: 'Catalog Management', desc: 'Full authority to create, update, and prune collection records.' },
                { title: 'Member Governance', desc: 'Register students, issue borrowing cards, or suspend privileges.' },
                { title: 'Circulation Desk', desc: 'Authorize book checkout, renewal, and check-in processing.' },
                { title: 'Fiscal & Fine Ledger', desc: 'Configure fine policies, collect dues, and generate receipts.' },
                { title: 'System Architecture', desc: 'Audit system health, ping latency, and database integrity.' }
              ].map((priv, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100/80">
                  <p className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    {priv.title}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">{priv.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
