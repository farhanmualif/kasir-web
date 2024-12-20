import { Button, Spinner, Modal, TextInput, Label } from 'flowbite-react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { HiPencil, HiTrash,  HiCamera } from 'react-icons/hi';
import { format } from 'date-fns';
import { API_URL } from '../assets/env';
import { getAuthToken } from '../lib/getAuthToken';
import MyNavbar from '../components/Mynavbar';
import { toast, ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";


const ProductListPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    barcode: '',
    add_or_reduce_stock: 'add',
    quantity_stok: '',
    selling_price: '',
    purchase_price: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openImageModal, setOpenImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isImageSubmitting, setIsImageSubmitting] = useState(false);

  const fetchProducts = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
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
          return { ...product, imageUrl };
        } catch (imageError) {
          console.error(`Error fetching image for product ${product.uuid}:`, imageError);
          return { ...product, imageUrl: null };
        }
      }));
      
      setProducts(transformedProducts);
      if (showLoading) {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to fetch products');
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchProducts(true);
    return () => {
      products.forEach(product => {
        if (product.imageUrl?.startsWith('blob:')) {
          URL.revokeObjectURL(product.imageUrl);
        }
      });
    };
  }, []);

  const handleEdit = (product) => {
    console.log(product);
    setIsEditing(true);
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      barcode: product.barcode,
      add_or_reduce_stock: 'add',
      quantity_stok: '', 
      selling_price: product.selling_price,
      purchase_price: product.purchase_price
    });
    setOpenModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = getAuthToken();
      const baseUrl = API_URL();

      const formDataToSend = {
        name: formData.name,
        barcode: formData.barcode,
        add_or_reduce_stock: formData.add_or_reduce_stock,
        quantity_stok: parseInt(formData.quantity_stok) || 0,
        selling_price: parseInt(formData.selling_price),
        purchase_price: parseInt(formData.purchase_price)
      };

      const response = await axios.put(
        `${baseUrl}/api/products/${selectedProduct.uuid}`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );



      if (response.data.status === true) {
        setFormData({
          name: '',
          barcode: '',
          add_or_reduce_stock: 'add',
          quantity_stok: '',
          selling_price: '',
          purchase_price: ''
        });
        setOpenModal(false);
        setIsEditing(false);
        setSelectedProduct(null);
        await fetchProducts(false);
        setTimeout(() => {
          toast.success(response.data.message);
        }, 50);
      } else {
        setTimeout(() => {
          toast.error(response.data.message);
        }, 50);
      }
    } catch (err) {
      console.error(err);
      setTimeout(() => {
        toast.error('Gagal mengubah produk');
      }, 50);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;

    setIsDeleting(true);
    try {
      const token = getAuthToken();
      const baseUrl = API_URL();
      
      const response = await axios.delete(`${baseUrl}/api/products/${selectedProduct.uuid}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.status === true) {
        setOpenDeleteModal(false);
        await fetchProducts(false);
        setTimeout(() => {
          toast.success(response.data.message);
        }, 50);
      } else {
        setTimeout(() => {
          toast.error(response.data.message);
        }, 50);
      }

      setOpenDeleteModal(false);
    } catch (err) {
      console.error(err);
      setTimeout(() => {
        toast.error('Gagal menghapus produk');
      }, 50);
    } finally {
      setIsDeleting(false);
      setSelectedProduct(null);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        toast.error('Format file harus png, jpg, atau jpeg');
        return;
      }
      // Validate file size (2MB = 2 * 1024 * 1024 bytes)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Ukuran file maksimum adalah 2MB');
        return;
      }
      setSelectedImage(file);
    }
  };

  const handleImageUpdate = async (e) => {
    e.preventDefault();
    if (!selectedProduct || !selectedImage) return;

    setIsImageSubmitting(true);
    try {
      const token = getAuthToken();
      const baseUrl = API_URL();

      const formData = new FormData();
      formData.append('image', selectedImage);
      formData.append('_method', 'PUT'); 

      const response = await axios.post( 
        `${baseUrl}/api/products/${selectedProduct.uuid}/image`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.status === true) {
        toast.success('Gambar berhasil diperbarui');
        setOpenImageModal(false);
        setSelectedImage(null);
        setSelectedProduct(null);
        await fetchProducts(false);
      } else {
        toast.error(response.data.message || 'Gagal mengubah gambar produk');
      }
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.message || 'Gagal mengubah gambar produk';
      toast.error(errorMessage);
    } finally {
      setIsImageSubmitting(false);
    }
  };

  const handleImageEdit = (product) => {
    if (!product) return;
    
    setSelectedProduct(product);
    setSelectedImage(null); 
    setOpenImageModal(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="xl" />
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
    <div className="min-h-screen bg-gray-50">
      <MyNavbar />
      <ToastContainer />
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Daftar Produk</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Gambar
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nama Produk
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Barcode
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stok
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Harga Jual
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Harga Beli
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal Dibuat
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.uuid}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <img 
                          src={product.imageUrl || `${API_URL()}/storage/product-default.png`}
                          alt={product.name}
                          className="h-12 w-12 object-cover rounded"
                          onError={(e) => {
                            e.target.src = `${API_URL()}/storage/product-default.png`;
                          }}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product.barcode}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product.stock}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR'
                        }).format(product.selling_price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR'
                        }).format(product.purchase_price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {format(new Date(product.created_at), 'dd/MM/yyyy HH:mm')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <Button 
                            size="sm"
                            onClick={() => handleEdit(product)}
                            className="bg-blue-600 py-2"
                          >
                          <HiPencil className="h-4 w-4" />
                           Edit
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleImageEdit(product)}
                          className="bg-green-600 py-2"
                        >
                        <HiCamera className="h-4 w-4" />
                         Ubah Gambar
                        </Button>
                        <Button 
                          size="sm"
                          color="failure"
                          onClick={() => {
                            setSelectedProduct(product);
                            setOpenDeleteModal(true);
                          }}
                          className="bg-red-600 py-2"
                        >
                        <HiTrash className="h-4 w-4" />
                         Hapus
                        </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        show={openDeleteModal}
        size="sm"
        onClose={() => setOpenDeleteModal(false)}
      >
        <Modal.Header className="bg-white"><h1 className='text-gray-900'>Konfirmasi Hapus</h1></Modal.Header>
        <Modal.Body className="bg-white">
          <div className="space-y-6">
            <p className="text-base leading-relaxed text-gray-500">
              Apakah Anda yakin ingin menghapus produk &quot;{selectedProduct?.name}&quot;?
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer className="bg-white">
          <Button
            color="failure"
            className='bg-red-600 dark:bg-red-600'
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Menghapus...
              </>
            ) : (
              'Ya, Hapus'
            )}
          </Button>
          <Button
            color="gray"
            className='bg-gray-600 dark:bg-gray-600'
            onClick={() => setOpenDeleteModal(false)}
            disabled={isDeleting}
          >
            Batal
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Modal */}
      <Modal
        show={openModal}
        onClose={() => {
          setOpenModal(false);
          setIsEditing(false);
          setSelectedProduct(null);
          setFormData({
            name: '',
            barcode: '',
            add_or_reduce_stock: 'add',
            quantity_stok: '',
            selling_price: '',
            purchase_price: ''
          });
        }}
        size="sm"
      >
        <Modal.Header className="border-b border-gray-200 !p-6 !m-0 bg-white">
          <div className="flex items-center">
            <span className="text-lg font-semibold text-gray-900">
              Edit Produk
            </span>
          </div>
        </Modal.Header>
        <Modal.Body className="!p-6 bg-white">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label
                htmlFor="name"
                className="text-sm font-medium text-gray-900 mb-1 dark:text-gray-900"
                value="Nama Produk"
              />
              <TextInput
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required={true}
                className="w-full"
                style={{ backgroundColor: 'white', color: 'black' }}
              />
            </div>
            <div>
              <Label
                htmlFor="barcode"
                className="text-sm font-medium text-gray-900 mb-1 dark:text-gray-900"
                value="Barcode"
              />
              <TextInput
                id="barcode"
                type="text"
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                required={true}
                className="w-full"
                style={{ backgroundColor: 'white', color: 'black' }}
              />
            </div>
            <div>
              <Label
                htmlFor="add_or_reduce_stock"
                className="text-sm font-medium text-gray-900 mb-1 dark:text-gray-900"
                value="Tambah/Kurangi Stok"
              />
              <select
                id="add_or_reduce_stock"
                value={formData.add_or_reduce_stock}
                onChange={(e) => setFormData({ ...formData, add_or_reduce_stock: e.target.value })}
                required={true}
                className="w-full"
                style={{ backgroundColor: 'white', color: 'black' }}
              >
                <option value="add">Tambah Stok</option>
                <option value="reduce">Kurangi Stok</option>
              </select>
            </div>
            <div>
              <Label
                htmlFor="quantity_stok"
                className="text-sm font-medium text-gray-900 mb-1 dark:text-gray-900"
                value="Jumlah yang akan ditambah/dikurangi"
              />
              <TextInput
                id="quantity_stok"
                type="number"
                min="1"
                placeholder="Masukkan jumlah"
                value={formData.quantity_stok}
                onChange={(e) => setFormData({ ...formData, quantity_stok: e.target.value })}
                className="w-full"
                style={{ backgroundColor: 'white', color: 'black' }}
              />
            </div>
            <div>
              <Label
                htmlFor="selling_price"
                className="text-sm font-medium text-gray-900 mb-1 dark:text-gray-900"
                value="Harga Jual"
              />
              <TextInput
                id="selling_price"
                type="number"
                value={formData.selling_price}
                onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
                required={true}
                className="w-full"  
                style={{ backgroundColor: 'white', color: 'black' }}
              />
            </div>
            <div>
              <Label
                htmlFor="purchase_price"
                className="text-sm font-medium text-gray-900 mb-1 dark:text-gray-900"
                value="Harga Beli"
              />
              <TextInput
                id="purchase_price"
                type="number"
                value={formData.purchase_price}
                onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
                required={true}
                className="w-full"
                style={{ backgroundColor: 'white', color: 'black' }}
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button
                color="gray"
                onClick={() => {
                  setOpenModal(false);
                  setIsEditing(false);
                  setSelectedProduct(null);
                  setFormData({
                    name: '',
                    barcode: '',
                    add_or_reduce_stock: 'add',
                    quantity_stok: '',
                    selling_price: '',
                    purchase_price: ''
                  });
                }}
                disabled={isSubmitting}
                className="bg-gray-200 text-gray-900 hover:bg-gray-300"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-700 text-white hover:bg-blue-800"
              >
                {isSubmitting ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Mengubah...
                  </>
                ) : (
                  'Simpan Perubahan'
                )}
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      {/* Image Update Modal */}
      <Modal
        show={openImageModal}
        onClose={() => {
          setOpenImageModal(false);
          setSelectedImage(null);
          setSelectedProduct(null);
        }}
        size="md"
      >
        <Modal.Header className='dark:bg-white'>
          <h1 className='text-gray-900 dark:text-gray-900'>Update Gambar Produk</h1>
        </Modal.Header>
        <form onSubmit={handleImageUpdate}>
          <Modal.Body className='dark:bg-white'>
            <div className="space-y-4">
              <div>
                <Label htmlFor="image" value="Gambar Produk Saat Ini" className='dark:text-gray-900'/>
                <div className="mt-2">
                  <img 
                    src={`${API_URL()}/api/products/images/${selectedProduct?.uuid}`}
                    alt="Current product" 
                    className="w-32 h-32 object-cover rounded"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="newImage" value="Pilih Gambar Baru" className='dark:text-gray-900' />
                <input
                  type="file"
                  id="newImage"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleImageChange}
                  className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  required
                />
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer className='dark:bg-white'>
            <div className="flex justify-end gap-2">
              <Button 
                className='bg-gray-600 dark:bg-gray-600'
                color="gray" 
                onClick={() => {
                  setOpenImageModal(false);
                  setSelectedImage(null);
                  setSelectedProduct(null);
                }}
                type="button"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isImageSubmitting || !selectedImage}
                className="bg-blue-600"
              >
                {isImageSubmitting ? (
                  <>
                    <Spinner size="sm" className="mr-3" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  'Simpan Perubahan'
                )}
              </Button>
            </div>
          </Modal.Footer>
        </form>
      </Modal>
    </div>
  );
};

export default ProductListPage;
