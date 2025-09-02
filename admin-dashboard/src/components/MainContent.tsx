import { FiBell, FiSearch, FiUser } from 'react-icons/fi';
import { useLocation } from 'react-router-dom';
import { PageType } from '../App';
import Dashboard from '../pages/Dashboard';
import Fonts from '../pages/Fonts';
import Items from '../pages/Items';
import Colors from '../pages/Colors';
import PrintOptions from '../pages/PrintOptions';
import PrintOptionCategoryManager from '../pages/PrintOptionCategoryManagerNew';

interface MainContentProps {
  sidebarCollapsed: boolean;
  currentPage: PageType;
}

const MainContent = ({ sidebarCollapsed, currentPage }: MainContentProps) => {
  const location = useLocation();
  
  const renderPage = () => {
    console.log('MainContent renderPage - current pathname:', location.pathname);
    
    // Check if this is a print option category management page
    const printOptionCategoryMatch = location.pathname.match(/^\/print-options\/([^\/]+)$/);
    console.log('Print option category match:', printOptionCategoryMatch);
    
    if (printOptionCategoryMatch) {
      console.log('Rendering PrintOptionCategoryManager for category:', printOptionCategoryMatch[1]);
      return <PrintOptionCategoryManager />;
    }
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'fonts':
        return <Fonts />;
      case 'items':
        return <Items />;
      case 'colors':
        return <Colors />;
      case 'fixed_prices':
        return <div className="p-6"><h1 className="text-2xl font-bold">Fixed Prices</h1><p>Price management coming soon...</p></div>;
      case 'print_options':
        return <PrintOptions />;
      case 'local_files':
        return <div className="p-6"><h1 className="text-2xl font-bold">Local Files</h1><p>Local Files management coming soon...</p></div>;
      case 'templates':
        return <div className="p-6"><h1 className="text-2xl font-bold">Templates</h1><p>Template management coming soon...</p></div>;
      case 'orders':
        return <div className="p-6"><h1 className="text-2xl font-bold">Orders</h1><p>Order management coming soon...</p></div>;
      case 'products':
        return <div className="p-6"><h1 className="text-2xl font-bold">Products</h1><p>Product catalog coming soon...</p></div>;
      case 'users':
        return <div className="p-6"><h1 className="text-2xl font-bold">All Users</h1><p>User management coming soon...</p></div>;
      case 'roles':
        return <div className="p-6"><h1 className="text-2xl font-bold">User Roles</h1><p>Role management coming soon...</p></div>;
      case 'permissions':
        return <div className="p-6"><h1 className="text-2xl font-bold">Permissions</h1><p>Permission settings coming soon...</p></div>;
      case 'analytics':
        return <div className="p-6"><h1 className="text-2xl font-bold">Analytics</h1><p>Analytics dashboard coming soon...</p></div>;
      case 'monthly':
        return <div className="p-6"><h1 className="text-2xl font-bold">Monthly Reports</h1><p>Monthly reporting coming soon...</p></div>;
      case 'analytics_reports':
        return <div className="p-6"><h1 className="text-2xl font-bold">Analytics Reports</h1><p>Analytics reporting coming soon...</p></div>;
      case 'custom':
        return <div className="p-6"><h1 className="text-2xl font-bold">Custom Reports</h1><p>Custom report builder coming soon...</p></div>;
      case 'settings':
        return <div className="p-6"><h1 className="text-2xl font-bold">Settings</h1><p>System settings coming soon...</p></div>;
      default:
        return <Dashboard />;
    }
  };
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Top Navigation */}
      <header className="bg-white shadow-sm z-10">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-800">
              Dashboard Overview
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            
            <button className="p-2 rounded-full hover:bg-gray-100 relative">
              <FiBell className="text-xl text-gray-600" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>
            
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                <FiUser className="text-indigo-600" />
              </div>
              {!sidebarCollapsed && <span className="text-sm font-medium">Admin User</span>}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
        {renderPage()}
      </main>
    </div>
  );
};

export default MainContent;
