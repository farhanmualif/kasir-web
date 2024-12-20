import { useState, useEffect } from 'react';

import ProductGrid from '../components/ProductGrid';
import Cart from '../components/Cart';


import axios from 'axios';
import { API_URL } from '../assets/env';
import { getAuthToken } from '../lib/getAuthToken';
import MyNavbar from '../components/Mynavbar';
import Loading from '../components/Loading';

const BuyingProduct = () => {
  
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [isCartVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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
        
        const transformedProducts = await Promise.all(response.data.data.map(async (product) => {
          try {
            const imageResponse = await axios.get(`${baseUrl}/api/products/images/${product.uuid}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'image/*'
              },
              responseType: 'blob'
            });

            const imageUrl = URL.createObjectURL(new Blob([imageResponse.data]));

            return {
              id: product.id,
              uuid: product.uuid,
              name: product.name,
              price: parseFloat(product.selling_price),
              barcode: product.barcode,
              image: imageUrl,
              description: product.description || 'Produk berkualitas',
              category: product.category?.length > 0 ? product.category[0].name : '',
              stock: product.stock
            };
          } catch (imageError) {
            console.error(`Error fetching image for product ${product.uuid}:`, imageError);
            return {
              id: product.id,
              uuid: product.uuid,
              name: product.name,
              price: parseFloat(product.selling_price),
              image: 'default-image.png',
              barcode: product.barcode,
              description: product.description || 'Produk berkualitas',
              category: product.category?.length > 0 ? product.category[0].name : '',
              stock: product.stock
            };
          }
        }));

        setProducts(transformedProducts);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setError('Failed to fetch products');
        setIsLoading(false);
      }
    };

    fetchProducts();

    return () => {
      products.forEach(product => {
        if (product.image.startsWith('blob:')) {
          URL.revokeObjectURL(product.image);
        }
      });
    };
  }, []);

  const handleAddToCart = (product) => {
    const existingProduct = cart.find(item => item.uuid === product.uuid);
    if (existingProduct) {
      setCart(cart.map(item => 
        item.uuid === product.uuid 
          ? {...item, quantity: (item.quantity || 1) + 1}
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const handleRemoveFromCart = (product) => {
    setCart(cart.filter((item) => item.uuid !== product.uuid));
  };

  const handleCheckout = () => {
    console.log('Checkout clicked!');
    // Implementasi checkout
  };

  // Fungsi navigasi ke halaman add-product

  

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loading/>
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
      <MyNavbar isBuyingProduct={true}/>
      
      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Pembelian Produk</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <ProductGrid products={products} onAddToCart={handleAddToCart} isBuyProduct={true} />
          </div>
          <div className={`lg:col-span-1 transition-all duration-300 ${isCartVisible ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
            <div className="sticky top-4">
              <Cart 
                cart={cart} 
                onRemoveFromCart={handleRemoveFromCart} 
                onCheckout={handleCheckout}
                setCart={setCart}
                isBuyProduct={true}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BuyingProduct;