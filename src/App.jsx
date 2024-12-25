import { Route, Routes } from 'react-router-dom'
import './App.css'
import Dashboard from './pages/Dashboard'
import { PrivateRoute, PublicRoute } from './components/ProtectedRoute'
import TransactionPage from './pages/TransactionPage'
import BuyingProduct from './pages/BuyingProduct'
import CheckoutPage from './pages/CheckoutPage'
import TransactionSuccessPage from './pages/TransactionSuccess'
import AddProduct from './pages/AddProduct'
import ManagementPage from './pages/ManagementPage'
import CategoryPage from './pages/CategoryPage'
import ProductListPage from './pages/ProductListPage'
import Signin from './pages/Signin'
import Signup from './pages/Signup'
import SalesReportPage from './pages/SalesReportPage'
import ReportPage from './pages/ReportPage'
import PurchaseReportPage from './pages/PurchaseReportPage'


function App() {
  return (
    <Routes>
      {/* Public Routes (only accessible when not logged in) */}
      <Route element={<PublicRoute />}>
        <Route path='/' element={<Signin />}/>
        <Route path='/signin' element={<Signin />}/>
        <Route path='/signup' element={<Signup />}/>
      </Route>

      {/* Private Routes (only accessible when logged in) */}
      <Route element={<PrivateRoute />}>
        <Route path='/dashboard' element={<Dashboard />}/>
        <Route path='/transaction-page' element={<TransactionPage />}/>
        <Route path='/buying-product' element={<BuyingProduct />}/>
        <Route path='/checkout' element={<CheckoutPage />}/>
        <Route path='/transaction-success' element={<TransactionSuccessPage />}/>
        <Route path='/add-product' element={<AddProduct />}/>
        <Route path='/report-page' element={<ReportPage />}/>
        <Route path='/management-page' element={<ManagementPage />}/>
        <Route path='/category' element={<CategoryPage />}/>
        <Route path='/products' element={<ProductListPage />}/>
        <Route path='/report' element={<ReportPage />}/>
        <Route path='/sales-report' element={<SalesReportPage />}/>
        <Route path='/purchase-report' element={<PurchaseReportPage />}/>
        {/* Add other protected routes here */}
      </Route>
    </Routes>
  )
}

export default App