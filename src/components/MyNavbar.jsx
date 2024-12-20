import { Navbar, Button } from "flowbite-react";
import { FaStore, FaArrowLeft, FaPlusCircle, FaShoppingCart } from "react-icons/fa";
import { NavLink, useNavigate } from "react-router-dom";


export default function MyNavbar({isBuyingProduct}) {

    const navigate = useNavigate();

    const handleNavigateToAddProduct = () => {
        navigate("/add-product");
      };
    
    return(
        <Navbar className="shadow-md bg-white/80 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <NavLink to="/dashboard" className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
            <FaArrowLeft className="text-xl text-white" />
          </NavLink>
          <Navbar.Brand href="/" className="flex items-center space-x-3">
            <FaStore className="text-2xl text-blue-600" />
            <span className="self-center text-xl font-semibold whitespace-nowrap text-white">
              Sistem Kasir Online
            </span>
          </Navbar.Brand>
        </div>
        <div className="flex items-center space-x-3 md:order-2">
          {/* Tombol Tambah Produk */}
          {isBuyingProduct ? <Button
            onClick={handleNavigateToAddProduct}
            className="flex items-center gap-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md hover:shadow-lg font-medium border-none"
          >
            <FaPlusCircle className="text-lg mr-2" />
            <span>Tambah Produk Baru</span>
          </Button> : <p></p>}
          {/* Tombol Keranjang */}
         
        </div>
      </Navbar>
    )
    }