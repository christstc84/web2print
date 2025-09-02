import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiHome, FiUsers, FiSettings, FiMenu, FiX, FiPieChart, FiFileText, FiSliders, FiChevronDown, FiChevronRight, FiPrinter } from 'react-icons/fi';
import { PageType } from '../App';

interface SidebarProps {
  collapsed: boolean;
  toggleSidebar: () => void;
  currentPage: PageType;
}

interface MenuItem {
  icon: JSX.Element;
  label: string;
  page?: PageType;
  subItems?: { label: string; page: PageType }[];
}

// Map PageType to URL paths
const pageToPathMap: Record<PageType, string> = {
  'dashboard': '/',
  'fonts': '/fonts',
  'colors': '/colors',
  'fixed_prices': '/fixed-prices',
  'print_options': '/print-options',
  'local_files': '/local-files',
  'templates': '/templates',
  'items': '/items',
  'orders': '/orders',
  'products': '/products',
  'users': '/users',
  'roles': '/roles',
  'permissions': '/permissions',
  'analytics': '/analytics',
  'monthly': '/analytics/monthly',
  'analytics_reports': '/analytics/reports',
  'custom': '/analytics/custom',
  'settings': '/settings'
};

const Sidebar = ({ collapsed, toggleSidebar, currentPage }: SidebarProps) => {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const navigate = useNavigate();

  const navigateToPage = (page: PageType) => {
    navigate(pageToPathMap[page]);
  };

  const menuItems: MenuItem[] = [
    { icon: <FiHome className="text-xl" />, label: 'Dashboard', page: 'dashboard' },
    { 
      icon: <FiSliders className="text-xl" />, 
      label: 'Personalization',
      subItems: [
        { label: 'Fonts', page: 'fonts' },
        { label: 'Colors', page: 'colors' },
        { label: 'Fixed Prices', page: 'fixed_prices' },
        { label: 'Local Files', page: 'local_files' },
        { label: 'Print Options', page: 'print_options' },
        { label: 'Templates', page: 'templates' }
      ]
    },
    { 
      icon: <FiPrinter className="text-xl" />, 
      label: 'Production',
      subItems: [
        { label: 'Items', page: 'items' },
        { label: 'Orders', page: 'orders' },
        { label: 'Products', page: 'products' },
      ]
    },
    { 
      icon: <FiUsers className="text-xl" />, 
      label: 'Users',
      subItems: [
        { label: 'All Users', page: 'users' },
        { label: 'User Roles', page: 'roles' },
        { label: 'Permissions', page: 'permissions' }
      ]
    },
    { icon: <FiPieChart className="text-xl" />, label: 'Analytics', page: 'analytics' },
    { 
      icon: <FiFileText className="text-xl" />, 
      label: 'Reports',
      subItems: [
        { label: 'Monthly Reports', page: 'monthly' },
        { label: 'Analytics Reports', page: 'analytics_reports' },
        { label: 'Custom Reports', page: 'custom' }
      ]
    },
    { icon: <FiSettings className="text-xl" />, label: 'Settings', page: 'settings' },
  ];

  const toggleExpanded = (label: string) => {
    setExpandedItems(prev => 
      prev.includes(label) 
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  return (
    <div 
      className={`bg-indigo-500 text-white transition-all duration-300 ease-in-out ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b border-indigo-400">
        {!collapsed && <h1 className="text-xl font-bold">Admin Panel</h1>}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-indigo-400 transition-colors"
        >
          {collapsed ? <FiMenu className="text-xl" /> : <FiX className="text-xl" />}
        </button>
      </div>
      <nav className="mt-4">
        <ul>
          {menuItems.map((item, index) => (
            <li key={index} className="mb-1">
              <div
                className={`flex items-center p-4 hover:bg-indigo-400 transition-colors cursor-pointer ${
                  collapsed ? 'justify-center' : 'px-6'
                } ${
                  currentPage === item.page ? 'bg-indigo-400' : ''
                }`}
                title={collapsed ? item.label : ''}
                onClick={() => {
                  if (item.subItems && !collapsed) {
                    toggleExpanded(item.label);
                  } else if (item.page) {
                    navigateToPage(item.page);
                  }
                }}
              >
                <span className={`${!collapsed ? 'mr-3' : ''}`}>
                  {item.icon}
                </span>
                {!collapsed && (
                  <>
                    <span className="flex-1">{item.label}</span>
                    {item.subItems && (
                      <span className="ml-2">
                        {expandedItems.includes(item.label) ? (
                          <FiChevronDown className="text-sm" />
                        ) : (
                          <FiChevronRight className="text-sm" />
                        )}
                      </span>
                    )}
                  </>
                )}
              </div>
              
              {/* Submenu */}
              {item.subItems && !collapsed && expandedItems.includes(item.label) && (
                <ul className="bg-indigo-600 py-2">
                  {item.subItems.map((subItem, subIndex) => (
                    <li key={subIndex}>
                      <div
                        onClick={() => navigateToPage(subItem.page)}
                        className={`block px-12 py-2 text-sm hover:bg-indigo-400 transition-colors cursor-pointer ${
                          currentPage === subItem.page ? 'bg-indigo-400' : ''
                        }`}
                      >
                        {subItem.label}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
