import { useState, useEffect } from 'react';
import { Button, Label, TextInput, Card, Alert, FileInput, Select } from 'flowbite-react';
import {  HiExclamationCircle } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '@/assets/env';
import { getAuthToken } from '@/lib/getAuthToken';
import Mynavbar from '@/components/MyNavbar';
import { toast } from 'react-toastify';
import Loading from '@/components/Loading';

const AddProduct = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    image: null,
    stock: '',
    selling_price: '',
    purchase_price: '',
    category_id: '', // Akan diisi dengan UUID kategori
    barcode: '',
    store_id: '1'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);

  // Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsCategoriesLoading(true);
        const token = getAuthToken();
        const baseUrl = API_URL();
        
        const response = await axios.get(`${baseUrl}/api/category`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        
        // Transformasi data kategori sesuai struktur response
        const transformedCategories = response.data.data.map(category => ({
          id: category.id, // Gunakan id sebagai id
          name: category.name,
          capital: category.capital,
          remainingStock: category.remaining_stock
        }));

        setCategories(transformedCategories);
        setIsCategoriesLoading(false);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Gagal memuat kategori');
        setIsCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'file' ? files[0] : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const token = getAuthToken();
      const baseUrl = API_URL();
      
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'image' && !formData[key]) {
          return;
        }
        formDataToSend.append(key, formData[key]);
      });

      console.log(formDataToSend);

      const response = await axios.post(`${baseUrl}/api/products`, formDataToSend, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.status) {
        toast.success(response.data.message);
        navigate('/dashboard');
      } else {
        toast.error(response.data.message);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Terjadi kesalahan saat menambahkan produk';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <>
      <Mynavbar/>
      {isLoading ? (
        <Loading />
      ) : (
        <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto max-w-4xl">

            <Card className="shadow-xl hover:shadow-2xl dark:bg-dark-600 transition-shadow duration-300">
              <div className="flex items-center justify-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-600">Tambah Produk Baru</h2>
              </div>

              {error && (
                <Alert 
                  color="failure" 
                  icon={HiExclamationCircle} 
                  className="mb-4"
                >
                  {error}
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label 
                      htmlFor="name" 
                      value="Nama Produk" 
                      className="dark:text-gray-600" 
                    />
                    <TextInput
                      className="bg-white dark:bg-white focus:bg-white hover:bg-white dark:text-black"
                      style={{ backgroundColor: 'white', color: 'black' }}
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Masukkan nama produk"
                    />
                  </div>

                  <div>
                    <Label 
                      htmlFor="image" 
                      value="Gambar Produk" 
                      className="dark:text-gray-600" 
                    />
                    <FileInput
                      id="image"
                      name="image"
                      accept="image/*"
                      className="bg-white dark:bg-white focus:bg-white hover:bg-white dark:text-black"
                      style={{ backgroundColor: 'white', color: 'black' }}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label 
                      htmlFor="stock" 
                      value="Stok" 
                      className="dark:text-gray-600" 
                    />
                    <TextInput
                      id="stock"
                      name="stock"
                      type="number"
                      required
                      min="0"
                      className="bg-white dark:bg-white focus:bg-white hover:bg-white dark:text-black"
                      style={{ backgroundColor: 'white', color: 'black' }}
                      value={formData.stock}
                      onChange={handleChange}
                      placeholder="Masukkan jumlah stok"
                    />
                  </div>

                  <div>
                    <Label 
                      htmlFor="selling_price" 
                      value="Harga Jual" 
                      className="dark:text-gray-600" 
                    />
                    <TextInput
                      id="selling_price"
                      name="selling_price"
                      type="number"
                      required
                      min="0"
                      value={formData.selling_price}
                      onChange={handleChange}
                      placeholder="Masukkan harga jual"
                      className="bg-white dark:bg-white focus:bg-white hover:bg-white dark:text-black"
                      style={{ backgroundColor: 'white', color: 'black' }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label 
                      htmlFor="purchase_price" 
                      value="Harga Beli" 
                      className="dark:text-gray-600" 
                    />
                    <TextInput
                      id="purchase_price"
                      name="purchase_price"
                      type="number"
                      required
                      min="0"
                      value={formData.purchase_price}
                      onChange={handleChange}
                      placeholder="Masukkan harga beli"
                      className="bg-white dark:bg-white focus:bg-white hover:bg-white dark:text-black"
                      style={{ backgroundColor: 'white', color: 'black' }}
                    />
                  </div>

                  <div>
                    <Label 
                      htmlFor="category_id" 
                      value="Kategori" 
                      className="dark:text-gray-600" 
                    />
                    {isCategoriesLoading ? (
                      <div className="text-gray-500">Memuat kategori...</div>
                    ) : (
                      <Select
                        id="category_id"
                        name="category_id"
                        value={formData.category_id}
                        onChange={handleChange}
                        className="bg-white dark:bg-white focus:bg-white hover:bg-white dark:text-black"
                        style={{ backgroundColor: 'white', color: 'black' }}
                      >
                        <option value="">Pilih Kategori</option>
                        {categories.map((category) => (
                          <option key={category.id} value={Number(category.id)}>
                            {category.name}
                          </option>
                        ))}
                      </Select>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label 
                      htmlFor="barcode" 
                      value="Barcode" 
                      className="dark:text-gray-600" 
                    />
                    <TextInput
                      id="barcode"
                      name="barcode"
                      type="text"
                      required
                      value={formData.barcode}
                      onChange={handleChange}
                      placeholder="Masukkan barcode produk"
                      className="bg-white dark:bg-white focus:bg-white hover:bg-white dark:text-black"
                      style={{ backgroundColor: 'white', color: 'black' }}
                    />
                  </div>

                  <input 
                    type="hidden" 
                    name="store_id" 
                    value={formData.store_id}
                  />
                </div>

                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    gradientDuoTone="cyanToBlue"
                    className="w-full md:w-auto bg-blue-600"
                  >
                    {isLoading ? 'Sedang Menambahkan...' : 'Tambah Produk'}
                  </Button>
                </div>
              </form>
            </Card>

          </div>
        </div>
      )}
    </>
  );
};

export default AddProduct;