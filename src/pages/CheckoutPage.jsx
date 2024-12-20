// pages/CheckoutPage.jsx
import  { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button, TextInput, Alert } from 'flowbite-react';
import { API_URL } from '../assets/env';
import { getAuthToken } from '../lib/getAuthToken';

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart } = location.state || { cart: [] };
  
  const [cash, setCash] = useState('');
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const total = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);

  const handleCheckout = async () => {
    // Validasi input
    const cashAmount = parseFloat(cash);
    if (isNaN(cashAmount) || cashAmount < total) {
      setError('Jumlah uang tidak valid');
      return;
    }

    try {
      setIsProcessing(true);
      const token = getAuthToken();
      const baseUrl = API_URL();

      // Persiapkan payload transaksi
      const transactionPayload = {
        transaction: {
          cash: cashAmount,
          items: cart.map(item => ({
            id_product: item.id,
            quantity: item.quantity || 1
          }))
        }
      };

      // Kirim request transaksi
      const response = await axios.post(`${baseUrl}/api/transaction`, transactionPayload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Navigasi ke halaman sukses
      navigate('/transaction-success', { 
        state: { 
          transactionDetails: response.data.data,
          change: cashAmount - total,
          no_transaction: response.data.data.no_transaction
        } 
      });
    } catch (error) {
      console.error('Checkout error:', error);
      setError(error.response?.data?.message || 'Transaksi gagal');
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Checkout</h2>
        
        {/* Ringkasan Pesanan */}
        <div className="mb-6">
          <h3 className="font-semibold mb-4">Pesanan</h3>
          {cart.map(item => (
            <div key={item.id} className="flex justify-between mb-2">
              <span>{item.name} x {item.quantity || 1}</span>
              <span>Rp {(item.price * (item.quantity || 1)).toLocaleString()}</span>
            </div>
          ))}
          <div className="border-t mt-2 pt-2 flex justify-between font-bold">
            <span>Total</span>
            <span>Rp {total.toLocaleString()}</span>
          </div>
        </div>

        {/* Input Uang Tunai */}
        <div className="mb-6">
          <label htmlFor="cash" className="block mb-2 font-semibold">Uang Tunai</label>
          <TextInput
            id="cash"
            type="number"
            placeholder="Masukkan jumlah uang"
            style={{ backgroundColor: 'white', color: 'black' }}
            value={cash}
            onChange={(e) => {
              setCash(e.target.value);
              setError(null);
            }}
            className="bg-white text-gray-900 dark:bg-white dark:text-gray-900"
            theme={{
              base: "flex",
              input: {
                base: "block w-full border disabled:cursor-not-allowed disabled:opacity-50",
                colors: {
                  gray: "bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-blue-500 dark:bg-white dark:text-gray-900 dark:border-gray-600",
                }
              }
            }}
            color="gray"
            required
          />
        </div>

        {/* Error Alert */}
        {error && (
          <Alert color="failure" className="mb-4">
            {error}
          </Alert>
        )}

        {/* Tombol Bayar */}
        <Button 
          onClick={handleCheckout} 
          disabled={isProcessing}
          className="w-full bg-blue-600"
          gradientDuoTone="greenToBlue"
        >
          {isProcessing ? 'Memproses...' : 'Bayar'}
        </Button>
      </div>
    </div>
  );
};

export default CheckoutPage;