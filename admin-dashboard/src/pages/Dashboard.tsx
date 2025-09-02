import { FiTrendingUp, FiUsers, FiDollarSign, FiShoppingCart } from 'react-icons/fi';

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Total Revenue', value: '$45,231', change: '+20.1%', icon: <FiDollarSign className="text-2xl" />, color: 'text-green-600' },
          { title: 'Total Users', value: '2,543', change: '+12%', icon: <FiUsers className="text-2xl" />, color: 'text-blue-600' },
          { title: 'Orders', value: '1,234', change: '+8.2%', icon: <FiShoppingCart className="text-2xl" />, color: 'text-purple-600' },
          { title: 'Growth', value: '15.3%', change: '+2.1%', icon: <FiTrendingUp className="text-2xl" />, color: 'text-orange-600' },
        ].map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
                <span className="text-sm text-green-600">{stat.change}</span>
              </div>
              <div className={`${stat.color} bg-gray-50 p-3 rounded-lg`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart Placeholder */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <h2 className="text-lg font-semibold mb-4">Revenue Trends</h2>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Chart placeholder - Connect your analytics here</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
