import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './layouts/Layout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import CustomerFormPage from './pages/CustomerFormPage';
import RequirementWizard from './pages/RequirementWizard';
import AIRecommendation from './pages/AIRecommendation';
import QuotationPage from './pages/QuotationPage';
import QuoteDetails from './pages/QuoteDetails';
import WarehouseInventory from './pages/WarehouseInventory';
import Visits from './pages/Visits';
import Compliance from './pages/Compliance';
import Messages from './pages/Messages';
import Reports from './pages/Reports';
import Admin from './pages/Admin';

// Client pages
import ClientQuotations from './pages/client/Quotations';
import ClientDelivery from './pages/client/Delivery';

// Operations pages
import OperationsApprovals from './pages/operations/Approvals';

// Supervisor pages
import SupervisorInventory from './pages/supervisor/Inventory';

// Distributor pages
import DistributorBulkOrders from './pages/distributor/BulkOrders';

// Admin pages
import AdminUsers from './pages/admin/Users';
import AdminProducts from './pages/admin/Products';
import AdminReports from './pages/admin/Reports';

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication pages */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Navigation Layout */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            
            {/* Client sub-pages */}
            <Route path="client/quotations" element={<ClientQuotations />} />
            <Route path="client/delivery" element={<ClientDelivery />} />
            
            {/* Operations sub-pages */}
            <Route path="operations/approvals" element={<OperationsApprovals />} />
            
            {/* Supervisor sub-pages */}
            <Route path="supervisor/inventory" element={<SupervisorInventory />} />
            
            {/* Distributor sub-pages */}
            <Route path="distributor/bulk-orders" element={<DistributorBulkOrders />} />
            
            {/* Admin sub-pages */}
            <Route path="admin/users" element={<AdminUsers />} />
            <Route path="admin/products" element={<AdminProducts />} />
            <Route path="admin/reports" element={<AdminReports />} />

            {/* Backwards compatibility / existing pages */}
            <Route path="customers" element={<CustomerFormPage />} />
            <Route path="requirements/new" element={<RequirementWizard />} />
            <Route path="recommend" element={<AIRecommendation />} />
            <Route path="quotations" element={<QuotationPage />} />
            <Route path="quotations/:id" element={<QuoteDetails />} />
            <Route path="inventory" element={<WarehouseInventory />} />
            <Route path="visits" element={<Visits />} />
            <Route path="compliance" element={<Compliance />} />
            <Route path="messages" element={<Messages />} />
            <Route path="reports" element={<Reports />} />
            <Route path="admin" element={<Admin />} />
            
            {/* Fallback routing */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
