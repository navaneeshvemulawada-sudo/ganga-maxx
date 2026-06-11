import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './layouts/Layout';
import Login from './pages/Login';
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

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication page */}
          <Route path="/login" element={<Login />} />

          {/* Protected Navigation Layout */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
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
