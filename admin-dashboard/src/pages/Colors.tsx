import { useState, useEffect } from 'react';
import { FiPlus, FiX, FiTrash2, FiEdit3, FiUpload } from 'react-icons/fi';
import { ColorAPI } from '../services/api';
import { getCSSColor, getHexColor, convertColor, ColorSpace } from '../utils/colorSpace';

interface Color {
  id?: number;
  name: string;
  display_name: string;
  rgb_r: number;
  rgb_g: number;
  rgb_b: number;
  cmyk_c: number;
  cmyk_m: number;
  cmyk_y: number;
  cmyk_k: number;
  spot_color?: string;
  color_space?: ColorSpace;
  created_at?: string;
}

const Colors = () => {
  const [colors, setColors] = useState<Color[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingColor, setEditingColor] = useState<Color | null>(null);
  const [formData, setFormData] = useState<Partial<Color>>({
    name: '',
    display_name: '',
    rgb_r: 0,
    rgb_g: 0,
    rgb_b: 0,
    cmyk_c: 0,
    cmyk_m: 0,
    cmyk_y: 0,
    cmyk_k: 0,
    spot_color: '',
    color_space: 'Adobe RGB'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<Color[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [colorSpaceFilter, setColorSpaceFilter] = useState<'all' | 'Adobe RGB' | 'sRGB'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12); // 12 colors per page (4x3 grid)

  // Filter and pagination logic (must be here before functions that use them)
  const filteredColors = colors.filter(color => {
    const matchesSearch = searchTerm === '' || 
      color.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      color.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      color.spot_color?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesColorSpace = colorSpaceFilter === 'all' || 
      (color.color_space || 'Adobe RGB') === colorSpaceFilter;
    
    return matchesSearch && matchesColorSpace;
  });

  const totalPages = Math.ceil(filteredColors.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedColors = filteredColors.slice(startIndex, startIndex + itemsPerPage);

  // Load colors from database
  useEffect(() => {
    loadColors();
  }, []);

  const loadColors = async () => {
    try {
      const colors = await ColorAPI.getAllColors();
      setColors(colors);
    } catch (error) {
      console.error('Failed to load colors:', error);
    }
  };

  const handleAddColor = () => {
    setEditingColor(null);
    setFormData({
      name: '',
      display_name: '',
      rgb_r: 0,
      rgb_g: 0,
      rgb_b: 0,
      cmyk_c: 0,
      cmyk_m: 0,
      cmyk_y: 0,
      cmyk_k: 0,
      spot_color: ''
    });
    setErrors({});
    setShowModal(true);
  };

  const handleEditColor = (color: Color) => {
    setEditingColor(color);
    setFormData(color);
    setErrors({});
    setShowModal(true);
  };

  const handleDeleteColor = async (colorId: number) => {
    if (!confirm('Are you sure you want to delete this color?')) return;
    
    try {
      await ColorAPI.deleteColor(colorId);
      // Reload colors from database to ensure sync
      await loadColors();
    } catch (error) {
      console.error('Failed to delete color:', error);
      alert('Failed to delete color. Please try again.');
    }
  };

  // Bulk selection functions
  const handleSelectColor = (colorId: number, checked: boolean) => {
    const newSelected = new Set(selectedColors);
    if (checked) {
      newSelected.add(colorId);
    } else {
      newSelected.delete(colorId);
    }
    setSelectedColors(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Select all visible (paginated) colors
      const visibleIds = new Set(paginatedColors.map(color => color.id!));
      setSelectedColors(prev => new Set([...prev, ...visibleIds]));
    } else {
      // Deselect all visible (paginated) colors
      const visibleIds = new Set(paginatedColors.map(color => color.id!));
      setSelectedColors(prev => new Set([...prev].filter(id => !visibleIds.has(id))));
    }
    setSelectAll(checked);
  };

  // Update select all state when selections or pagination changes
  useEffect(() => {
    const visibleIds = paginatedColors.map(color => color.id!);
    const selectedVisibleCount = visibleIds.filter(id => selectedColors.has(id)).length;
    setSelectAll(selectedVisibleCount === paginatedColors.length && paginatedColors.length > 0);
  }, [selectedColors, paginatedColors]);

  const handleBulkDelete = async () => {
    if (selectedColors.size === 0) return;
    
    const confirmMessage = `Are you sure you want to delete ${selectedColors.size} selected color${selectedColors.size > 1 ? 's' : ''}?`;
    if (!confirm(confirmMessage)) return;

    try {
      // Delete all selected colors
      const deletePromises = Array.from(selectedColors).map(colorId => 
        ColorAPI.deleteColor(colorId)
      );
      await Promise.all(deletePromises);
      
      // Clear selection and reload colors
      setSelectedColors(new Set());
      setSelectAll(false);
      await loadColors();
    } catch (error) {
      console.error('Failed to delete colors:', error);
      alert('Failed to delete some colors. Please try again.');
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Color name is required';
    }

    if (!formData.display_name?.trim()) {
      newErrors.display_name = 'Display name is required';
    }

    // Validate RGB values (0-255)
    if (formData.rgb_r! < 0 || formData.rgb_r! > 255) {
      newErrors.rgb_r = 'RGB Red must be between 0-255';
    }
    if (formData.rgb_g! < 0 || formData.rgb_g! > 255) {
      newErrors.rgb_g = 'RGB Green must be between 0-255';
    }
    if (formData.rgb_b! < 0 || formData.rgb_b! > 255) {
      newErrors.rgb_b = 'RGB Blue must be between 0-255';
    }

    // Validate CMYK values (0-100)
    if (formData.cmyk_c! < 0 || formData.cmyk_c! > 100) {
      newErrors.cmyk_c = 'CMYK Cyan must be between 0-100';
    }
    if (formData.cmyk_m! < 0 || formData.cmyk_m! > 100) {
      newErrors.cmyk_m = 'CMYK Magenta must be between 0-100';
    }
    if (formData.cmyk_y! < 0 || formData.cmyk_y! > 100) {
      newErrors.cmyk_y = 'CMYK Yellow must be between 0-100';
    }
    if (formData.cmyk_k! < 0 || formData.cmyk_k! > 100) {
      newErrors.cmyk_k = 'CMYK Black must be between 0-100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      if (editingColor) {
        await ColorAPI.updateColor(editingColor.id!, formData as any);
        await loadColors(); // Reload to get updated data
      } else {
        await ColorAPI.createColor(formData as any);
        await loadColors(); // Reload to get new data
      }
      
      setShowModal(false);
      setEditingColor(null);
    } catch (error) {
      console.error('Failed to save color:', error);
    }
  };

  const handleInputChange = (field: keyof Color, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getRgbColor = (color: Color) => {
    const colorSpace = color.color_space || 'Adobe RGB';
    return getCSSColor(color.rgb_r, color.rgb_g, color.rgb_b, colorSpace);
  };

  const getHexColorForColor = (color: Color) => {
    const colorSpace = color.color_space || 'Adobe RGB';
    return getHexColor(color.rgb_r, color.rgb_g, color.rgb_b, colorSpace);
  };

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, colorSpaceFilter]);

  // Reset selections when page changes
  useEffect(() => {
    setSelectedColors(new Set());
    setSelectAll(false);
  }, [currentPage, searchTerm, colorSpaceFilter]);

  // Import file handling
  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFile(file);
    setImportErrors([]);
    setImportPreview([]);

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!['csv', 'json'].includes(fileExtension || '')) {
      setImportErrors(['Only CSV and JSON files are supported']);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        let parsedColors: Color[] = [];

        if (fileExtension === 'json') {
          parsedColors = parseJsonColors(content);
        } else if (fileExtension === 'csv') {
          parsedColors = parseCsvColors(content);
        }

        setImportPreview(parsedColors);
      } catch (error) {
        setImportErrors([`Failed to parse ${fileExtension?.toUpperCase() || 'file'}: ${error instanceof Error ? error.message : 'Unknown error'}`]);
      }
    };
    reader.readAsText(file);
  };

  const parseJsonColors = (content: string): Color[] => {
    const data = JSON.parse(content);
    const colors = Array.isArray(data) ? data : [data];
    const errors: string[] = [];
    
    const parsedColors = colors.map((item: any, index: number) => {
      const color: Partial<Color> = {
        name: item.name || item.colorName || `imported-color-${index + 1}`,
        display_name: item.display_name || item.displayName || item.name || `Imported Color ${index + 1}`,
        rgb_r: parseFloat(item.rgb_r || item.r || item.red || 0),
        rgb_g: parseFloat(item.rgb_g || item.g || item.green || 0),
        rgb_b: parseFloat(item.rgb_b || item.b || item.blue || 0),
        cmyk_c: parseFloat(item.cmyk_c || item.c || item.cyan || 0),
        cmyk_m: parseFloat(item.cmyk_m || item.m || item.magenta || 0),
        cmyk_y: parseFloat(item.cmyk_y || item.y || item.yellow || 0),
        cmyk_k: parseFloat(item.cmyk_k || item.k || item.black || 0),
        spot_color: item.spot_color || item.spotColor || '',
        color_space: (item.color_space || item.colorSpace || 'Adobe RGB') as ColorSpace
      };

      // Validate ranges
      if (color.rgb_r! < 0 || color.rgb_r! > 255) errors.push(`Row ${index + 1}: RGB Red must be 0-255`);
      if (color.rgb_g! < 0 || color.rgb_g! > 255) errors.push(`Row ${index + 1}: RGB Green must be 0-255`);
      if (color.rgb_b! < 0 || color.rgb_b! > 255) errors.push(`Row ${index + 1}: RGB Blue must be 0-255`);
      if (color.cmyk_c! < 0 || color.cmyk_c! > 100) errors.push(`Row ${index + 1}: CMYK Cyan must be 0-100`);
      if (color.cmyk_m! < 0 || color.cmyk_m! > 100) errors.push(`Row ${index + 1}: CMYK Magenta must be 0-100`);
      if (color.cmyk_y! < 0 || color.cmyk_y! > 100) errors.push(`Row ${index + 1}: CMYK Yellow must be 0-100`);
      if (color.cmyk_k! < 0 || color.cmyk_k! > 100) errors.push(`Row ${index + 1}: CMYK Black must be 0-100`);

      return color as Color;
    });

    if (errors.length > 0) {
      setImportErrors(errors);
    }

    return parsedColors;
  };

  const parseCsvColors = (content: string): Color[] => {
    const lines = content.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const errors: string[] = [];
    
    const parsedColors = lines.slice(1).map((line, index) => {
      const values = line.split(',').map(v => v.trim());
      const row: any = {};
      
      headers.forEach((header, i) => {
        row[header] = values[i] || '';
      });

      const color: Partial<Color> = {
        name: row.name || row.colorname || `imported-color-${index + 1}`,
        display_name: row.display_name || row.displayname || row.name || `Imported Color ${index + 1}`,
        rgb_r: parseFloat(row.rgb_r || row.r || row.red || 0),
        rgb_g: parseFloat(row.rgb_g || row.g || row.green || 0),
        rgb_b: parseFloat(row.rgb_b || row.b || row.blue || 0),
        cmyk_c: parseFloat(row.cmyk_c || row.c || row.cyan || 0),
        cmyk_m: parseFloat(row.cmyk_m || row.m || row.magenta || 0),
        cmyk_y: parseFloat(row.cmyk_y || row.y || row.yellow || 0),
        cmyk_k: parseFloat(row.cmyk_k || row.k || row.black || 0),
        spot_color: row.spot_color || row.spotcolor || '',
        color_space: (row.color_space || row.colorspace || 'Adobe RGB') as ColorSpace
      };

      // Validate ranges
      if (color.rgb_r! < 0 || color.rgb_r! > 255) errors.push(`Row ${index + 2}: RGB Red must be 0-255`);
      if (color.rgb_g! < 0 || color.rgb_g! > 255) errors.push(`Row ${index + 2}: RGB Green must be 0-255`);
      if (color.rgb_b! < 0 || color.rgb_b! > 255) errors.push(`Row ${index + 2}: RGB Blue must be 0-255`);
      if (color.cmyk_c! < 0 || color.cmyk_c! > 100) errors.push(`Row ${index + 2}: CMYK Cyan must be 0-100`);
      if (color.cmyk_m! < 0 || color.cmyk_m! > 100) errors.push(`Row ${index + 2}: CMYK Magenta must be 0-100`);
      if (color.cmyk_y! < 0 || color.cmyk_y! > 100) errors.push(`Row ${index + 2}: CMYK Yellow must be 0-100`);
      if (color.cmyk_k! < 0 || color.cmyk_k! > 100) errors.push(`Row ${index + 2}: CMYK Black must be 0-100`);

      return color as Color;
    });

    if (errors.length > 0) {
      setImportErrors(errors);
    }

    return parsedColors;
  };

  const handleImportColors = async () => {
    if (importPreview.length === 0) return;

    try {
      const importPromises = importPreview.map(color => ColorAPI.createColor(color));
      await Promise.all(importPromises);
      
      // Close modal and reset state after successful import
      setShowImportModal(false);
      setImportFile(null);
      setImportPreview([]);
      setImportErrors([]);
      loadColors(); // Refresh the colors list
    } catch (error) {
      console.error('Failed to import colors:', error);
      setImportErrors(['Failed to import colors. Please try again.']);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Colors</h1>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowImportModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <FiUpload className="text-lg" />
            <span>Import</span>
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
          >
            <FiPlus className="text-lg" />
            <span>Add Color</span>
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border">
        {/* Search and Filter Bar */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search colors by name, display name, or spot color..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={colorSpaceFilter}
                onChange={(e) => setColorSpaceFilter(e.target.value as 'all' | 'Adobe RGB' | 'sRGB')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">All Color Spaces</option>
                <option value="Adobe RGB">Adobe RGB</option>
                <option value="sRGB">sRGB</option>
              </select>
            </div>
          </div>
          
          {(searchTerm || colorSpaceFilter !== 'all') && (
            <div className="text-sm text-gray-600">
              Showing {filteredColors.length} of {colors.length} colors
              {searchTerm && <span> matching "{searchTerm}"</span>}
              {colorSpaceFilter !== 'all' && <span> in {colorSpaceFilter}</span>}
            </div>
          )}
        </div>

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Available Colors ({filteredColors.length})</h2>
          
          {colors.length > 0 && (
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Select All</span>
              </label>
              
              {selectedColors.size > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center space-x-1"
                >
                  <FiTrash2 className="text-sm" />
                  <span>Delete Selected ({selectedColors.size})</span>
                </button>
              )}
            </div>
          )}
        </div>
        
        {filteredColors.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {colors.length === 0 ? (
              <>
                <p>No colors defined yet.</p>
                <p className="text-sm mt-2">Click "Add Color" to create your first color mapping.</p>
              </>
            ) : (
              <>
                <p>No colors match your search criteria.</p>
                <p className="text-sm mt-2">Try adjusting your search or filter settings.</p>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {paginatedColors.map((color) => (
              <div key={color.id} className="p-4 border rounded-lg hover:bg-gray-50 relative group">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedColors.has(color.id!)}
                      onChange={(e) => handleSelectColor(color.id!, e.target.checked)}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <h3 className="font-medium">{color.display_name}</h3>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditColor(color)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <FiEdit3 className="text-sm" />
                    </button>
                    <button
                      onClick={() => handleDeleteColor(color.id!)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FiTrash2 className="text-sm" />
                    </button>
                  </div>
                </div>
                
                {/* Color Preview */}
                <div 
                  className="w-full h-16 rounded-md border mb-3"
                  style={{ backgroundColor: getRgbColor(color) }}
                ></div>
                
                {/* Color Values */}
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">RGB:</span> {color.rgb_r}, {color.rgb_g}, {color.rgb_b}
                  </div>
                  <div>
                    <span className="font-medium">HEX:</span> {getHexColorForColor(color)}
                  </div>
                  <div>
                    <span className="font-medium">CMYK:</span> {color.cmyk_c}%, {color.cmyk_m}%, {color.cmyk_y}%, {color.cmyk_k}%
                  </div>
                  <div>
                    <span className="font-medium">Space:</span> {color.color_space || 'Adobe RGB'}
                  </div>
                  {color.spot_color && (
                    <div>
                      <span className="font-medium">Spot:</span> {color.spot_color}
                    </div>
                  )}
                </div>
              </div>
            ))}
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-6 space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <div className="flex space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 border rounded-lg ${
                        currentPage === page
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add/Edit Color Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">
                {editingColor ? 'Edit Color' : 'Add New Color'}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., primary-blue"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Name *
                  </label>
                  <input
                    type="text"
                    value={formData.display_name || ''}
                    onChange={(e) => handleInputChange('display_name', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                      errors.display_name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Primary Blue"
                  />
                  {errors.display_name && <p className="text-red-500 text-sm mt-1">{errors.display_name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color Space
                  </label>
                  <select
                    value={formData.color_space || 'Adobe RGB'}
                    onChange={(e) => handleInputChange('color_space', e.target.value as ColorSpace)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="Adobe RGB">Adobe RGB</option>
                    <option value="sRGB">sRGB</option>
                  </select>
                </div>
              </div>

              {/* RGB Values */}
              <div>
                <h4 className="text-lg font-medium text-gray-800 mb-3">RGB Values</h4>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-blue-800">
                    <strong>🎨 Adobe RGB Support:</strong> RGB values are interpreted as {formData.color_space || 'Adobe RGB'} and automatically converted to sRGB for web display. This ensures accurate color matching with professional design software like GIMP and Photoshop.
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Red (0-255)</label>
                    <input
                      type="number"
                      min="0"
                      max="255"
                      step="0.1"
                      value={formData.rgb_r || 0}
                      onChange={(e) => handleInputChange('rgb_r', parseFloat(e.target.value) || 0)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                        errors.rgb_r ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.rgb_r && <p className="text-red-500 text-sm mt-1">{errors.rgb_r}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Green (0-255)</label>
                    <input
                      type="number"
                      min="0"
                      max="255"
                      step="0.1"
                      value={formData.rgb_g || 0}
                      onChange={(e) => handleInputChange('rgb_g', parseFloat(e.target.value) || 0)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                        errors.rgb_g ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.rgb_g && <p className="text-red-500 text-sm mt-1">{errors.rgb_g}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Blue (0-255)</label>
                    <input
                      type="number"
                      min="0"
                      max="255"
                      step="0.1"
                      value={formData.rgb_b || 0}
                      onChange={(e) => handleInputChange('rgb_b', parseFloat(e.target.value) || 0)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                        errors.rgb_b ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.rgb_b && <p className="text-red-500 text-sm mt-1">{errors.rgb_b}</p>}
                  </div>
                </div>
              </div>

              {/* CMYK Values */}
              <div>
                <h4 className="text-lg font-medium text-gray-800 mb-3">CMYK Values</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cyan (0-100%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={formData.cmyk_c || 0}
                      onChange={(e) => handleInputChange('cmyk_c', parseFloat(e.target.value) || 0)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                        errors.cmyk_c ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.cmyk_c && <p className="text-red-500 text-sm mt-1">{errors.cmyk_c}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Magenta (0-100%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={formData.cmyk_m || 0}
                      onChange={(e) => handleInputChange('cmyk_m', parseFloat(e.target.value) || 0)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                        errors.cmyk_m ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.cmyk_m && <p className="text-red-500 text-sm mt-1">{errors.cmyk_m}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Yellow (0-100%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={formData.cmyk_y || 0}
                      onChange={(e) => handleInputChange('cmyk_y', parseFloat(e.target.value) || 0)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                        errors.cmyk_y ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.cmyk_y && <p className="text-red-500 text-sm mt-1">{errors.cmyk_y}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Black (0-100%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={formData.cmyk_k || 0}
                      onChange={(e) => handleInputChange('cmyk_k', parseFloat(e.target.value) || 0)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                        errors.cmyk_k ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.cmyk_k && <p className="text-red-500 text-sm mt-1">{errors.cmyk_k}</p>}
                  </div>
                </div>
              </div>

              {/* Spot Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Spot Color (Optional)
                </label>
                <input
                  type="text"
                  value={formData.spot_color || ''}
                  onChange={(e) => handleInputChange('spot_color', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g., Pantone 286 C"
                />
              </div>

              {/* Color Preview */}
              {formData.rgb_r !== undefined && formData.rgb_g !== undefined && formData.rgb_b !== undefined && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Color Preview</label>
                  <div 
                    className="w-full h-20 rounded-lg border"
                    style={{ 
                      backgroundColor: getCSSColor(formData.rgb_r, formData.rgb_g, formData.rgb_b, formData.color_space || 'Adobe RGB')
                    }}
                  ></div>
                  <div className="text-xs text-gray-500 mt-1 space-y-1">
                    <p><strong>{formData.color_space || 'Adobe RGB'} Input:</strong> RGB({formData.rgb_r}, {formData.rgb_g}, {formData.rgb_b})</p>
                    {formData.color_space === 'Adobe RGB' && (
                      <>
                        {(() => {
                          const srgbColor = convertColor(formData.rgb_r, formData.rgb_g, formData.rgb_b, 'Adobe RGB', 'sRGB');
                          return (
                            <>
                              <p><strong>Converted to sRGB:</strong> RGB({srgbColor.r}, {srgbColor.g}, {srgbColor.b})</p>
                              <p><strong>Web Display Hex:</strong> {getHexColor(formData.rgb_r, formData.rgb_g, formData.rgb_b, 'Adobe RGB')}</p>
                            </>
                          );
                        })()}
                      </>
                    )}
                    {formData.color_space === 'sRGB' && (
                      <p><strong>sRGB Hex:</strong> {getHexColor(formData.rgb_r, formData.rgb_g, formData.rgb_b, 'sRGB')}</p>
                    )}
                  </div>
                  
                  {/* Adobe RGB vs sRGB comparison */}
                  {formData.color_space === 'Adobe RGB' && (
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Adobe RGB (GIMP/Photoshop):</p>
                        <div 
                          className="w-full h-10 rounded border"
                          style={{ backgroundColor: getCSSColor(formData.rgb_r, formData.rgb_g, formData.rgb_b, 'Adobe RGB') }}
                        ></div>
                        <p className="text-xs text-gray-500">Converted for web display</p>
                      </div>
                      
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Raw sRGB (no conversion):</p>
                        <div 
                          className="w-full h-10 rounded border"
                          style={{ backgroundColor: getCSSColor(formData.rgb_r, formData.rgb_g, formData.rgb_b, 'sRGB') }}
                        ></div>
                        <p className="text-xs text-gray-500">Direct RGB values</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  {editingColor ? 'Update Color' : 'Add Color'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Colors Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Import Colors</h3>
              <button 
                onClick={() => setShowImportModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            <div className="space-y-6">
              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload File (CSV or JSON)
                </label>
                <input
                  type="file"
                  accept=".csv,.json"
                  onChange={handleImportFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Supported formats: CSV, JSON. Maximum file size: 10MB
                </p>
              </div>

              {/* Format Examples */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">File Format Examples:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="font-medium mb-1">CSV Format:</p>
                    <pre className="bg-white p-2 rounded border text-gray-600">
{`name,display_name,rgb_r,rgb_g,rgb_b,cmyk_c,cmyk_m,cmyk_y,cmyk_k,spot_color,color_space
primary-red,Primary Red,255,0,0,0,100,100,0,PMS 186,Adobe RGB
ocean-blue,Ocean Blue,0,119,190,100,37,0,25,,sRGB`}
                    </pre>
                  </div>
                  <div>
                    <p className="font-medium mb-1">JSON Format:</p>
                    <pre className="bg-white p-2 rounded border text-gray-600">
{`[
  {
    "name": "primary-red",
    "display_name": "Primary Red",
    "rgb_r": 255, "rgb_g": 0, "rgb_b": 0,
    "cmyk_c": 0, "cmyk_m": 100, "cmyk_y": 100, "cmyk_k": 0,
    "spot_color": "PMS 186",
    "color_space": "Adobe RGB"
  }
]`}
                    </pre>
                  </div>
                </div>
              </div>

              {/* Import Errors */}
              {importErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-red-800 mb-2">Import Errors:</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    {importErrors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Preview */}
              {importPreview.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-800 mb-3">
                    Preview ({importPreview.length} colors)
                  </h4>
                  <div className="max-h-60 overflow-y-auto border rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left">Preview</th>
                          <th className="px-3 py-2 text-left">Name</th>
                          <th className="px-3 py-2 text-left">RGB</th>
                          <th className="px-3 py-2 text-left">CMYK</th>
                          <th className="px-3 py-2 text-left">Space</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importPreview.map((color, index) => (
                          <tr key={index} className="border-t">
                            <td className="px-3 py-2">
                              <div 
                                className="w-8 h-8 rounded border"
                                style={{ backgroundColor: getRgbColor(color) }}
                              ></div>
                            </td>
                            <td className="px-3 py-2">
                              <div className="font-medium">{color.display_name}</div>
                              <div className="text-xs text-gray-500">{color.name}</div>
                            </td>
                            <td className="px-3 py-2">
                              {color.rgb_r}, {color.rgb_g}, {color.rgb_b}
                            </td>
                            <td className="px-3 py-2">
                              {color.cmyk_c}%, {color.cmyk_m}%, {color.cmyk_y}%, {color.cmyk_k}%
                            </td>
                            <td className="px-3 py-2">
                              {color.color_space || 'Adobe RGB'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Import Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleImportColors}
                  disabled={importPreview.length === 0 || importErrors.length > 0}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Import {importPreview.length} Colors
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Colors;
