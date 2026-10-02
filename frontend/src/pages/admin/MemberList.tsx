import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Plus, Search, UserCheck, UserX } from 'lucide-react';

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
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    student_id: '',
    department: '',
    year: ''
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

  const toggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      const newStatus = currentStatus ? 'inactive' : 'active';
      await api.patch(`/members/${id}/status`, { status: newStatus });
      fetchMembers();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update status');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/members', { ...formData, year: parseInt(formData.year) || null });
      setIsModalOpen(false);
      fetchMembers();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to add member');
    }
  };

  if (isLoading) return <div className="p-8 text-center">Loading members...</div>;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Members</h1>
        <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
          <Plus className="-ml-1 mr-2 h-5 w-5" />
          Add Member
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {members.map((member) => (
            <li key={member.id} className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold uppercase">
                  {member.name.substring(0, 2)}
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-900">
                    {member.name}
                  </div>
                  <div className="text-sm text-gray-500">{member.email} | {member.student_id}</div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  member.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {member.status === 'active' ? 'Active' : 'Inactive'}
                </span>
                <span className="text-sm text-gray-500">{member.department} {member.year ? `Year ${member.year}` : ''}</span>
                <button onClick={() => toggleStatus(member.id, member.status === 'active')} className="text-gray-400 hover:text-indigo-600">
                  {member.status === 'active' ? <UserX className="h-5 w-5" title="Deactivate" /> : <UserCheck className="h-5 w-5" title="Activate" />}
                </button>
              </div>
            </li>
          ))}
          {members.length === 0 && (
            <li className="px-6 py-8 text-center text-gray-500">No members found.</li>
          )}
        </ul>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={() => setIsModalOpen(false)} />

          {/* Centering wrapper */}
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <div
              className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg z-10 p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Add New Member</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Student ID</label>
                  <input type="text" required value={formData.student_id} onChange={e => setFormData({...formData, student_id: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Department</label>
                  <input type="text" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Year</label>
                  <input type="number" value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
                <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse gap-2">
                  <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer sm:w-auto sm:text-sm">
                    Save
                  </button>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer sm:mt-0 sm:w-auto sm:text-sm">
                    Cancel
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
