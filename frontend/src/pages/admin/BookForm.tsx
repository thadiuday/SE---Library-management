import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { bookService } from '../../services/api/books';
import type { Book, Category } from '../../services/api/books';
import { ArrowLeft, Save } from 'lucide-react';

const BookForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const navigate = useNavigate();

  const [formData, setFormData] = useState<Partial<Book>>({
    isbn: '',
    title: '',
    author: '',
    category_id: undefined,
    publisher: '',
    publication_year: new Date().getFullYear(),
    description: '',
    total_copies: 1,
    shelf_location: ''
  });
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        const cats = await bookService.getCategories();
        setCategories(cats);
        
        if (isEditing && id) {
          const book = await bookService.getBook(parseInt(id));
          setFormData(book);
        }
      } catch (err: any) {
        setError('Failed to load data');
      }
    };
    init();
  }, [id, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'category_id' || name === 'publication_year' || name === 'total_copies' 
        ? (value ? parseInt(value) : undefined) 
        : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isEditing && id) {
        await bookService.updateBook(parseInt(id), formData);
      } else {
        await bookService.createBook(formData);
      }
      navigate('/admin/books');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'An error occurred while saving the book');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Link to="/admin/books" className="text-gray-500 hover:text-indigo-600 transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <h2 className="text-2xl font-semibold text-gray-800">
          {isEditing ? 'Edit Book' : 'Add New Book'}
        </h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input required type="text" name="title" value={formData.title || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Author *</label>
              <input required type="text" name="author" value={formData.author || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ISBN *</label>
              <input required type="text" name="isbn" value={formData.isbn || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select name="category_id" value={formData.category_id || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
                <option value="">Select a category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Copies *</label>
              <input required type="number" min="1" name="total_copies" value={formData.total_copies || 1} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Publisher</label>
              <input type="text" name="publisher" value={formData.publisher || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Publication Year</label>
              <input type="number" name="publication_year" value={formData.publication_year || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500" />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Shelf Location</label>
              <input type="text" name="shelf_location" value={formData.shelf_location || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-400" placeholder="e.g., A-101" />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea name="description" rows={3} value={formData.description || ''} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"></textarea>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button disabled={loading} type="submit" className="flex items-center space-x-2 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50">
              <Save size={20} />
              <span>{loading ? 'Saving...' : 'Save Book'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookForm;
