import React, { useState, useEffect } from 'react';
import { transactionService } from '../../services/api/transactions';
import type { BorrowTransaction } from '../../services/api/transactions';
import { bookService } from '../../services/api/books';
import type { Book } from '../../services/api/books';
import api from '../../services/api'; // for fetching members
import { Plus, Check, Clock } from 'lucide-react';
import type { Member } from './MemberList';

const TransactionList: React.FC = () => {
  const [transactions, setTransactions] = useState<BorrowTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Issue Book Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [books, setBooks] = useState<Book[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [formData, setFormData] = useState({ member_id: 0, book_id: 0 });

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const data = await transactionService.getTransactions();
      setTransactions(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch transactions');
    } finally {
      setIsLoading(false);
    }
  };

  const loadFormData = async () => {
    try {
      const booksData = await bookService.getBooks({ available: true, page_size: 100 });
      setBooks(booksData.items);
      const membersData = await api.get('/members', { params: { page_size: 100 } });
      setMembers(membersData.data.items);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenModal = () => {
    loadFormData();
    setIsModalOpen(true);
  };

  const handleIssueBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.member_id || !formData.book_id) return alert('Select member and book');
    try {
      await transactionService.issueBook(formData);
      setIsModalOpen(false);
      setFormData({ member_id: 0, book_id: 0 });
      fetchTransactions();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to issue book');
    }
  };

  const handleReturnBook = async (id: number) => {
    if (window.confirm('Confirm returning this book?')) {
      try {
        const result = await transactionService.returnBook(id);
        if (result.fine) {
          alert(`Book returned, but a fine of $${result.fine.amount} was generated for ${result.fine.overdue_days} overdue days.`);
        } else {
          alert('Book returned successfully with no fine!');
        }
        fetchTransactions();
      } catch (err: any) {
        alert(err.response?.data?.detail || 'Failed to return book');
      }
    }
  };

  if (isLoading) return <div className="p-8 text-center">Loading transactions...</div>;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Borrow Transactions</h1>
        <button onClick={handleOpenModal} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
          <Plus className="-ml-1 mr-2 h-5 w-5" />
          Issue Book
        </button>
      </div>

      {error && <div className="mb-4 text-red-600 bg-red-50 p-4 rounded-md">{error}</div>}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {transactions.map((t) => (
            <li key={t.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{t.book?.title}</h3>
                <p className="text-sm text-gray-500">
                  Member: {t.member?.name} ({t.member?.student_id})
                </p>
                <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center"><Clock className="mr-1 h-4 w-4" /> Issued: {t.issue_date}</span>
                  <span className={`flex items-center ${new Date(t.due_date) < new Date() && t.status === 'issued' ? 'text-red-600 font-bold' : ''}`}>
                    Due: {t.due_date}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${t.status === 'returned' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {t.status.toUpperCase()}
                </span>
                {t.status === 'issued' && (
                  <button onClick={() => handleReturnBook(t.id)} className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-900">
                    <Check className="mr-1 h-4 w-4" /> Return Book
                  </button>
                )}
              </div>
            </li>
          ))}
          {transactions.length === 0 && <li className="px-6 py-8 text-center text-gray-500">No transactions found.</li>}
        </ul>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-modal="true">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/50 transition-opacity" onClick={() => setIsModalOpen(false)} />

          {/* Centering wrapper */}
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <div
              className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <form onSubmit={handleIssueBook}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Issue Book</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Member</label>
                      <select required value={formData.member_id} onChange={(e) => setFormData({...formData, member_id: Number(e.target.value)})} className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                        <option value="">Select Member...</option>
                        {members.map(m => <option key={m.id} value={m.id}>{m.name} [ID: {m.student_id}]</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Book (Only available books shown)</label>
                      <select required value={formData.book_id} onChange={(e) => setFormData({...formData, book_id: Number(e.target.value)})} className="mt-1 block w-full border border-gray-300 rounded-md p-2">
                        <option value="">Select Book...</option>
                        {books.map(b => <option key={b.id} value={b.id}>{b.title} (Available: {b.available_copies})</option>)}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
                  <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer sm:w-auto">Issue</button>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50 cursor-pointer sm:mt-0 sm:w-auto">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionList;
