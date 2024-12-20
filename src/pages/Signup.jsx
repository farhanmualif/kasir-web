import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    password: "",
    password_confirmation: ""
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate password confirmation
    if (formData.password !== formData.password_confirmation) {
      toast.error("Password dan Konfirmasi Password tidak cocok");
      return;
    }

    try {
      const response = await axios.post("http://139.59.195.251/api/register", {
        name: formData.name,
        email: formData.email,
        address: formData.address,
        password: formData.password,
        password_confirmation: formData.password_confirmation
      });

      // Check if registration was successful
      if (response.data.status === true) {
        
        // Optional: Store user data or redirect
        // localStorage.setItem('userData', JSON.stringify(response.data.data));
        
        // Redirect to sign in page after a short delay
        navigate("/signin");
        setTimeout(() => {
          toast.success(response.data.message);
        }, 100);
      }
    } catch (error) {
      // Handle registration errors
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        toast.error(error.response.data.message || "Registrasi gagal");
      } else if (error.request) {
        // The request was made but no response was received
        toast.error("Tidak ada respon dari server");
      } else {
        // Something happened in setting up the request that triggered an Error
        toast.error("Terjadi kesalahan dalam proses registrasi");
      }
    }
  };

  return (
    <>
      <ToastContainer 
        position="top-right" 
        autoClose={3000} 
        hideProgressBar={false} 
        newestOnTop={false} 
        closeOnClick 
        rtl={false} 
        pauseOnFocusLoss 
        draggable 
        pauseOnHover 
      />
      <div>
        <section className="bg-gray-50 dark:bg-white">
          <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
            <div className="w-full bg-white rounded-lg shadow dark:shadow-lg md:mt-0 sm:max-w-md xl:p-0 dark:bg-white dark:border-gray-700">
              <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-grey-900">
                  Silahkan Daftar
                </h1>
                <form 
                  className="space-y-4 md:space-y-6" 
                  onSubmit={handleSubmit}
                >
                  <div>
                    <label 
                      htmlFor="name" 
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-grey-900"
                    >
                      Nama
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      style={{
                        color: "black",
                      }}
                      className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-white dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      placeholder="Farhan Mualif"
                      required
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label 
                      htmlFor="email" 
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-grey-900"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      style={{
                        color: "black",
                      }}
                      className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-white dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      placeholder="name@company.com"
                      required
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label 
                      htmlFor="address" 
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-grey-900"
                    >
                      Alamat
                    </label>
                    <textarea
                      name="address"
                      id="address"
                      style={{
                        color: "black",
                      }}
                      className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-white dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      placeholder="Masukkan alamat lengkap"
                      required
                      value={formData.address}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label 
                      htmlFor="password" 
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      id="password"
                      placeholder="••••••••"
                      style={{
                        color: "black",
                      }}
                      className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-white dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      required
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label 
                      htmlFor="password_confirmation" 
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-grey-900"
                    >
                      Konfirmasi Password
                    </label>
                    <input
                      type="password"
                      name="password_confirmation"
                      id="password_confirmation"
                      placeholder="••••••••"
                      style={{
                        color: "black",
                      }}
                      className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-white dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      required
                      value={formData.password_confirmation}
                      onChange={handleChange}
                    />
                  </div>
                 
                  <button 
                    type="submit" 
                    className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                  >
                    Daftar
                  </button>
                  <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                   Sudah ada akun?  <NavLink 
                      to="/signin" 
                      className="font-medium text-blue-600 hover:underline dark:text-blue-500 ml-1"
                    >
                      Masuk
                    </NavLink>
                  </p>
                </form>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}