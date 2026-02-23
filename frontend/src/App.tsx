import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import DashboardLayout from './components/layout/DashboardLayout';
import ExecutiveOverview from './pages/Dashboard/ExecutiveOverview';
import { FormBuilder } from './components/FormBuilder';
import AssetListPage from './pages/AssetListPage';
import AddAssetPage from './pages/AddAssetPage';
import { SpectralAnalysisPage } from './pages/SpectralAnalysisPage';
import { SpectralComparisonPage } from './pages/SpectralComparisonPage';
import { VibrationDiagnosticSuite } from './pages/VibrationDiagnosticSuite';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/user-management" element={<UserManagement />} />
          <Route
            path="/form-builder"
            element={
              <DashboardLayout>
                <FormBuilder />
              </DashboardLayout>
            }
          />
          <Route
            path="/form-builder/:formId"
            element={
              <DashboardLayout>
                <FormBuilder />
              </DashboardLayout>
            }
          />
          <Route
            path="/dashboard/executive-overview"
            element={
              <DashboardLayout>
                <ExecutiveOverview />
              </DashboardLayout>
            }
          />
          <Route
            path="/assets"
            element={
              <DashboardLayout>
                <AssetListPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/assets/add"
            element={
              <DashboardLayout>
                <AddAssetPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/spectral/:sensorId"
            element={
              <DashboardLayout>
                <SpectralAnalysisPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/spectral/:sensorId/compare"
            element={
              <DashboardLayout>
                <SpectralComparisonPage />
              </DashboardLayout>
            }
          />
          <Route
            path="/diagnostic"
            element={
              <DashboardLayout>
                <VibrationDiagnosticSuite />
              </DashboardLayout>
            }
          />
          <Route
            path="/diagnostic/:sensorId"
            element={
              <DashboardLayout>
                <VibrationDiagnosticSuite />
              </DashboardLayout>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;