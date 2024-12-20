import { Card } from 'flowbite-react';
import { HiArchive, HiViewGrid } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';

const ManagementPage = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Menu Management</h1>
      
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Kelola Stok Barang Card */}
        <Card
          className="transform transition-all hover:scale-105 cursor-pointer hover:shadow-xl dark:bg-white border-none"
          onClick={() => navigate('/products')}
        >
          <div className="flex flex-col items-center p-8">
            <div className="mb-4 rounded-full bg-blue-100 p-6">
              <HiArchive className="h-12 w-12 text-blue-600" />
            </div>
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Kelola Inventaris
            </h5>
            <p className="text-gray-600 text-center">
              Kelola produk, edit informasi, dan hapus produk yang tidak aktif
            </p>
          </div>
        </Card>

        {/* Kelola Kategori Card */}
        <Card
          className="transform transition-all hover:scale-105 cursor-pointer hover:shadow-xl dark:bg-white border-none"
          onClick={() => navigate('/category')}
        >
          <div className="flex flex-col items-center p-8">
            <div className="mb-4 rounded-full bg-purple-100 p-6">
              <HiViewGrid className="h-12 w-12 text-purple-600" />
            </div>
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Kelola Kategori
            </h5>
            <p className="text-gray-600 text-center">
              Atur dan kelola kategori produk untuk organisasi yang lebih baik
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ManagementPage;
