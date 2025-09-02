import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FiPlus, FiSearch, FiUpload, FiArrowLeft, FiTrash2
} from 'react-icons/fi';
import { PrintOptionData, PrintOptionCategoryData } from '../types/printOptions';
import { PrintOptionsAPI } from '../services/printOptionsApi';
import { PrintOptionForm } from '../components/PrintOptions/PrintOptionForm';
import { PrintOptionList } from '../components/PrintOptions/PrintOptionList';

const PrintOptionCategoryManager: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();

  // State
  const [category, setCategory] = useState<PrintOptionCategoryData | null>(null);
  const [options, setOptions] = useState<PrintOptionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingOption, setEditingOption] = useState<PrintOptionData | null>(null);
  
  // Search and selection
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  // Load category and options
  const loadCategoryAndOptions = async () => {
    if (!categoryId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Load category data
      const categoryData = await PrintOptionsAPI.getCategoryById(categoryId);
      setCategory(categoryData);
      
      // Load options for this category
      const optionsResponse = await PrintOptionsAPI.getOptionsByCategory(categoryId, {
        page: 1,
        limit: 100,
        search: searchTerm
      });
      
      setOptions(optionsResponse.options || []);
    } catch (error) {
      console.error('Failed to load category and options:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategoryAndOptions();
  }, [categoryId, searchTerm]);

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedOptions.length === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedOptions.length} option(s)?`)) return;
    
    try {
      await PrintOptionsAPI.bulkDeleteOptions(selectedOptions);
      setSelectedOptions([]);
      await loadCategoryAndOptions();
    } catch (error) {
      console.error('Failed to bulk delete options:', error);
      alert('Failed to delete options. Please try again.');
    }
  };

  // Handle edit option
  const handleEditOption = (option: PrintOptionData) => {
    setEditingOption(option);
    // TODO: Implement edit modal
    console.log('Edit option:', option);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {error || 'Category Not Found'}
          </h1>
          <p className="text-gray-600 mb-4">
            {error || 'The requested category could not be found.'}
          </p>
          <button
            onClick={() => navigate('/print-options')}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Back to Print Options
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/print-options')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiArrowLeft className="text-xl text-gray-600" />
          </button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-indigo-600 text-2xl">📄</span>
              <h1 className="text-2xl font-bold text-gray-900">{category.name} Options</h1>
            </div>
            <p className="text-gray-600">{category.description}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => {/* TODO: Import modal */}}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <FiUpload className="text-sm" />
            Import
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
          >
            <FiPlus className="text-sm" />
            Add {category.name}
          </button>
        </div>
      </div>

      {/* Search and Actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${category.name.toLowerCase()} options...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-80"
            />
          </div>
        </div>

        {selectedOptions.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {selectedOptions.length} selected
            </span>
            <button
              onClick={handleBulkDelete}
              className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2"
            >
              <FiTrash2 className="text-sm" />
              Delete Selected
            </button>
          </div>
        )}
      </div>

      {/* Options List */}
      <PrintOptionList
        options={options}
        selectedOptions={selectedOptions}
        onSelectionChange={setSelectedOptions}
        onEdit={handleEditOption}
        onRefresh={loadCategoryAndOptions}
      />

      {/* Add Option Modal */}
      <PrintOptionForm
        category={category}
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={loadCategoryAndOptions}
      />
    </div>
  );
};

export default PrintOptionCategoryManager;
