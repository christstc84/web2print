import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiSettings, FiPackage, FiTool } from 'react-icons/fi';
import PrintOptionCategory from '../components/PrintOptions/PrintOptionCategory';
import { PrintOptionCategoryType, PrintOptionCategoryData } from '../types/printOptions';
import { PrintOptionsAPI } from '../services/printOptionsApi';

const PrintOptions: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<PrintOptionCategoryData[]>([]);
  const [loading, setLoading] = useState(true);

  // Default print option categories
  const defaultCategories: PrintOptionCategoryData[] = [
    // Print Options
    {
      id: 'paper',
      name: 'Paper',
      type: 'print_option',
      description: 'Paper types and weights',
      icon: '📄',
      optionCount: 0,
      isActive: true
    },
    {
      id: 'format',
      name: 'Format',
      type: 'print_option',
      description: 'Paper sizes and dimensions',
      icon: '📐',
      optionCount: 0,
      isActive: true
    },
    {
      id: 'colors',
      name: 'Colors',
      type: 'print_option',
      description: 'Color printing options',
      icon: '🎨',
      optionCount: 0,
      isActive: true
    },
    {
      id: 'pages',
      name: 'Pages',
      type: 'print_option',
      description: 'Page printing configurations',
      icon: '📃',
      optionCount: 0,
      isActive: true
    },
    {
      id: 'binding',
      name: 'Binding',
      type: 'print_option',
      description: 'Binding and assembly options',
      icon: '📚',
      optionCount: 0,
      isActive: true
    },
    {
      id: 'refinement',
      name: 'Refinement',
      type: 'print_option',
      description: 'Surface treatments and coatings',
      icon: '✨',
      optionCount: 0,
      isActive: true
    },
    {
      id: 'finishing',
      name: 'Finishing',
      type: 'print_option',
      description: 'Post-processing and finishing',
      icon: '🎯',
      optionCount: 0,
      isActive: true
    },
    // Production Options
    {
      id: 'production',
      name: 'Production',
      type: 'production_option',
      description: 'Production timing and priority',
      icon: '🏭',
      optionCount: 0,
      isActive: true
    },
    {
      id: 'quantity',
      name: 'Quantity',
      type: 'production_option',
      description: 'Quantity tiers and pricing',
      icon: '📊',
      optionCount: 0,
      isActive: true
    },
    {
      id: 'proofing',
      name: 'Proofing',
      type: 'production_option',
      description: 'Proofing and approval options',
      icon: '🔍',
      optionCount: 0,
      isActive: true
    }
  ];

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await PrintOptionsAPI.getAllCategories();
      setCategories(response.categories);
    } catch (error) {
      console.error('Failed to load print option categories:', error);
      // Fallback to default categories if API fails
      setCategories(defaultCategories);
    } finally {
      setLoading(false);
    }
  };

  const printOptionCategories = categories.filter(cat => cat.type === 'print_option');
  const productionOptionCategories = categories.filter(cat => cat.type === 'production_option');

  const handleManageOptions = (category: PrintOptionCategoryData) => {
    console.log('handleManageOptions called with:', category);
    console.log('Navigating to:', `/print-options/${category.id}`);
    navigate(`/print-options/${category.id}`);
  };

  const handleEditCategory = (category: PrintOptionCategoryData) => {
    // TODO: Implement category editing modal
    console.log('Edit category:', category);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading print options...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Print Options</h1>
          <p className="text-gray-600 mt-1">Manage printing and production options</p>
        </div>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2">
          <FiPlus className="text-sm" />
          Add Category
        </button>
      </div>

      {/* Print Options Section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <FiSettings className="text-xl text-indigo-600" />
          <h2 className="text-xl font-semibold text-gray-900">Print Options</h2>
          <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-sm">
            {printOptionCategories.length} categories
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {printOptionCategories.map((category) => (
            <PrintOptionCategory
              key={category.id}
              category={category}
              onEdit={handleEditCategory}
              onManageOptions={handleManageOptions}
            />
          ))}
        </div>
      </div>

      {/* Production Options Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <FiPackage className="text-xl text-green-600" />
          <h2 className="text-xl font-semibold text-gray-900">Production Options</h2>
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
            {productionOptionCategories.length} categories
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {productionOptionCategories.map((category) => (
            <PrintOptionCategory
              key={category.id}
              category={category}
              onEdit={handleEditCategory}
              onManageOptions={handleManageOptions}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PrintOptions;
