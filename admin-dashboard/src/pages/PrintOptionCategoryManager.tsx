import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FiPlus, FiSearch, FiFilter, FiDownload, FiUpload, FiEdit3, 
  FiTrash2, FiArrowLeft, FiCheck, FiX, FiEye, FiEyeOff,
  FiFileText, FiMaximize, FiDroplet, FiLayers, FiBook, 
  FiStar, FiTarget, FiTool, FiBarChart
} from 'react-icons/fi';
import { PrintOptionData, PrintOptionCategoryData } from '../types/printOptions';
import { PrintOptionsAPI } from '../services/printOptionsApi';

const PrintOptionCategoryManager: React.FC = () => {
  console.log('PrintOptionCategoryManager component is rendering!');
  
  const { categoryId } = useParams<{ categoryId: string }>();
  console.log('categoryId from useParams:', categoryId);
  
  const navigate = useNavigate();
  
  // State management
  const [category, setCategory] = useState<PrintOptionCategoryData | null>(null);
  const [options, setOptions] = useState<PrintOptionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Form state for adding new option
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    description: '',
    weight: '',
    purchaseWidth: '',
    purchaseHeight: '',
    pricePerThousandSqFt: '',
    iconFile: null as File | null
  });
  
  // Form submission handler
  const handleSubmitOption = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!category) return;
    
    try {
      console.log('Submitting new option:', formData);
      
      // Prepare option data for API
      const optionData = {
        categoryId: category.id,
        name: formData.name,
        displayName: formData.displayName,
        description: formData.description,
        specifications: category.id === 'paper' ? {
          weight: parseFloat(formData.weight),
          purchaseWidth: parseFloat(formData.purchaseWidth),
          purchaseHeight: parseFloat(formData.purchaseHeight)
        } : {},
        pricing: category.id === 'paper' ? {
          basePrice: parseFloat(formData.pricePerThousandSqFt),
          priceType: 'per_unit' as const
        } : {},
        iconFile: formData.iconFile
      };
      
      // Call API to create option
      await PrintOptionsAPI.createOption(category.id, optionData);
      
      // Reset form and close modal
      setFormData({
        name: '',
        displayName: '',
        description: '',
        weight: '',
        purchaseWidth: '',
        purchaseHeight: '',
        pricePerThousandSqFt: '',
        iconFile: null
      });
      setShowAddModal(false);
      
      // Reload options
      await loadCategoryAndOptions();
    } catch (error) {
      console.error('Failed to add option:', error);
      alert('Failed to add option. Please try again.');
    }
  };
  
  // Icon mapping function
  const renderIcon = (iconName: string) => {
    const iconMap: Record<string, React.ReactElement> = {
      'FiFileText': <FiFileText className="text-2xl" />,
      'FiMaximize': <FiMaximize className="text-2xl" />,
      'FiDroplet': <FiDroplet className="text-2xl" />,
      'FiLayers': <FiLayers className="text-2xl" />,
      'FiBook': <FiBook className="text-2xl" />,
      'FiStar': <FiStar className="text-2xl" />,
      'FiTarget': <FiTarget className="text-2xl" />,
      'FiTool': <FiTool className="text-2xl" />,
      'FiBarChart': <FiBarChart className="text-2xl" />
    };
    
    return iconMap[iconName] || <FiFileText className="text-2xl" />;
  };
  
  // Pagination
  const itemsPerPage = 12;
  const filteredOptions = options.filter(option =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    option.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (option.description && option.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  const totalPages = Math.ceil(filteredOptions.length / itemsPerPage);
  const paginatedOptions = filteredOptions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    if (categoryId) {
      loadCategoryAndOptions();
    }
  }, [categoryId]);

  const loadCategoryAndOptions = async () => {
    try {
      setLoading(true);
      console.log('Loading category and options for:', categoryId);
      
      // Always set a fallback category first to ensure the page renders
      const fallbackCategory = {
        id: categoryId!,
        name: categoryId!.charAt(0).toUpperCase() + categoryId!.slice(1),
        type: 'print_option' as const,
        description: `Manage ${categoryId} options`,
        icon: 'FiFileText',
        optionCount: 0,
        isActive: true
      };
      setCategory(fallbackCategory);
      setOptions([]);
      
      try {
        // Load category details
        console.log('Fetching category details...');
        const categoryData = await PrintOptionsAPI.getCategoryById(categoryId!);
        console.log('Category data received:', categoryData);
        if (categoryData) {
          setCategory(categoryData);
        }
      } catch (categoryError) {
        console.warn('Failed to load category details, using fallback:', categoryError);
      }
      
      try {
        // Load options for this category
        console.log('Fetching options for category...');
        const optionsResponse = await PrintOptionsAPI.getOptionsByCategory(categoryId!, {
          page: currentPage,
          limit: itemsPerPage,
          search: searchTerm
        });
        console.log('Options response received:', optionsResponse);
        
        if (optionsResponse && optionsResponse.options) {
          setOptions(optionsResponse.options);
        }
      } catch (optionsError) {
        console.warn('Failed to load options, showing empty list:', optionsError);
        setOptions([]);
      }
      
    } catch (error) {
      console.error('Unexpected error in loadCategoryAndOptions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mock data generators (replace with API calls later)
  const getMockCategory = (id: string): PrintOptionCategoryData => {
    const categories: Record<string, PrintOptionCategoryData> = {
      paper: {
        id: 'paper',
        name: 'Paper',
        type: 'print_option',
        description: 'Paper types and weights',
        icon: '📄',
        optionCount: 3,
        isActive: true
      },
      format: {
        id: 'format',
        name: 'Format',
        type: 'print_option',
        description: 'Paper sizes and dimensions',
        icon: '📐',
        optionCount: 5,
        isActive: true
      },
      colors: {
        id: 'colors',
        name: 'Colors',
        type: 'print_option',
        description: 'Color printing options',
        icon: '🎨',
        optionCount: 4,
        isActive: true
      },
      pages: {
        id: 'pages',
        name: 'Pages',
        type: 'print_option',
        description: 'Page printing configurations',
        icon: '📃',
        optionCount: 2,
        isActive: true
      },
      binding: {
        id: 'binding',
        name: 'Binding',
        type: 'print_option',
        description: 'Binding and assembly options',
        icon: '📚',
        optionCount: 4,
        isActive: true
      },
      refinement: {
        id: 'refinement',
        name: 'Refinement',
        type: 'print_option',
        description: 'Surface treatments and coatings',
        icon: '✨',
        optionCount: 3,
        isActive: true
      },
      finishing: {
        id: 'finishing',
        name: 'Finishing',
        type: 'print_option',
        description: 'Post-processing and finishing',
        icon: '🎯',
        optionCount: 5,
        isActive: true
      },
      production: {
        id: 'production',
        name: 'Production',
        type: 'production_option',
        description: 'Production timing and priority',
        icon: '🏭',
        optionCount: 3,
        isActive: true
      },
      quantity: {
        id: 'quantity',
        name: 'Quantity',
        type: 'production_option',
        description: 'Quantity tiers and pricing',
        icon: '📊',
        optionCount: 6,
        isActive: true
      },
      proofing: {
        id: 'proofing',
        name: 'Proofing',
        type: 'production_option',
        description: 'Proofing and approval options',
        icon: '🔍',
        optionCount: 3,
        isActive: true
      }
    };
    return categories[id] || {
      id: id,
      name: id.charAt(0).toUpperCase() + id.slice(1),
      type: 'print_option',
      description: `${id.charAt(0).toUpperCase() + id.slice(1)} options`,
      icon: '📄',
      optionCount: 0,
      isActive: true
    };
  };

  const getMockOptions = (categoryId: string): PrintOptionData[] => {
    const mockData: Record<string, PrintOptionData[]> = {
      paper: [
        {
          id: '1',
          categoryId: 'paper',
          name: '70lb_glossy',
          displayName: '70lb Glossy',
          description: 'High-quality glossy paper for vibrant colors',
          specifications: {
            weight: 70,
            weightUnit: 'lb',
            finish: 'glossy',
            color: 'white'
          },
          pricing: {
            basePrice: 0.15,
            priceType: 'per_sheet'
          },
          isActive: true,
          sortOrder: 1
        },
        {
          id: '2',
          categoryId: 'paper',
          name: '90lb_matte',
          displayName: '90lb Matte',
          description: 'Premium matte finish paper',
          specifications: {
            weight: 90,
            weightUnit: 'lb',
            finish: 'matte',
            color: 'white'
          },
          pricing: {
            basePrice: 0.22,
            priceType: 'per_sheet'
          },
          isActive: true,
          sortOrder: 2
        },
        {
          id: '3',
          categoryId: 'paper',
          name: '110lb_cardstock',
          displayName: '110lb Cardstock',
          description: 'Heavy cardstock for business cards and postcards',
          specifications: {
            weight: 110,
            weightUnit: 'lb',
            finish: 'matte',
            color: 'white'
          },
          pricing: {
            basePrice: 0.35,
            priceType: 'per_sheet'
          },
          isActive: true,
          sortOrder: 3
        }
      ],
      format: [
        {
          id: '4',
          categoryId: 'format',
          name: 'letter',
          displayName: 'Letter (8.5" x 11")',
          description: 'Standard letter size',
          specifications: {
            width: 8.5,
            height: 11,
            unit: 'in',
            orientation: 'portrait',
            standardSize: 'Letter'
          },
          pricing: {
            basePrice: 0,
            priceType: 'fixed'
          },
          isActive: true,
          sortOrder: 1
        },
        {
          id: '5',
          categoryId: 'format',
          name: 'tabloid',
          displayName: 'Tabloid (11" x 17")',
          description: 'Large format printing',
          specifications: {
            width: 11,
            height: 17,
            unit: 'in',
            orientation: 'portrait',
            standardSize: 'Tabloid'
          },
          pricing: {
            basePrice: 0.50,
            priceType: 'per_sheet'
          },
          isActive: true,
          sortOrder: 2
        },
        {
          id: '6',
          categoryId: 'format',
          name: 'business_card',
          displayName: 'Business Card (2" x 3.5")',
          description: 'Standard business card size',
          specifications: {
            width: 2,
            height: 3.5,
            unit: 'in',
            orientation: 'landscape'
          },
          pricing: {
            basePrice: 0.08,
            priceType: 'per_unit'
          },
          isActive: true,
          sortOrder: 3
        },
        {
          id: '7',
          categoryId: 'format',
          name: 'postcard',
          displayName: 'Postcard (4" x 6")',
          description: 'Standard postcard size',
          specifications: {
            width: 4,
            height: 6,
            unit: 'in',
            orientation: 'landscape'
          },
          pricing: {
            basePrice: 0.25,
            priceType: 'per_unit'
          },
          isActive: true,
          sortOrder: 4
        },
        {
          id: '8',
          categoryId: 'format',
          name: 'a4',
          displayName: 'A4 (210mm x 297mm)',
          description: 'International A4 size',
          specifications: {
            width: 210,
            height: 297,
            unit: 'mm',
            orientation: 'portrait',
            standardSize: 'A4'
          },
          pricing: {
            basePrice: 0.05,
            priceType: 'per_sheet'
          },
          isActive: true,
          sortOrder: 5
        }
      ],
      colors: [
        {
          id: '9',
          categoryId: 'colors',
          name: 'full_color',
          displayName: 'Full Color (CMYK)',
          description: 'Full 4-color process printing',
          specifications: {
            colorType: 'full_color',
            colorSpace: 'CMYK',
            inkCoverage: 100
          },
          pricing: {
            basePrice: 0.25,
            priceType: 'per_sheet'
          },
          isActive: true,
          sortOrder: 1
        },
        {
          id: '10',
          categoryId: 'colors',
          name: 'black_white',
          displayName: 'Black & White',
          description: 'Single color black printing',
          specifications: {
            colorType: 'black_white',
            colorSpace: 'CMYK',
            inkCoverage: 25
          },
          pricing: {
            basePrice: 0.08,
            priceType: 'per_sheet'
          },
          isActive: true,
          sortOrder: 2
        },
        {
          id: '11',
          categoryId: 'colors',
          name: 'spot_color',
          displayName: 'Spot Color',
          description: 'Single Pantone spot color',
          specifications: {
            colorType: 'spot_color',
            colorSpace: 'Pantone',
            inkCoverage: 50
          },
          pricing: {
            basePrice: 0.15,
            priceType: 'per_sheet'
          },
          isActive: true,
          sortOrder: 3
        },
        {
          id: '12',
          categoryId: 'colors',
          name: 'two_color',
          displayName: 'Two Color',
          description: 'Two color printing (e.g., black + spot)',
          specifications: {
            colorType: 'spot_color',
            colorSpace: 'CMYK',
            inkCoverage: 75
          },
          pricing: {
            basePrice: 0.18,
            priceType: 'per_sheet'
          },
          isActive: true,
          sortOrder: 4
        }
      ]
    };
    
    return mockData[categoryId] || [];
  };

  const handleSelectAll = () => {
    if (selectedOptions.length === paginatedOptions.length) {
      setSelectedOptions([]);
    } else {
      setSelectedOptions(paginatedOptions.map(option => option.id));
    }
  };

  const handleSelectOption = (optionId: string) => {
    setSelectedOptions(prev =>
      prev.includes(optionId)
        ? prev.filter(id => id !== optionId)
        : [...prev, optionId]
    );
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedOptions.length} option(s)?`)) return;
    
    try {
      // TODO: API call for bulk delete
      setOptions(prev => prev.filter(option => !selectedOptions.includes(option.id)));
      setSelectedOptions([]);
    } catch (error) {
      console.error('Failed to delete options:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading {categoryId} options...</div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Category Not Found</h1>
          <p className="text-gray-600 mb-4">The requested category could not be found.</p>
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
              <span className="text-indigo-600">
                {renderIcon(category.icon)}
              </span>
              <h1 className="text-2xl font-bold text-gray-900">{category.name} Options</h1>
            </div>
            <p className="text-gray-600">{category.description}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setShowImportModal(true)}
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
            Add {category?.name || 'Option'}
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${category.name.toLowerCase()} options...`}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div className="text-sm text-gray-600">
            {filteredOptions.length} of {options.length} options
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedOptions.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {selectedOptions.length} selected
            </span>
            <button
              onClick={handleBulkDelete}
              className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2 text-sm"
            >
              <FiTrash2 className="text-sm" />
              Delete Selected
            </button>
          </div>
        )}
      </div>

      {/* Options Grid */}
      <div className="mb-6">
        {/* Select All Header */}
        {paginatedOptions.length > 0 && (
          <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              checked={selectedOptions.length === paginatedOptions.length && paginatedOptions.length > 0}
              onChange={handleSelectAll}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Select All ({paginatedOptions.length} items)
            </span>
          </div>
        )}

        {/* Options List */}
        {paginatedOptions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedOptions.map((option) => (
              <div
                key={option.id}
                className={`border rounded-lg p-4 transition-all duration-200 hover:shadow-md ${
                  option.isActive ? 'border-gray-200 bg-white' : 'border-gray-200 bg-gray-50 opacity-75'
                }`}
              >
                {/* Option Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedOptions.includes(option.id)}
                      onChange={() => handleSelectOption(option.id)}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <h3 className={`font-semibold ${option.isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                        {option.displayName}
                      </h3>
                      {option.description && (
                        <p className={`text-sm ${option.isActive ? 'text-gray-600' : 'text-gray-400'}`}>
                          {option.description}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-1">
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <FiEdit3 className="text-sm" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-red-600">
                      <FiTrash2 className="text-sm" />
                    </button>
                  </div>
                </div>

                {/* Option Specifications */}
                <div className="space-y-2 mb-3">
                  {option.specifications.weight && (
                    <div className="text-sm">
                      <span className="font-medium">Weight:</span> {option.specifications.weight}{option.specifications.weightUnit}
                    </div>
                  )}
                  {option.specifications.finish && (
                    <div className="text-sm">
                      <span className="font-medium">Finish:</span> {option.specifications.finish}
                    </div>
                  )}
                  {option.pricing.basePrice && (
                    <div className="text-sm">
                      <span className="font-medium">Price:</span> ${option.pricing.basePrice} {option.pricing.priceType?.replace('_', ' ')}
                    </div>
                  )}
                </div>

                {/* Status Badge */}
                <div className="flex justify-between items-center">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    option.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {option.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <span className="text-indigo-600">
                {renderIcon(category.icon)}
              </span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {category.name.toLowerCase()} options found
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? 'Try adjusting your search terms.' : `Get started by adding your first ${category.name.toLowerCase()} option.`}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
              >
                Add First {category.name}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredOptions.length)} of {filteredOptions.length} options
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 text-sm rounded-lg ${
                    currentPage === page
                      ? 'bg-indigo-600 text-white'
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* TODO: Add Import Modal */}
      {/* Add Option Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Add New {category?.name || 'Option'}
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX className="text-xl text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleSubmitOption} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g., premium-matte"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Name *
                  </label>
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g., Premium Matte Paper"
                    required
                  />
                </div>
              </div>

              {/* Paper-specific fields */}
              {category?.id === 'paper' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Weight (gsm) *
                      </label>
                      <input
                        type="number"
                        value={formData.weight}
                        onChange={(e) => setFormData({...formData, weight: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="e.g., 250"
                        min="1"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Purchase Width (inches) *
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.purchaseWidth}
                        onChange={(e) => setFormData({...formData, purchaseWidth: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="e.g., 36.0"
                        min="0.1"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Purchase Height (inches) *
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.purchaseHeight}
                        onChange={(e) => setFormData({...formData, purchaseHeight: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="e.g., 24.0"
                        min="0.1"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Icon Image
                      </label>
                      <div className="space-y-2">
                        <input
                          type="file"
                          accept=".png,.webp,image/png,image/webp"
                          onChange={(e) => setFormData({...formData, iconFile: e.target.files?.[0] || null})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                        />
                        <p className="text-xs text-gray-500">
                          Upload PNG or WebP image (max 2MB)
                        </p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price per 1000 ft² *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.pricePerThousandSqFt}
                          onChange={(e) => setFormData({...formData, pricePerThousandSqFt: e.target.value})}
                          className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="0.00"
                          min="0"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Optional description for this option..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Add {category?.name || 'Option'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrintOptionCategoryManager;
