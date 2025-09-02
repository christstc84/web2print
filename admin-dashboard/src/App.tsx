import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';

export type PageType = 'dashboard' | 'fonts' | 'colors' | 'fixed_prices' | 'print_options' | 'templates' | 
                      'items' | 'orders' | 'products' | 'users' | 'roles' | 'permissions' | 
                      'analytics' | 'monthly' | 'analytics_reports' | 'custom' | 'settings' | 'local_files';

// Map URL paths to PageType
const pathToPageMap: Record<string, PageType> = {
  '/': 'dashboard',
  '/dashboard': 'dashboard',
  '/fonts': 'fonts',
  '/colors': 'colors',
  '/fixed-prices': 'fixed_prices',
  '/print-options': 'print_options',
  '/templates': 'templates',
  '/items': 'items',
  '/orders': 'orders',
  '/products': 'products',
  '/users': 'users',
  '/roles': 'roles',
  '/local-files': 'local_files',
  '/permissions': 'permissions',
  '/analytics': 'analytics',
  '/analytics/monthly': 'monthly',
  '/analytics/reports': 'analytics_reports',
  '/analytics/custom': 'custom',
  '/settings': 'settings'
};

// Special handling for print option category pages
const getPrintOptionCategoryPage = (pathname: string): PageType | null => {
  const printOptionCategoryMatch = pathname.match(/^\/print-options\/([^\/]+)$/);
  return printOptionCategoryMatch ? 'print_options' : null;
};

function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  
  // Get current page from URL
  const currentPage: PageType = pathToPageMap[location.pathname] || getPrintOptionCategoryPage(location.pathname) || 'dashboard';

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar 
        collapsed={sidebarCollapsed} 
        toggleSidebar={toggleSidebar}
        currentPage={currentPage}
      />
      <MainContent 
        sidebarCollapsed={sidebarCollapsed} 
        currentPage={currentPage}
      />
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppLayout />} />
        <Route path="/dashboard" element={<AppLayout />} />
        <Route path="/fonts" element={<AppLayout />} />
        <Route path="/colors" element={<AppLayout />} />
        <Route path="/fixed-prices" element={<AppLayout />} />
        <Route path="/print-options" element={<AppLayout />} />
        <Route path="/print-options/:categoryId" element={<AppLayout />} />
        <Route path="/templates" element={<AppLayout />} />
        <Route path="/local-files" element={<AppLayout />} />
        <Route path="/items" element={<AppLayout />} />
        <Route path="/orders" element={<AppLayout />} />
        <Route path="/products" element={<AppLayout />} />
        <Route path="/users" element={<AppLayout />} />
        <Route path="/roles" element={<AppLayout />} />
        <Route path="/permissions" element={<AppLayout />} />
        <Route path="/analytics" element={<AppLayout />} />
        <Route path="/analytics/monthly" element={<AppLayout />} />
        <Route path="/analytics/reports" element={<AppLayout />} />
        <Route path="/analytics/custom" element={<AppLayout />} />
        <Route path="/settings" element={<AppLayout />} />
      </Routes>
    </Router>
  );
}

export default App;
