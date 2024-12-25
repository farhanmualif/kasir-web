import { Button, Spinner, Modal, TextInput, Label } from 'flowbite-react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { HiPlus, HiPencil, HiX, HiCheck } from 'react-icons/hi';
import { API_URL } from '@/assets/env';
import { getAuthToken } from '@/lib/getAuthToken';
import Mynavbar from '@/components/MyNavbar';
import { toast, ToastContainer } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

const CategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const fetchCategories = async () => {
    try {
      const token = getAuthToken();
      const baseUrl = API_URL();
      const response = await axios.get(`${baseUrl}/api/category`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setCategories(response.data.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch categories');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = getAuthToken();
      const baseUrl = API_URL();

      let response;
      if (isEditing && selectedCategory) {
        // Edit existing category
        response = await axios.put(
          `${baseUrl}/api/category/${selectedCategory.uuid}`,
          { name: firstName },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
      } else {
        // Add new category
        response = await axios.post(
          `${baseUrl}/api/category`,
          { name: firstName },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
      }

      if (response.data.status === true) {
        setFirstName('');
        setOpenModal(false);
        setIsEditing(false);
        setSelectedCategory(null);
        fetchCategories();
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
        toast.error(isEditing ? 'Gagal mengubah kategori' : 'Gagal menambah kategori');
      }, 50);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (uuid) => {
    setSelectedCategoryId(uuid);
    setOpenDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedCategoryId) return;
    
    setIsDeleting(true);
    try {
      const token = getAuthToken();
      const baseUrl = API_URL();
      const response = await axios.delete(`${baseUrl}/api/category/${selectedCategoryId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.status === true) {
        setTimeout(() => {
          toast.success(response.data.message);
        }, 50);
      } else {
        setTimeout(() => {
          toast.error(response.data.message);
        }, 50);
      }

      setOpenDeleteModal(false);
      fetchCategories(); // Refresh the list
    } catch (err) {
      console.error(err);
      setTimeout(() => {
        toast.error('Gagal menghapus kategori');
      }, 50);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditClick = (category) => {
    setSelectedCategory(category);
    setFirstName(category.name);
    setIsEditing(true);
    setOpenModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner size="xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        {error}
      </div>
    );
  }

  return (
    <>
      <Mynavbar isBuyingProduct={false} />
      <ToastContainer />
      <div className="container mx-auto p-4 mt-8">
        <div className="bg-white dark:bg-white shadow-md rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-dark-200">Daftar Kategori</h1>
            <Button
              gradientDuoTone="purpleToBlue"
              className="flex items-center gap-2 bg-blue-600"
              onClick={() => {
                setOpenModal(true);
                setSelectedCategoryId(null);
              }}
            >
              <HiPlus className="h-5 w-5" />
              Tambah Kategori
            </Button>
          </div>

          <div className="space-y-2">
            {categories.map((category) => (
              <div
                key={category.uuid}
                className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100">
                    <span className="text-sm font-medium">{category.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="text-sm text-gray-600">
                    {category.remaining_stock} products
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-3 py-2 rounded-full text-xs font-medium ${
                      category.remaining_stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {category.remaining_stock > 0 ? (
                        <>
                          <HiCheck className="-ml-0.5 mr-1.5 h-4 w-4" />
                          Active
                        </>
                      ) : (
                        <>
                          <HiX className="-ml-0.5 mr-1.5 h-4 w-4" />
                          Stok Habis
                        </>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button 
                      color="info" 
                      size="sm" 
                      className="flex items-center gap-1 px-3 py-2 dark:bg-blue-600"
                      onClick={() => handleEditClick(category)}
                    >
                      <HiPencil className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button 
                      color="failure" 
                      size="sm" 
                      className="flex items-center gap-1 px-3 py-2 bg-red-600"
                      onClick={() => handleDeleteClick(category.uuid)}
                    >
                      <HiX className="h-4 w-4" />
                      Hapus
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Category Modal */}
      <Modal
        show={openModal}
        onClose={() => {
          setOpenModal(false);
          setIsEditing(false);
          setSelectedCategory(null);
          setFirstName('');
        }}
        popup
        size="md"
        theme={{
          content: {
            base: "relative bg-white rounded-lg shadow w-full max-w-md p-4",
            inner: "relative rounded-lg bg-white"
          },
          overlay: {
            base: "fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm",
            show: {
              on: "flex bg-gray-900 bg-opacity-50",
              off: "hidden"
            }
          }
        }}
      >
        <Modal.Header>
          <h1 className='text-black'>{isEditing ? 'Edit Kategori' : 'Tambah Kategori'}</h1>
        </Modal.Header>
        <form onSubmit={handleSubmit}>
          <Modal.Body>
            <div className="space-y-6">
              <div className="w-full">
                <div className="mb-2 block dark:text-gray-600">
                  <Label htmlFor="firstName" value="Nama Kategori" className='dark:text-gray-600'/>
                </div>
                <TextInput
                  id="firstName"
                  placeholder="Masukkan nama kategori"
                  style={{backgroundColor: 'white', color: 'black', width: '100%'}}
                  className="w-full"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <div className="flex justify-end mt-4">
              <Button color="gray" onClick={() => setOpenModal(false)}>
                Batal
              </Button>
              <Button
                type="submit"
                gradientDuoTone="purpleToBlue"
                className="bg-blue-600 ml-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Spinner size="sm" className="mr-3" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  isEditing ? 'Simpan Perubahan' : 'Simpan'
                )}
              </Button>
            </div>
          </Modal.Footer>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        show={openDeleteModal}
        onClose={() => setOpenDeleteModal(false)}
        popup
        size="md"
        theme={{
          content: {
            base: "relative bg-white rounded-lg shadow w-full max-w-md p-4",
            inner: "relative rounded-lg bg-white"
          },
          overlay: {
            base: "fixed inset-0 z-40 bg-gray-900/50 backdrop-blur-sm",
            show: {
              on: "flex bg-gray-900 bg-opacity-50",
              off: "hidden"
            }
          }
        }}
      >
        <Modal.Header>
          <h1 className='text-black'>Konfirmasi Hapus</h1>
        </Modal.Header>
        <Modal.Body>
          <div className="space-y-6">
            <p className="text-black">
              Apakah Anda yakin ingin menghapus kategori ini?
            </p>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div className="flex justify-end gap-2">
            <Button color="gray" onClick={() => setOpenDeleteModal(false)}>
              Batal
            </Button>
            <Button
              color="failure"
              className="bg-red-600"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Spinner size="sm" className="mr-3" />
                  <span>Menghapus...</span>
                </>
              ) : (
                'Hapus'
              )}
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default CategoryPage;