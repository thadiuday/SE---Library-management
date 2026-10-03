import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  Plus, 
  Search, 
  UserCheck, 
  UserX, 
  User, 
  GraduationCap, 
  Building, 
  Pencil, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Phone,
  Hash
} from 'lucide-react';

export interface Member {
  id: number;
  user_id: number;
  name: string;
  email: string;
  phone: string | null;
  student_id: string;
  department: string | null;
  year: number | null;
  status: string;
}

const MemberList: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    student_id: '',
    department: '',
    year: '',
    phone: ''
  });

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const res = await api.get('/members');
      setMembers(res.data.items);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenAddModal = () => {
    setEditingMember(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      student_id: '',
      department: '',
      year: '',
      phone: ''
    });
    setModalError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (member: Member) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      email: member.email || '',
      password: '',
      student_id: member.student_id,
      department: member.department || '',
      year: member.year ? String(member.year) : '',
      phone: member.phone || ''
    });
    setModalError('');
    setIsModalOpen(true);
  };

  const toggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      const newStatus = currentStatus ? 'inactive' : 'active';
      await api.patch(`/members/${id}/status`, { status: newStatus });
      showToast('success', `Member status changed to ${newStatus}`);
      fetchMembers();
    } catch (err: any) {
      showToast('error', err.response?.data?.detail || 'Failed to update status');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');
    setModalLoading(true);

    try {
      if (editingMember) {
        // Edit existing member
        await api.put(`/members/${editingMember.id}`, {
          name: formData.name,
          student_id: formData.student_id,
          department: formData.department || null,
          year: parseInt(formData.year) || null,
          phone: formData.phone || null
        });
        showToast('success', `Member details for "${formData.name}" successfully updated!`);
      } else {
        // Create new member
        await api.post('/members', {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          student_id: formData.student_id,
          department: formData.department || null,
          year: parseInt(formData.year) || null,
          phone: formData.phone || null
        });
        showToast('success', `New member "${formData.name}" registered successfully!`);
      }

      setIsModalOpen(false);
      fetchMembers();
    } catch (err: any) {
      setModalError(err.response?.data?.detail || 'Failed to save member details. Please check inputs.');
    } finally {
      setModalLoading(false);
    }
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.department && member.department.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDept = filterDepartment === 'all' || member.department === filterDepartment;
    return matchesSearch && matchesDept;
  });

  const departments = Array.from(new Set(members.map(m => m.department).filter(Boolean))) as string[];

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border animate-bounce ${
          toastMessage.type === 'success' 
            ? 'bg-slate-900 text-white border-slate-700' 
            : 'bg-rose-900 text-white border-rose-700'
        }`}>
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
          )}
          <span className="text-sm font-semibold">{toastMessage.text}</span>
        </div>
      )}

      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Registered Members</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage student registrations, academic standing, and library borrowing eligibility.
          </p>
        </div>
        <button 
          onClick={handleOpenAddModal} 
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Register Member
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="relative sm:col-span-2">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search by student name, ID number, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-2xs"
          />
        </div>
        <div>
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 shadow-2xs cursor-pointer"
          >
            <option value="all">All Departments ({members.length})</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Members List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="divide-y divide-gray-100">
          {filteredMembers.map((member) => (
            <div key={member.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-bold text-base shadow-sm shrink-0">
                  {member.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 text-base">{member.name}</h3>
                    <span className="inline-flex items-center font-mono text-xs px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100">
                      ID: {member.student_id}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Building className="h-3.5 w-3.5 text-gray-400" />
                      {member.department || 'General Studies'}
                    </span>
                    {member.year && (
                      <span className="flex items-center gap-1">
                        <GraduationCap className="h-3.5 w-3.5 text-gray-400" />
                        Year {member.year}
                      </span>
                    )}
                    {member.phone && (
                      <span className="flex items-center gap-1 text-gray-400">
                        <Phone className="h-3 w-3 text-gray-400" />
                        {member.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons: Status Badge, Edit Details, Suspend/Restore */}
              <div className="flex items-center gap-2.5 self-end sm:self-center">
                <span className={`px-2.5 py-1 inline-flex text-xs font-semibold rounded-full border ${
                  member.status === 'active' 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full mr-1.5 self-center ${member.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                  {member.status === 'active' ? 'Eligible' : 'Suspended'}
                </span>

                {/* Edit Member Details Button */}
                <button 
                  onClick={() => handleOpenEditModal(member)}
                  title="Edit Member Details"
                  className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition-colors cursor-pointer"
                >
                  <Pencil className="h-4 w-4" />
                </button>

                {/* Toggle Status Button */}
                <button 
                  onClick={() => toggleStatus(member.id, member.status === 'active')}
                  title={member.status === 'active' ? "Suspend Borrowing" : "Restore Status"}
                  className={`p-2 rounded-xl border text-sm transition-colors cursor-pointer ${
                    member.status === 'active'
                      ? 'border-gray-200 text-gray-500 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200'
                      : 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                  }`}
                >
                  {member.status === 'active' ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                </button>
              </div>
            </div>
          ))}

          {filteredMembers.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              <User className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="font-medium text-gray-700">No members match your criteria</p>
              <p className="text-xs text-gray-400 mt-1">Try adjusting your search terms or register a new member.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Member Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" onClick={() => setIsModalOpen(false)} />

          {/* Centering wrapper */}
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <div
              className="relative transform overflow-hidden rounded-3xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg z-10 p-6 sm:p-8 border border-slate-100"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {editingMember ? 'Edit Member Details' : 'Register New Member'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {editingMember 
                      ? `Update academic standing and contact info for ID #${editingMember.student_id}`
                      : 'Create a new student record and generate library borrowing privileges.'}
                  </p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Error Message */}
              {modalError && (
                <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                  <span>{modalError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Full Student Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input 
                      type="text" 
                      required 
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})} 
                      placeholder="e.g. John Doe"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-900" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Student ID Number
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input 
                      type="text" 
                      required 
                      value={formData.student_id} 
                      onChange={e => setFormData({...formData, student_id: e.target.value})} 
                      placeholder="e.g. STU-2024-001"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono font-medium text-slate-900" 
                    />
                  </div>
                </div>

                {/* Account Credentials (Only required when registering a brand new member) */}
                {!editingMember && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                        Account Email / Login
                      </label>
                      <input 
                        type="email" 
                        required 
                        value={formData.email} 
                        onChange={e => setFormData({...formData, email: e.target.value})} 
                        placeholder="student@campus.edu"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-900" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                        Initial Password
                      </label>
                      <input 
                        type="password" 
                        required 
                        value={formData.password} 
                        onChange={e => setFormData({...formData, password: e.target.value})} 
                        placeholder="••••••••"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-900" 
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                      Academic Department
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input 
                        type="text" 
                        value={formData.department} 
                        onChange={e => setFormData({...formData, department: e.target.value})} 
                        placeholder="e.g. Computer Science"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-900" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                      Academic Year
                    </label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input 
                        type="number" 
                        min="1" 
                        max="8" 
                        value={formData.year} 
                        onChange={e => setFormData({...formData, year: e.target.value})} 
                        placeholder="e.g. 2"
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-900" 
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Contact Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input 
                      type="text" 
                      value={formData.phone} 
                      onChange={e => setFormData({...formData, phone: e.target.value})} 
                      placeholder="+1 (555) 000-0000"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium text-slate-900" 
                    />
                  </div>
                </div>

                {/* Form Footer Buttons */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)} 
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={modalLoading}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow-md transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {modalLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    ) : (
                      editingMember ? 'Save Changes' : 'Register Member'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberList;
