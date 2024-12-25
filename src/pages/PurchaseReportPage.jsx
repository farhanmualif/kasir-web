import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { toast } from 'react-toastify';
import { API_URL } from '@/assets/env';
import { 
  HiOutlineDocumentReport, 
  HiOutlineShoppingCart, 
  HiCurrencyDollar,
  HiClipboardList,
} from 'react-icons/hi';
import Mynavbar from '@/components/MyNavbar';
import Loading from '@/components/Loading';

export default function PurchaseReportPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('daily');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchPurchaseReport = async () => {
    setLoading(true);
    try {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      const baseUrl = API_URL();
      const userToken = localStorage.getItem('userToken');
      
      let endpoint = '';
      switch(viewMode) {
        case 'daily':
          endpoint = `${baseUrl}/api/purchases/daily/${formattedDate}`;
          break;
        case 'monthly':
          endpoint = `${baseUrl}/api/purchases/monthly/${formattedDate}`;
          break;
        case 'yearly':
          endpoint = `${baseUrl}/api/purchases/yearly/${formattedDate}`;
          break;
      }

      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${userToken}` }
      });

      setReportData(response.data.data);
    } catch (error) {
      toast.error('Gagal mengambil data pembelian');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchaseReport();
  }, [selectedDate, viewMode]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  const renderDailyTable = () => (
    <table className="min-w-full">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Waktu</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">No Transaksi</th>
          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Pembelian</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {reportData?.items_purchasing?.map((item, index) => (
          <tr key={index}>
            <td className="px-6 py-4 whitespace-nowrap">{item.time}</td>
            <td className="px-6 py-4 whitespace-nowrap">{item.no_transaction}</td>
            <td className="px-6 py-4 whitespace-nowrap text-right">{formatCurrency(item.purchases)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderMonthlyTable = () => (
    <table className="min-w-full">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Jumlah Transaksi</th>
          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Pengeluaran</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {reportData?.daily_data?.map((item, index) => (
          <tr key={index}>
            <td className="px-6 py-4 whitespace-nowrap">
              {format(new Date(item.date), 'dd MMMM yyyy', { locale: id })}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-center">{item.total_transaction}</td>
            <td className="px-6 py-4 whitespace-nowrap text-right">{formatCurrency(item.expenditure)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const renderYearlyTable = () => (
    <table className="min-w-full">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bulan</th>
          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Jumlah Transaksi</th>
          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Pengeluaran</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {reportData?.monthly_purchases?.map((item, index) => (
          <tr key={index}>
            <td className="px-6 py-4 whitespace-nowrap">{`${item.month_name} ${item.year}`}</td>
            <td className="px-6 py-4 whitespace-nowrap text-center">{item.total_transaction}</td>
            <td className="px-6 py-4 whitespace-nowrap text-right">{formatCurrency(item.total_expendeture)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <Mynavbar isBuyingProduct={false} />
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="container mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 flex items-center mb-2">
              <HiOutlineDocumentReport className="mr-4 text-blue-600" />
              Laporan Pembelian
            </h1>
            <p className="text-gray-600">Ringkasan pembelian barang</p>
          </div>

          {/* Controls */}
          <div className="mb-8 flex flex-wrap gap-4 items-center">
            <select 
              value={viewMode} 
              onChange={(e) => setViewMode(e.target.value)}
              className="bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="daily">Harian</option>
              <option value="monthly">Bulanan</option>
              <option value="yearly">Tahunan</option>
            </select>

            <DatePicker
              selected={selectedDate}
              onChange={date => setSelectedDate(date)}
              dateFormat="dd/MM/yyyy"
              className="bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {reportData && (
            <div className="space-y-6">
              {/* Overview Cards */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-600">Total Transaksi</h3>
                      <div className="flex items-center mt-2">
                        <HiOutlineShoppingCart className="mr-2 text-blue-600" />
                        <span className="text-2xl font-bold text-gray-800">
                          {viewMode === 'daily' ? reportData.total_transaction :
                           viewMode === 'monthly' ? reportData.total_purchases :
                           reportData.total_transaction} Transaksi
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-600">Total Pengeluaran</h3>
                      <div className="flex items-center mt-2">
                        <HiCurrencyDollar className="mr-2 text-red-600" />
                        <span className="text-2xl font-bold text-red-600">
                          {formatCurrency(
                            viewMode === 'daily' ? reportData.total_expenditure :
                            viewMode === 'monthly' ? reportData.total_expenditure :
                            reportData.total_expendeture
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center">
                    <HiClipboardList className="text-2xl text-blue-600 mr-2" />
                    <h2 className="text-xl font-semibold text-gray-800">
                      Detail Transaksi
                    </h2>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  {viewMode === 'daily' && renderDailyTable()}
                  {viewMode === 'monthly' && renderMonthlyTable()}
                  {viewMode === 'yearly' && renderYearlyTable()}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
} 