import React from 'react';
import authService from '../services/authService';
import ClientDashboard from './client/Dashboard';
import OperationsDashboard from './operations/Dashboard';
import SupervisorDashboard from './supervisor/Dashboard';
import DistributorDashboard from './distributor/Dashboard';
import AdminDashboard from './admin/Dashboard';

export default function Dashboard() {
  const user = authService.getCurrentUser() || { role: 'client' };
  const r = user.role ? user.role.toLowerCase() : 'client';

  switch (r) {
    case 'client':
      return <ClientDashboard />;
    case 'operations':
      return <OperationsDashboard />;
    case 'supervisor':
      return <SupervisorDashboard />;
    case 'distributor':
      return <DistributorDashboard />;
    case 'admin':
    default:
      return <AdminDashboard />;
  }
}
