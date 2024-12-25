import{ useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { 
  HiOutlineDocumentReport, 
  HiOutlineShoppingCart, 
  HiCurrencyDollar,
  HiClipboardList,

} from 'react-icons/hi';
import { toast } from 'react-toastify';
import Loading from '@/components/Loading';
import Mynavbar from '@/components/MyNavbar';
import { API_URL } from '@/assets/env';

const SalesReportPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [salesData, setSalesData] = useState({
    daily: { transactions: [] },
    monthly: {},
    yearly: {}
  });
  const [selectedPeriod, setSelectedPeriod] = useState('daily');
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('userToken');
        const baseUrl = API_URL();

        const today = new Date();
        const formatDate = (date) => date.toISOString().split('T')[0];
        const todayStr = formatDate(today);

        const [dailyResponse, monthlyResponse, yearlyResponse] = await Promise.all([
          axios.get(`${baseUrl}/api/sales/daily/${todayStr}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }).catch(() => ({ data: { status: true, data: { transactions: [], total_income: 0, total_profit: 0 } } })),
          axios.get(`${baseUrl}/api/sales/monthly/${todayStr}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }).catch(() => ({ data: { status: true, data: { transactions: [], total_income: 0, total_profit: 0 } } })),
          axios.get(`${baseUrl}/api/sales/yearly/${todayStr}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }).catch(() => ({ data: { status: true, data: { transactions: [], total_income: 0, total_profit: 0 } } }))
        ]);

        const dailyData = dailyResponse.data.status ? dailyResponse.data.data : { transactions: [], total_income: 0, total_profit: 0 };
        const monthlyData = monthlyResponse.data.status ? monthlyResponse.data.data : { transactions: [], total_income: 0, total_profit: 0 };
        const yearlyData = yearlyResponse.data.status ? yearlyResponse.data.data : { transactions: [], total_income: 0, total_profit: 0 };

        setSalesData({
          daily: dailyData,
          monthly: monthlyData,
          yearly: yearlyData
        });

        setChartData(prepareChartData('daily')); // Set initial chart data for daily view
      } catch (error) {
        console.error('Error fetching report data:', error);
        toast.error('Gagal memuat data laporan');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReportData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  const prepareChartData = (period) => {
    switch (period) {
      case 'daily':
        // Show transactions for current month
        return salesData.monthly.transactions?.map(day => ({
          date: day.date,
          income: parseFloat(day.income || 0),
          profit: parseFloat(day.profit || 0)
        })) || [];
      case 'monthly':
        // Show transactions for current year
        return salesData.yearly.transactions?.map(month => ({
          date: month.date,
          income: parseFloat(month.income || 0),
          profit: parseFloat(month.profit || 0)
        })) || [];
      case 'yearly':
        // Show transactions for multiple years
        return salesData.yearly.transactions?.map(year => ({
          date: year.date,
          income: parseFloat(year.income || 0),
          profit: parseFloat(year.profit || 0)
        })) || [];
      default:
        return [];
    }
  };

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    setChartData(prepareChartData(period));
  };

  if (isLoading) {
    return (
    <Loading />
    );
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
              Laporan Penjualan
            </h1>
            <p className="text-gray-600">Ringkasan kinerja penjualan Anda</p>
          </div>

          {/* Sales Overview Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* Daily Sales Card */}
            <div 
              className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer transition-all duration-200 ${selectedPeriod === 'daily' ? 'ring-2 ring-blue-500' : 'hover:shadow-md'}`}
              onClick={() => handlePeriodChange('daily')}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-600">Penjualan Hari Ini</h3>
                  <div className="flex items-center mt-2">
                    <HiOutlineShoppingCart className="mr-2 text-blue-600" />
                    <span className="text-2xl font-bold text-gray-800">
                      {salesData.daily.total_transactions || 0} Transaksi
                    </span>
                  </div>
                </div>
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  {formatCurrency(salesData.daily.total_revenue || 0)}
                </span>
              </div>
            </div>

            {/* Monthly Sales Card */}
            <div 
              className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer transition-all duration-200 ${selectedPeriod === 'monthly' ? 'ring-2 ring-blue-500' : 'hover:shadow-md'}`}
              onClick={() => handlePeriodChange('monthly')}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-600">Penjualan Bulan Ini</h3>
                  <div className="flex items-center mt-2">
                    <HiClipboardList className="mr-2 text-green-600" />
                    <span className="text-2xl font-bold text-gray-800">
                      {salesData.monthly.total_transactions || 0} Transaksi
                    </span>
                  </div>
                </div>
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  {formatCurrency(salesData.monthly.total_income || 0)}
                </span>
              </div>
            </div>

            {/* Yearly Sales Card */}
            <div 
              className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer transition-all duration-200 ${selectedPeriod === 'yearly' ? 'ring-2 ring-blue-500' : 'hover:shadow-md'}`}
              onClick={() => handlePeriodChange('yearly')}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-600">Penjualan Tahun Ini</h3>
                  <div className="flex items-center mt-2">
                    <HiCurrencyDollar className="mr-2 text-purple-600" />
                    <span className="text-2xl font-bold text-gray-800">
                      {salesData.yearly.total_transactions || 0} Transaksi
                    </span>
                  </div>
                </div>
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  {formatCurrency(salesData.yearly.total_income || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Sales Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              Performa Penjualan Bulanan
            </h2>
            <div className="w-full h-[400px]">
              <ResponsiveContainer>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [formatCurrency(value), 'Pendapatan']} 
                    labelStyle={{ fontWeight: 'bold' }}
                  />
                  <Legend />
                  <Bar dataKey="income" fill="#3B82F6" name="Pendapatan" />
                  <Bar dataKey="profit" fill="#10B981" name="Keuntungan" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Transaksi Terakhir */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <HiOutlineShoppingCart className="text-2xl text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-800">
                  Transaksi Terakhir
                </h2>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  {selectedPeriod === 'daily' && (
                  <tr>
                    <th scope="col" className="px-6 py-3">No. Transaksi</th>
                    <th scope="col" className="px-6 py-3">Waktu</th>
                    <th scope="col" className="px-6 py-3">Items</th>
                    <th scope="col" className="px-6 py-3">Status</th>
                    <th scope="col" className="px-6 py-3">Revenue</th>
                    <th scope="col" className="px-6 py-3">Profit</th>
                  </tr>
                  )}
                  {selectedPeriod === 'monthly' && (
                  <tr>
                    <th scope="col" className="px-6 py-3">Tanggal</th>
                    <th scope="col" className="px-6 py-3">Transaksi</th>
                    <th scope="col" className="px-6 py-3">Status</th>
                    <th scope="col" className="px-6 py-3">Revenue</th>
                    <th scope="col" className="px-6 py-3">Profit</th>
                  </tr>
                  )}
                  {}
                </thead>
                <tbody>
                  {selectedPeriod === 'daily' && salesData.daily.transactions?.map((transaction) => (
                    <tr key={transaction.no_transaction} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{transaction.no_transaction}</td>
                      <td className="px-6 py-4 text-gray-900">{transaction.time}</td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {transaction.items?.map((item, idx) => (
                            <div key={idx} className="text-sm">
                              <span className="text-gray-900">{item.name}</span>
                              <span className="text-gray-500 ml-2">
                                • {item.quantity} x {formatCurrency(item.price)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                          Success
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-900">{formatCurrency(transaction.revenue)}</td>
                      <td className="px-6 py-4 text-gray-900">{formatCurrency(transaction.profit)}</td>
                    </tr>
                  ))}
                  {selectedPeriod === 'monthly' && salesData.monthly.transactions?.map((transaction) => (
                    <tr key={transaction.date} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">Tanggal {transaction.date}</td>
                      <td className="px-6 py-4">{transaction.transaction_amount} transaksi</td>
                      <td className="px-6 py-4">
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                          Success
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-900">{formatCurrency(transaction.income)}</td>
                      <td className="px-6 py-4 text-gray-900">{formatCurrency(transaction.profit)}</td>
                    </tr>
                  ))}
                  {selectedPeriod === 'yearly' && salesData.yearly.transactions?.map((transaction) => (
                    <tr key={transaction.month_num} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{transaction.date}</td>
                      <td className="px-6 py-4">{transaction.total_transaction_permonth} transaksi</td>
                      <td className="px-6 py-4">
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                          Success
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-900">{formatCurrency(transaction.income)}</td>
                      <td className="px-6 py-4 text-gray-900">{formatCurrency(transaction.profit)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SalesReportPage;