import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import type { Category } from '../../services/api/books';
import { Plus, Edit, Trash2 } from 'lucide-react';

const CategoryList: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Add/Edit State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [modalError, setModalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to fetch categories');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (category?: Category) => {
    setError('');
    setModalError('');
    if (category) {
      setEditingCategory(category);
      setFormData({ name: category.name, description: category.description || '' });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', description: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');
    setIsSubmitting(true);
    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, formData);
      } else {
        await api.post('/categories', formData);
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      setModalError(err.response?.data?.detail || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await api.delete(`/categories/${id}`);
        fetchCategories();
      } catch (err: any) {
        alert(err.response?.data?.detail || 'Delete failed');
      }
    }
  };

  if (isLoading) return <div className="p-8 text-center text-gray-600">Loading categories...</div>;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 cursor-pointer"
        >
          <Plus className="-ml-1 mr-2 h-5 w-5" />
          Add Category
        </button>
      </div>

      {error && <div className="mb-4 text-red-600 bg-red-50 p-4 rounded-md">{error}</div>}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {categories.map((category) => (
            <li key={category.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
              <div>
                <h3 className="text-lg font-medium text-indigo-600">{category.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{category.description}</p>
              </div>
              <div className="flex space-x-3">
                <button onClick={() => handleOpenModal(category)} className="text-gray-400 hover:text-indigo-600 cursor-pointer">
                  <Edit className="h-5 w-5" />
                </button>
                <button onClick={() => handleDelete(category.id)} className="text-gray-400 hover:text-red-600 cursor-pointer">
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </li>
          ))}
          {categories.length === 0 && (
            <li className="px-6 py-8 text-center text-gray-500">No categories found. Create one to get started!</li>
          )}
        </ul>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 transition-opacity"
            aria-hidden="true"
            onClick={() => setIsModalOpen(false)}
          />

          {/* Centering wrapper */}
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <div
              className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4" id="modal-title">
                    {editingCategory ? 'Edit Category' : 'Add Category'}
                  </h3>

                  {modalError && (
                    <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-md">
                      {modalError}
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="e.g. Science Fiction, Computer Science"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        rows={3}
                        placeholder="Brief summary of books in this category"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 cursor-pointer sm:w-auto sm:text-sm"
                  >
                    {isSubmitting ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer sm:mt-0 sm:w-auto sm:text-sm"
                  >
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

export default CategoryList;
