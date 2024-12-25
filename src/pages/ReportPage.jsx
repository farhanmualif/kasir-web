import { Card } from 'flowbite-react';
import {  HiDocumentReport, HiShoppingCart } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';

const ReportPage = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Laporan</h1>
      
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Laporan Penjualan Card */}
        <Card
          className="transform transition-all hover:scale-105 cursor-pointer hover:shadow-xl dark:bg-white border-none"
          onClick={() => navigate('/purchase-report')}
        >
          <div className="flex flex-col items-center p-8">
            <div className="mb-4 rounded-full bg-blue-100 p-6">
              <HiDocumentReport className="h-12 w-12 text-blue-600" />
            </div>
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Laporan Penjualan
            </h5>
            <p className="text-gray-600 text-center">
              Lihat dan kelola laporan penjualan harian, bulanan, dan tahunan
            </p>
          </div>
        </Card>

        {/* Laporan Pembelian Card */}
        <Card
          className="transform transition-all hover:scale-105 cursor-pointer hover:shadow-xl dark:bg-white border-none"
          onClick={() => navigate('/sales-report')}
        >
          <div className="flex flex-col items-center p-8">
            <div className="mb-4 rounded-full bg-green-100 p-6">
              <HiShoppingCart className="h-12 w-12 text-green-600" />
            </div>
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Laporan Pembelian
            </h5>
            <p className="text-gray-600 text-center">
              Lihat dan kelola laporan pembelian dan stok masuk
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ReportPage;
