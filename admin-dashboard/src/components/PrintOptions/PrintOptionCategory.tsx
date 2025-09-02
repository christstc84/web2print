import React from 'react';
import { 
  FiEdit3, FiSettings, FiEye, FiEyeOff, FiFileText, FiMaximize, 
  FiDroplet, FiLayers, FiBook, FiStar, FiTarget, FiTool, 
  FiBarChart, FiSearch 
} from 'react-icons/fi';
import { PrintOptionCategoryData } from '../../types/printOptions';

interface PrintOptionCategoryProps {
  category: PrintOptionCategoryData;
  onEdit: (category: PrintOptionCategoryData) => void;
  onManageOptions: (category: PrintOptionCategoryData) => void;
  onToggleActive?: (categoryId: string, isActive: boolean) => void;
}

const PrintOptionCategory: React.FC<PrintOptionCategoryProps> = ({
  category,
  onEdit,
  onManageOptions,
  onToggleActive
}) => {
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
      'FiBarChart': <FiBarChart className="text-2xl" />,
      'FiSearch': <FiSearch className="text-2xl" />
    };
    
    return iconMap[iconName] || <FiFileText className="text-2xl" />;
  };


  return (
    <div className={`border-2 rounded-lg p-4 transition-all duration-200 hover:shadow-md ${
      category.isActive 
        ? 'border-indigo-200 bg-indigo-50 hover:border-indigo-300' 
        : 'border-gray-200 bg-gray-50 opacity-75'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="text-indigo-600">
            {renderIcon(category.icon)}
          </div>
          <div>
            <h3 className={`font-semibold ${
              category.isActive ? 'text-gray-900' : 'text-gray-500'
            }`}>
              {category.name}
            </h3>
            <p className={`text-sm ${
              category.isActive ? 'text-gray-600' : 'text-gray-400'
            }`}>
              {category.description}
            </p>
          </div>
        </div>
        
        {/* Status Toggle */}
        {onToggleActive && (
          <button
            onClick={() => onToggleActive(category.id, !category.isActive)}
            className={`p-1 rounded transition-colors ${
              category.isActive 
                ? 'text-gray-600 hover:text-gray-800' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
            title={category.isActive ? 'Deactivate category' : 'Activate category'}
          >
            {category.isActive ? <FiEye className="text-sm" /> : <FiEyeOff className="text-sm" />}
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="mb-4">
        <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
          {category.optionCount} option{category.optionCount !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onManageOptions(category)}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
          disabled={!category.isActive}
        >
          <FiSettings className="inline text-sm mr-1" />
          Manage Options
        </button>
        
        <button
          onClick={() => onEdit(category)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <FiEdit3 className="text-sm" />
        </button>
      </div>

      {/* Category Type Badge */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <span className="text-xs font-medium px-2 py-1 rounded bg-indigo-100 text-indigo-700">
          {category.type === 'print_option' ? 'Print Option' : 'Production Option'}
        </span>
      </div>
    </div>
  );
};

export default PrintOptionCategory;
