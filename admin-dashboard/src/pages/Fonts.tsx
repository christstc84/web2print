import { useState, useEffect, useRef } from 'react';
import { FiPlus, FiUpload, FiX, FiTrash2 } from 'react-icons/fi';
import { FontAPI } from '../services/api';
import { validateFontFile, getFontFormat, generateFontFamily } from '../utils/fileUpload';

interface Font {
  id?: number;
  name: string;
  display_name: string;
  font_family: string;
  file_path?: string;
  file_size?: number;
  font_format?: string;
  created_at?: string;
}

const Fonts = () => {
  const [fonts, setFonts] = useState<Font[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: string}>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Pagination and search state
  const [selectedFonts, setSelectedFonts] = useState<Set<number>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formatFilter, setFormatFilter] = useState<'all' | 'ttf' | 'otf' | 'woff' | 'woff2'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12); // 12 fonts per page

  // Filter and pagination logic (must be here before functions that use them)
  const filteredFonts = fonts.filter(font => {
    const matchesSearch = searchTerm === '' || 
      font.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      font.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      font.font_family.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFormat = formatFilter === 'all' || 
      (font.font_format?.toLowerCase() === formatFilter);
    
    return matchesSearch && matchesFormat;
  });

  const totalPages = Math.ceil(filteredFonts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedFonts = filteredFonts.slice(startIndex, startIndex + itemsPerPage);



  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, formatFilter]);

  // Reset selections when page changes
  useEffect(() => {
    setSelectedFonts(new Set());
    setSelectAll(false);
  }, [currentPage, searchTerm, formatFilter]);

  // Update select all state when selections or pagination changes
  useEffect(() => {
    const visibleIds = paginatedFonts.map(font => font.id!);
    const selectedVisibleCount = visibleIds.filter(id => selectedFonts.has(id)).length;
    setSelectAll(selectedVisibleCount === paginatedFonts.length && paginatedFonts.length > 0);
  }, [selectedFonts, paginatedFonts]);

  // Load fonts from database
  useEffect(() => {
    loadFonts();
  }, []);

  const loadFonts = async () => {
    try {
      const customFonts = await FontAPI.getAllFonts();
      setFonts(customFonts);
      
      // Load each font into the document
      customFonts.forEach(font => {
        if (font.file_path) {
          loadFontIntoDocument(font);
        }
      });
    } catch (error) {
      console.error('Failed to load fonts:', error);
      // For now, just log the error - in production you might want to show a user message
    }
  };

  // Bulk selection functions
  const handleSelectFont = (fontId: number, checked: boolean) => {
    const newSelected = new Set(selectedFonts);
    if (checked) {
      newSelected.add(fontId);
    } else {
      newSelected.delete(fontId);
    }
    setSelectedFonts(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Select all visible (paginated) fonts
      const visibleIds = new Set(paginatedFonts.map(font => font.id!));
      setSelectedFonts(prev => new Set([...prev, ...visibleIds]));
    } else {
      // Deselect all visible (paginated) fonts
      const visibleIds = new Set(paginatedFonts.map(font => font.id!));
      setSelectedFonts(prev => new Set([...prev].filter(id => !visibleIds.has(id))));
    }
    setSelectAll(checked);
  };

  const handleBulkDelete = async () => {
    if (selectedFonts.size === 0) return;
    
    const confirmMessage = `Are you sure you want to delete ${selectedFonts.size} selected font${selectedFonts.size > 1 ? 's' : ''}?`;
    if (!confirm(confirmMessage)) return;

    try {
      // Delete all selected fonts
      const deletePromises = Array.from(selectedFonts).map(fontId => 
        FontAPI.deleteFont(fontId)
      );
      await Promise.all(deletePromises);
      
      // Clear selection and reload fonts
      setSelectedFonts(new Set());
      setSelectAll(false);
      await loadFonts();
    } catch (error) {
      console.error('Failed to delete fonts:', error);
      alert('Failed to delete some fonts. Please try again.');
    }
  };



  // Helper function to load font into document
  const loadFontIntoDocument = (font: Font) => {
    if (!font.file_path || !font.font_family) return;
    
    // Remove leading slash and 'uploads/' if already present in file_path
    const cleanPath = font.file_path.replace(/^\/?(uploads\/)?/, '');
    const fontUrl = `http://localhost:3001/uploads/${cleanPath}`;
    const fontFace = new FontFace(font.font_family, `url(${fontUrl})`);
    
    fontFace.load().then(() => {
      document.fonts.add(fontFace);
      console.log(`✅ Font loaded successfully: ${font.display_name}`);
    }).catch(error => {
      console.error(`❌ Failed to load font ${font.display_name}:`, error);
      console.error(`Font URL: ${fontUrl}`);
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadError(null);
    setSelectedFiles([]);
    setUploadProgress({});

    // Validate all files
    const validFiles: File[] = [];
    const errors: string[] = [];

    files.forEach(file => {
      const validation = validateFontFile(file);
      if (validation.isValid) {
        validFiles.push(file);
      } else {
        errors.push(`${file.name}: ${validation.error}`);
      }
    });

    if (errors.length > 0) {
      setUploadError(`Some files are invalid:\n${errors.join('\n')}`);
    }

    if (validFiles.length > 0) {
      setSelectedFiles(validFiles);
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setUploadError(null);

    try {
      const successfulUploads: Font[] = [];
      const failedUploads: string[] = [];

      // Process each file
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        setUploadProgress(prev => ({
          ...prev,
          [file.name]: `Uploading ${i + 1}/${selectedFiles.length}...`
        }));

        try {
          // Upload file via API
          const uploadResult = await FontAPI.uploadFontFile(file);
          if (!uploadResult.success) {
            failedUploads.push(`${file.name}: ${uploadResult.error || 'Upload failed'}`);
            continue;
          }

          // Prepare font data
          const fontFormat = getFontFormat(file.name);
          const fontFamily = generateFontFamily(file.name);
          const displayName = fontFamily;

          // Save to database via API
          await FontAPI.createFont({
            name: file.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-\.]/g, ''),
            display_name: displayName,
            file_name: file.name,
            file_path: uploadResult.filePath!,
            file_size: file.size,
            font_format: fontFormat,
            font_family: fontFamily
          });

          // Load font into document for preview
          const newFont: Font = {
            name: displayName.toLowerCase().replace(/\s+/g, '-'),
            display_name: displayName,
            font_family: fontFamily,
            file_path: uploadResult.filePath!,
            file_size: file.size,
            font_format: fontFormat
          };
          loadFontIntoDocument(newFont);
          successfulUploads.push(newFont);

          setUploadProgress(prev => ({
            ...prev,
            [file.name]: 'Complete'
          }));

        } catch (error) {
          console.error(`Font upload error for ${file.name}:`, error);
          failedUploads.push(`${file.name}: Failed to save`);
        }
      }

      // Show results
      if (failedUploads.length > 0) {
        setUploadError(`Some uploads failed:\n${failedUploads.join('\n')}`);
      }

      // Refresh fonts list if any uploads succeeded
      if (successfulUploads.length > 0) {
        await loadFonts();
      }

      // Close modal if all uploads succeeded
      if (failedUploads.length === 0) {
        setShowUploadModal(false);
        setSelectedFiles([]);
        setUploadProgress({});
        
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }

    } catch (error) {
      console.error('Font upload error:', error);
      setUploadError('Failed to upload fonts. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFont = async (fontId: number) => {
    if (!confirm('Are you sure you want to delete this font?')) return;

    try {
      await FontAPI.deleteFont(fontId);
      await loadFonts();
    } catch (error) {
      console.error('Failed to delete font:', error);
      // In production, you might want to show a user-friendly error message
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Font Settings</h1>
        <button 
          onClick={() => setShowUploadModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
        >
          <FiPlus className="text-sm" />
          Add Font
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border">
        {/* Search and Filter Bar */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search fonts by name, display name, or font family..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={formatFilter}
                onChange={(e) => setFormatFilter(e.target.value as 'all' | 'ttf' | 'otf' | 'woff' | 'woff2')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">All Formats</option>
                <option value="ttf">TTF</option>
                <option value="otf">OTF</option>
                <option value="woff">WOFF</option>
                <option value="woff2">WOFF2</option>
              </select>
            </div>
          </div>
          
          {(searchTerm || formatFilter !== 'all') && (
            <div className="text-sm text-gray-600">
              Showing {filteredFonts.length} of {fonts.length} fonts
              {searchTerm && <span> matching "{searchTerm}"</span>}
              {formatFilter !== 'all' && <span> in {formatFilter.toUpperCase()} format</span>}
            </div>
          )}
        </div>

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Available Fonts ({filteredFonts.length})</h2>
          
          {fonts.length > 0 && (
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
              
              {selectedFonts.size > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center space-x-1"
                >
                  <FiTrash2 className="text-sm" />
                  <span>Delete Selected ({selectedFonts.size})</span>
                </button>
              )}
            </div>
          )}
        </div>
        
        {filteredFonts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {fonts.length === 0 ? (
              <>
                <p>No fonts uploaded yet.</p>
                <p className="text-sm mt-2">Click "Upload Font" to add your first font.</p>
              </>
            ) : (
              <>
                <p>No fonts match your search criteria.</p>
                <p className="text-sm mt-2">Try adjusting your search or filter settings.</p>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paginatedFonts.map((font: Font, index: number) => (
                <div key={font.id || `font-${index}`} className="p-4 border rounded-lg hover:bg-gray-50 relative group">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedFonts.has(font.id!)}
                        onChange={(e) => handleSelectFont(font.id!, e.target.checked)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <h3 className="font-medium">{font.display_name}</h3>
                    </div>
                    {font.id && (
                      <button
                        onClick={() => handleDeleteFont(font.id!)}
                        className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity"
                      >
                        <FiTrash2 className="text-sm" />
                      </button>
                    )}
                  </div>
                  <p style={{ fontFamily: font.font_family }} className="text-gray-600 text-lg">
                    The quick brown fox jumps over the lazy dog
                  </p>
                  {font.file_size && (
                    <p className="text-xs text-gray-400 mt-2">
                      {font.font_format?.toUpperCase()} • {Math.round(font.file_size / 1024)}KB
                    </p>
                  )}
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

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Upload Font Files</h3>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setSelectedFiles([]);
                  setUploadProgress({});
                  setUploadError(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX className="text-xl" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <FiUpload className="text-3xl text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 mb-2">Choose font files to upload</p>
                <p className="text-sm text-gray-500 mb-4">
                  Supports TTF, OTF, WOFF, WOFF2 (max 5MB each) • Multiple files supported
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".ttf,.otf,.woff,.woff2"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Select Files'}
                </button>
              </div>

              {/* Selected Files Preview */}
              {selectedFiles.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Selected Files ({selectedFiles.length})</h4>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{file.name}</p>
                          <p className="text-xs text-gray-500">
                            {getFontFormat(file.name).toUpperCase()} • {Math.round(file.size / 1024)}KB
                          </p>
                        </div>
                        <div className="text-xs text-gray-600">
                          {uploadProgress[file.name] || 'Ready'}
                        </div>
                        {!uploading && (
                          <button
                            onClick={() => {
                              setSelectedFiles(prev => prev.filter((_, i) => i !== index));
                              setUploadProgress(prev => {
                                const newProgress = { ...prev };
                                delete newProgress[file.name];
                                return newProgress;
                              });
                            }}
                            className="ml-2 text-red-500 hover:text-red-700"
                          >
                            <FiX className="text-sm" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <button
                    onClick={handleUpload}
                    disabled={uploading || selectedFiles.length === 0}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {uploading ? `Uploading ${selectedFiles.length} files...` : `Upload ${selectedFiles.length} Font${selectedFiles.length > 1 ? 's' : ''}`}
                  </button>
                </div>
              )}
              
              {uploadError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded whitespace-pre-line">
                  {uploadError}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Fonts;
