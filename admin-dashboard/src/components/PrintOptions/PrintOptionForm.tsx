import React, { useState } from 'react';
import { FiX, FiPlus } from 'react-icons/fi';
import { PrintOptionCategoryData } from '../../types/printOptions';
import { PrintOptionsAPI } from '../../services/printOptionsApi';

interface PrintOptionFormProps {
  category: PrintOptionCategoryData;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PrintOptionForm: React.FC<PrintOptionFormProps> = ({
  category,
  isOpen,
  onClose,
  onSuccess
}) => {
  // Form state
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
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
      onClose();
      onSuccess();
    } catch (error) {
      console.error('Failed to add option:', error);
      alert('Failed to add option. Please try again.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            Add New {category?.name || 'Option'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiX className="text-xl text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
              onClick={onClose}
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
  );
};
