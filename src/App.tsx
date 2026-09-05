import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { MainLayout } from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/LoginPage';

// Department wrappers with synchronized subtabs
import { ManagementOfficeDepartment } from './pages/departments/ManagementOfficeDepartment';
import { HRDepartment } from './pages/departments/HRDepartment';
import { OperationsDepartment } from './pages/departments/OperationsDepartment';
import { SalesDepartment } from './pages/departments/SalesDepartment';
import { DataAssetDepartment } from './pages/departments/DataAssetDepartment';
import { PurchasingLogisticsDepartment } from './pages/departments/PurchasingLogisticsDepartment';
import { ITDepartment } from './pages/departments/ITDepartment';
import { FinanceDepartment } from './pages/departments/FinanceDepartment';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route path="/" element={
            <MainLayout>
              <Dashboard />
            </MainLayout>
          } />

          <Route path="/management-office" element={
            <MainLayout>
              <ManagementOfficeDepartment />
            </MainLayout>
          } />

          <Route path="/hr" element={
            <MainLayout>
              <HRDepartment />
            </MainLayout>
          } />

          <Route path="/operations" element={
            <MainLayout>
              <OperationsDepartment />
            </MainLayout>
          } />

          <Route path="/sales" element={
            <MainLayout>
              <SalesDepartment />
            </MainLayout>
          } />

          <Route path="/data-asset" element={
            <MainLayout>
              <DataAssetDepartment />
            </MainLayout>
          } />

          <Route path="/purchasing-logistics" element={
            <MainLayout>
              <PurchasingLogisticsDepartment />
            </MainLayout>
          } />

          <Route path="/it" element={
            <MainLayout>
              <ITDepartment />
            </MainLayout>
          } />

          <Route path="/finance-dept" element={
            <MainLayout>
              <FinanceDepartment />
            </MainLayout>
          } />

          {/* Backward compatibility routes */}
          <Route path="/management" element={<MainLayout><ManagementOfficeDepartment /></MainLayout>} />
          <Route path="/hris" element={<MainLayout><HRDepartment /></MainLayout>} />
          <Route path="/benefits" element={<MainLayout><HRDepartment /></MainLayout>} />
          <Route path="/recruitment" element={<MainLayout><HRDepartment /></MainLayout>} />
          <Route path="/performance" element={<MainLayout><HRDepartment /></MainLayout>} />
          <Route path="/payroll" element={<MainLayout><HRDepartment /></MainLayout>} />
          <Route path="/pos" element={<MainLayout><OperationsDepartment /></MainLayout>} />
          <Route path="/manufacturing" element={<MainLayout><OperationsDepartment /></MainLayout>} />
          <Route path="/crm" element={<MainLayout><SalesDepartment /></MainLayout>} />
          <Route path="/inventory" element={<MainLayout><DataAssetDepartment /></MainLayout>} />
          <Route path="/purchasing" element={<MainLayout><PurchasingLogisticsDepartment /></MainLayout>} />
          <Route path="/logistics" element={<MainLayout><PurchasingLogisticsDepartment /></MainLayout>} />
          <Route path="/finance" element={<MainLayout><FinanceDepartment /></MainLayout>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
