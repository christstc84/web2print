import React, { useState } from 'react';
import { FiEdit3, FiTrash2, FiCheck, FiX } from 'react-icons/fi';
import { PrintOptionData } from '../../types/printOptions';
import { PrintOptionsAPI } from '../../services/printOptionsApi';

interface PrintOptionListProps {
  options: PrintOptionData[];
  selectedOptions: string[];
  onSelectionChange: (optionIds: string[]) => void;
  onEdit: (option: PrintOptionData) => void;
  onRefresh: () => void;
}

export const PrintOptionList: React.FC<PrintOptionListProps> = ({
  options,
  selectedOptions,
  onSelectionChange,
  onEdit,
  onRefresh
}) => {
  const [deletingIds, setDeletingIds] = useState<string[]>([]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(options.map(option => option.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectOption = (optionId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedOptions, optionId]);
    } else {
      onSelectionChange(selectedOptions.filter(id => id !== optionId));
    }
  };

  const handleDelete = async (optionId: string) => {
    if (!confirm('Are you sure you want to delete this option?')) return;
    
    setDeletingIds(prev => [...prev, optionId]);
    
    try {
      await PrintOptionsAPI.deleteOption(optionId);
      onRefresh();
    } catch (error) {
      console.error('Failed to delete option:', error);
      alert('Failed to delete option. Please try again.');
    } finally {
      setDeletingIds(prev => prev.filter(id => id !== optionId));
    }
  };

  const formatPrice = (pricing: any) => {
    if (pricing?.basePrice) {
      return `$${pricing.basePrice.toFixed(2)}`;
    }
    return 'N/A';
  };

  const formatSpecifications = (specs: any) => {
    if (specs?.weight && specs?.purchaseWidth && specs?.purchaseHeight) {
      return `${specs.weight}gsm, ${specs.purchaseWidth}"×${specs.purchaseHeight}"`;
    }
    return 'N/A';
  };

  if (options.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <span className="text-4xl">📄</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No options found
        </h3>
        <p className="text-gray-500 mb-4">
          Get started by adding your first option.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Table Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={selectedOptions.length === options.length}
            onChange={(e) => handleSelectAll(e.target.checked)}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <div className="ml-6 grid grid-cols-12 gap-4 w-full text-xs font-medium text-gray-500 uppercase tracking-wider">
            <div className="col-span-3">Name</div>
            <div className="col-span-3">Specifications</div>
            <div className="col-span-2">Price</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>
        </div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-gray-200">
        {options.map((option) => (
          <div key={option.id} className="px-6 py-4 hover:bg-gray-50">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={selectedOptions.includes(option.id)}
                onChange={(e) => handleSelectOption(option.id, e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <div className="ml-6 grid grid-cols-12 gap-4 w-full">
                {/* Name */}
                <div className="col-span-3">
                  <button
                    onClick={() => onEdit(option)}
                    className="text-left hover:text-indigo-600 transition-colors"
                  >
                    <div className="font-medium text-gray-900">{option.displayName}</div>
                    <div className="text-sm text-gray-500">{option.name}</div>
                  </button>
                </div>

                {/* Specifications */}
                <div className="col-span-3">
                  <div className="text-sm text-gray-900">
                    {formatSpecifications(option.specifications)}
                  </div>
                  {option.description && (
                    <div className="text-sm text-gray-500 truncate">
                      {option.description}
                    </div>
                  )}
                </div>

                {/* Price */}
                <div className="col-span-2">
                  <div className="text-sm font-medium text-gray-900">
                    {formatPrice(option.pricing)}
                  </div>
                  <div className="text-xs text-gray-500">per 1000 ft²</div>
                </div>

                {/* Status */}
                <div className="col-span-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    option.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {option.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Actions */}
                <div className="col-span-2 flex items-center justify-end gap-2">
                  <button
                    onClick={() => onEdit(option)}
                    className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                    title="Edit option"
                  >
                    <FiEdit3 className="text-sm" />
                  </button>
                  <button
                    onClick={() => handleDelete(option.id)}
                    disabled={deletingIds.includes(option.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                    title="Delete option"
                  >
                    {deletingIds.includes(option.id) ? (
                      <div className="animate-spin h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full" />
                    ) : (
                      <FiTrash2 className="text-sm" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
