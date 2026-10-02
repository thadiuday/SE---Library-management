import React, { useState, useEffect } from 'react';
import { BookOpen, Users, BookDown, DollarSign } from 'lucide-react';
import api from '../../services/api';
import { bookService } from '../../services/api/books';
import { transactionService } from '../../services/api/transactions';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalBooks: 0,
    activeMembers: 0,
    activeBorrows: 0,
    unpaidFines: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      
      const [booksRes, membersRes, transactionsRes, finesRes] = await Promise.all([
        bookService.getBooks({ page_size: 1 }), // Just need total
        api.get('/members', { params: { page_size: 1 } }), // Just need total
        transactionService.getTransactions(),
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
    } catch (error) {
      console.error('Failed to load dashboard stats', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    { name: 'Total Books', value: stats.totalBooks, icon: BookOpen, color: 'bg-blue-500', link: '/admin/books' },
    { name: 'Total Members', value: stats.activeMembers, icon: Users, color: 'bg-green-500', link: '/admin/members' },
    { name: 'Active Borrows', value: stats.activeBorrows, icon: BookDown, color: 'bg-purple-500', link: '/admin/transactions' },
    { name: 'Unpaid Fines', value: `$${stats.unpaidFines.toFixed(2)}`, icon: DollarSign, color: 'bg-red-500', link: '/admin/fines' },
  ];

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading dashboard...</div>;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Link key={card.name} to={card.link} className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow cursor-pointer">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`rounded-md p-3 ${card.color}`}>
                    <card.icon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{card.name}</dt>
                    <dd className="text-2xl font-semibold text-gray-900">{card.value}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      <div className="mt-8 bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Welcome to Library Management System</h2>
        <p className="text-gray-600">
          From this dashboard, you can manage the entire library catalog, register new members, issue and return books, and manage overdue fines. Use the sidebar on the left to navigate through the different modules.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
