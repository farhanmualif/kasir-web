// components/Cart.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'flowbite-react';
import { FaTrash, FaMinus, FaPlus } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '@/assets/env';
import { getAuthToken } from '@/lib/getAuthToken';
import Loading from '@/components/Loading';

const Cart = ({
  cart = [], 
  onRemoveFromCart = () => {}, 
  onCheckout = () => {}, 
  setCart = () => {}, 
  isBuyProduct = false
}) => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [error, setError] = React.useState(null);

  const total = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);

  const updateQuantity = (product, delta) => {
    setCart(cart.map(item => {
      if (item.uuid === product.uuid) {
        const newQuantity = (item.quantity || 1) + delta;
        return newQuantity < 1 ? item : { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const handlePurchase = async () => {
    const isStockValid = cart.every(item => (item.quantity || 1) <= item.stock);
    
    if (!isStockValid) {
      setError('Jumlah produk melebihi stok yang tersedia');
      return;
    }

    try {
      setIsProcessing(true);
      const token = getAuthToken();
      const baseUrl = API_URL();

      const purchasePayload = {
        products: cart.map(item => ({
          uuid: item.uuid,
          barcode: item.barcode || '',
          quantity_stok: item.quantity || 1
        }))
      };

      const response = await axios.post(`${baseUrl}/api/products/purchase/existing`, purchasePayload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      navigate('/transaction-success', { 
        state: { 
          purchaseDetails: response.data,
          purchasedItems: cart
        } 
      });
    } catch (error) {
      console.error('Purchase error:', error);
      setError(error.response?.data?.message || 'Pembelian gagal');
      setIsProcessing(false);
    }
  };

  const handleCheckout = () => {
    if (isBuyProduct) {
      handlePurchase();
    } else {
      onCheckout();
    }
  };

  if (isProcessing) {
    return <Loading />;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6">
        {isBuyProduct ? 'Tambah Stok Produk' : 'Shopping Cart'}
      </h2>
      
      {cart.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Keranjang kosong</p>
        </div>
      ) : (
        <div>
          {/* Render cart items */}
          <div className="space-y-4 mb-6">
            {cart.map((item) => (
              <div key={item.uuid} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div>
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-gray-600">
                      {isBuyProduct 
                        ? `Stok: ${item.stock}` 
                        : `Rp ${item.price.toLocaleString()}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item, -1)}
                      className="p-1 text-gray-500 hover:text-blue-600"
                    >
                      <FaMinus size={12} />
                    </button>
                    <input 
                      type="number" 
                      className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-16 p-2.5" 
                      value={item.quantity || 1}
                      min="1"
                      onChange={(e) => {
                        const newQuantity = parseInt(e.target.value, 10);
                        if (!isNaN(newQuantity)) {
                          updateQuantity(item, newQuantity - (item.quantity || 1));
                        }
                      }}
                    />
                    <button
                      onClick={() => updateQuantity(item, 1)}
                      className="p-1 text-gray-500 hover:text-blue-600"
                    >
                      <FaPlus size={12} />
                    </button>
                  </div>
                  <button
                    onClick={() => onRemoveFromCart(item)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Error handling */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {/* Total dan Checkout */}
          <div className="border-t pt-4">
            <div className="flex justify-between mb-4">
              <span className="font-semibold">Total:</span>
              <span className="font-bold text-xl text-blue-600">
                {isBuyProduct 
                  ? `${cart.reduce((sum, item) => sum + (item.quantity || 1), 0)} Produk` 
                  : `Rp ${total.toLocaleString()}`}
              </span>
            </div>
            <Button
              onClick={handleCheckout}
              className="w-full bg-blue-600"
              gradientDuoTone="greenToBlue"
              disabled={isProcessing}
            >
              {isProcessing 
                ? 'Memproses...' 
                : (isBuyProduct ? 'Tambah Stok' : 'Proceed to Checkout')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// Hapus defaultProps dan gunakan default parameter
Cart.propTypes = {
  cart: PropTypes.arrayOf(PropTypes.shape({
    uuid: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    price: PropTypes.number,
    image: PropTypes.string,
    quantity: PropTypes.number,
    stock: PropTypes.number,
    barcode: PropTypes.string
  })),
  onRemoveFromCart: PropTypes.func,
  onCheckout: PropTypes.func,
  setCart: PropTypes.func,
  isBuyProduct: PropTypes.bool
};

export default Cart;