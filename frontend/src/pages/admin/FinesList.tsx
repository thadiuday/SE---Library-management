import React, { useState, useEffect } from 'react';
import { transactionService } from '../../services/api/transactions';
import type { Fine } from '../../services/api/transactions';
import { DollarSign, CheckCircle } from 'lucide-react';

const FinesList: React.FC = () => {
  const [fines, setFines] = useState<Fine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFines();
  }, []);

  const fetchFines = async () => {
    try {
      setIsLoading(true);
      const data = await transactionService.getFines();
      setFines(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch fines');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayFine = async (id: number) => {
    if (window.confirm('Mark this fine as paid?')) {
      try {
        await transactionService.payFine(id);
        alert('Fine marked as paid!');
        fetchFines();
      } catch (err: any) {
        alert(err.response?.data?.detail || 'Failed to pay fine');
      }
    }
  };

  if (isLoading) return <div className="p-8 text-center">Loading fines...</div>;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Fines</h1>
      </div>

      {error && <div className="mb-4 text-red-600 bg-red-50 p-4 rounded-md">{error}</div>}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {fines.map((fine) => (
            <li key={fine.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
              <div>
                <h3 className="text-lg font-bold text-red-600 flex items-center">
                  <DollarSign className="h-5 w-5 mr-1" />
                  {fine.amount.toFixed(2)}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Overdue by {fine.overdue_days} days (Transaction #{fine.transaction_id})
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  fine.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {fine.status.toUpperCase()}
                </span>
                {fine.status === 'unpaid' && (
                  <button onClick={() => handlePayFine(fine.id)} className="inline-flex items-center text-sm text-green-600 hover:text-green-900">
                    <CheckCircle className="mr-1 h-4 w-4" /> Mark Paid
                  </button>
                )}
              </div>
            </li>
          ))}
          {fines.length === 0 && (
            <li className="px-6 py-8 text-center text-gray-500">No fines found. Excellent!</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default FinesList;
