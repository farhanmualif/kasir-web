import { useState, useEffect } from 'react';
import axios from 'axios';
import ProductGrid from '../components/ProductGrid';
import Cart from '../components/Cart';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../assets/env';
import { getAuthToken } from '../lib/getAuthToken';
import MyNavbar from '../components/Mynavbar';
import Loading from '../components/Loading';

const TransactionPage = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [isCartVisible, setIsCartVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const token = getAuthToken();
        const baseUrl = API_URL();
        
        const response = await axios.get(`${baseUrl}/api/products`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        
        // Transformasi data produk dengan endpoint gambar baru
        const transformedProducts = await Promise.all(response.data.data.map(async (product) => {
          try {
            // Ambil gambar dari endpoint spesifik
            const imageResponse = await axios.get(`${baseUrl}/api/products/images/${product.uuid}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'image/*'
              },
              responseType: 'blob' // Penting untuk mendapatkan data gambar
            });
  
            // Buat URL objek dari blob gambar
            const imageUrl = URL.createObjectURL(new Blob([imageResponse.data]));
  
            return {
              id: product.id,
              uuid: product.uuid,
              name: product.name,
              price: parseFloat(product.selling_price),
              image: imageUrl, // Gunakan URL objek dari gambar
              description: 'Produk berkualitas',
              category: 'Produk',
              stock: product.stock
            };
          } catch (imageError) {
            console.error(`Error fetching image for product ${product.uuid}:`, imageError);
            return {
              id: product.id,
              uuid: product.uuid,
              name: product.name,
              price: parseFloat(product.selling_price),
              image: 'default-image.png', // Gambar default jika gagal
              description: 'Produk berkualitas',
              category: 'Produk',
              stock: product.stock
            };
          }
        }));
  
        setProducts(transformedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to fetch products');
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchProducts();
  }, []);

  // Tambahkan cleanup untuk menghindari memory leak
  useEffect(() => {
    return () => {
      // Bersihkan URL objek yang dibuat
      products.forEach(product => {
        if (product.image.startsWith('blob:')) {
          URL.revokeObjectURL(product.image);
        }
      });
    };
  }, [products]);

  const handleAddToCart = (product) => {
    const existingProduct = cart.find(item => item.id === product.id);
    if (existingProduct) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? {...item, quantity: (item.quantity || 1) + 1}
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const handleRemoveFromCart = (product) => {
    setCart(cart.filter((item) => item.id !== product.id));
  };

  const handleCheckout = () => {
    console.log('Checkout clicked!');
    navigate('/checkout', { state: { cart } });
    // Implementasi checkout
  };


  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <MyNavbar isBuyingProduct={false}/>
      
      {/* Tombol Toggle Cart untuk Mobile */}
      <div className="fixed bottom-6 right-6 md:hidden z-50">
        <button 
          onClick={() => setIsCartVisible(!isCartVisible)}
          className="bg-blue-600 text-white p-4 rounded-full shadow-xl hover:bg-blue-700 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </button>
      </div>

      <main className="container mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            Transaksi Kasir 
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Pilih produk untuk ditambahkan ke keranjang
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Product Grid */}
          <div className="w-full lg:w-2/3">
            <ProductGrid 
              products={products} 
              onAddToCart={handleAddToCart}
            />
          </div>

          {/* Cart Section */}
          <div className={`
            fixed inset-0 lg:static lg:w-1/3
            ${isCartVisible ? 'block' : 'hidden'} 
            lg:block z-40
          `}>
            {/* Overlay untuk mobile */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 lg:hidden"
              onClick={() => setIsCartVisible(false)}
            ></div>

            {/* Cart Content */}
            <div className={`
              fixed right-0 top-0 h-full w-[90%] sm:w-[400px] 
              lg:static lg:w-full
              bg-white shadow-xl lg:shadow-md
              transform transition-transform duration-300 ease-in-out
              ${isCartVisible ? 'translate-x-0' : 'translate-x-full'} 
              lg:translate-x-0 rounded-lg
            `}>
              <div className="h-full lg:sticky lg:top-4">
                <div className="flex justify-between items-center lg:hidden p-4 border-b">
                  <h2 className="text-xl font-bold text-gray-800">Keranjang</h2>
                  <button 
                    onClick={() => setIsCartVisible(false)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <Cart 
                  cart={cart} 
                  onRemoveFromCart={handleRemoveFromCart} 
                  onCheckout={handleCheckout}
                  setCart={setCart}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TransactionPage;