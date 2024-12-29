import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { API_URL } from "@/assets/env";
import Loading from "@/components/Loading";

export default function ResetPassword() {
  const [formData, setFormData] = useState({
    password: "",
    password_confirmation: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const baseUrl = API_URL();
  const { email, code } = location.state || {};

  // Redirect if email or code is not provided
  if (!email || !code) {
    navigate('/forgot-password');
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.password_confirmation) {
      toast.error("Password tidak sama");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(`${baseUrl}/api/reset-password`, {
        email,
        token: code,
        password: formData.password,
        password_confirmation: formData.password_confirmation
      });

      if (response.data.status === 'success') {
        toast.success("Password berhasil diubah");
        // Redirect ke halaman login
        setTimeout(() => {
          navigate("/signin");
        }, 2000);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Terjadi kesalahan. Silakan coba lagi.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      <ToastContainer />
      <div>
        <section className="bg-gray-50 dark:white">
          <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
            <div className="w-full bg-white rounded-lg shadow dark:shadow-lg md:mt-0 sm:max-w-md xl:p-0 dark:bg-white dark:border-gray-700">
              <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-grey-900">
                  Reset Password
                </h1>
                <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
                  <div>
                    <label 
                      htmlFor="password" 
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-grey-900"
                    >
                      Password Baru
                    </label>
                    <input
                      type="password"
                      name="password"
                      id="password"
                      className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:white dark:border-gray-600 dark:placeholder-gray-400 dark:text-grey-900 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      placeholder="••••••••"
                      required
                      minLength={8}
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
                      className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:white dark:border-gray-600 dark:placeholder-gray-400 dark:text-grey-900 dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      placeholder="••••••••"
                      required
                      minLength={8}
                      value={formData.password_confirmation}
                      onChange={handleChange}
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                  >
                    Reset Password
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}