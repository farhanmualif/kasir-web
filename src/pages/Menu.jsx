import { ShoppingCart, CreditCard, Settings, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Menu() {
  const menuItems = [
    { 
      icon: <ShoppingCart className="w-10 h-10 text-blue-500" />, 
      title: "Stok Barang",
      navigateTo: '/buying-product',
      isBuyingProductPage: true
    },
    { 
      icon: <CreditCard className="w-10 h-10 text-green-500" />, 
      title: "Kasir", 
      navigateTo: '/transaction-page',
      isBuyingProductPage: false
    },
    { 
      icon: <Settings className="w-10 h-10 text-purple-500" />, 
      title: "Manajemen",
      navigateTo: '/management-page',
      isBuyingProductPage: false
    },
    { 
      icon: <FileText className="w-10 h-10 text-red-500" />, 
      title: "Laporan",
      navigateTo: '/report',
      isBuyingProductPage: false
    }
  ];

  return (
    <div className="p-4 sm:ml-64">
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4">
          {menuItems.map((item, index) => (
            <Link 
              to={item.navigateTo} 
              key={index} 
              className="flex flex-col items-center justify-center h-48 rounded bg-gray-50 dark:bg-white hover:bg-gray-100 dark:hover:bg-gray-200 transition-colors cursor-pointer dark:shadow-inner dark:hover:shadow-lg"
            >
              {item.icon}
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-600">
                {item.title}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}