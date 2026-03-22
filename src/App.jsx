import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Chatbot from '@/components/Chatbot';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Homepage from '@/pages/Homepage';
import BikeDetails from '@/pages/BikeDetails';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminDashboard from '@/pages/AdminDashboard';
import Register from '@/pages/Register';
import SellerDashboard from '@/pages/SellerDashboard';
import CreateListing from '@/pages/CreateListing';
import BuyerDashboard from '@/pages/BuyerDashboard';
import InspectorDashboard from '@/pages/InspectorDashboard';
import InspectionForm from '@/pages/InspectionForm';
import Checkout from '@/pages/Checkout';
import SellerRequest from '@/pages/SellerRequest';
import Chat from '@/pages/Chat';
import OrderDetail from '@/pages/OrderDetail';
import PaymentPage from '@/pages/PaymentPage';

function App() {
  return (
    <Router>
      <Chatbot />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/bike/:id" element={<BikeDetails />} />
        <Route
          path="/checkout/:id"
          element={
            <ProtectedRoute allowedRoles={['BUYER']}>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/order/:orderId"
          element={
            <ProtectedRoute allowedRoles={['BUYER']}>
              <OrderDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/:orderId"
          element={
            <ProtectedRoute allowedRoles={['BUYER']}>
              <OrderDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment/:orderId"
          element={
            <ProtectedRoute allowedRoles={['BUYER']}>
              <PaymentPage />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['BUYER']}>
              <BuyerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute allowedRoles={['BUYER', 'SELLER', 'ADMIN']}>
              <Chat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller-dashboard"
          element={
            <ProtectedRoute allowedRoles={['SELLER']}>
              <SellerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller/create-listing"
          element={
            <ProtectedRoute allowedRoles={['SELLER']}>
              <CreateListing />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inspector-dashboard"
          element={
            <ProtectedRoute allowedRoles={['INSPECTOR']}>
              <InspectorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inspector/form/:id"
          element={
            <ProtectedRoute allowedRoles={['INSPECTOR']}>
              <InspectionForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/seller-request" element={<SellerRequest />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
