import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";
import AdminLogInPage from './pages/AdminLogInPage/AdminLogInPage';
import DashboardPage from './pages/DashboardPage/DashboardPage';
import Admin from './pages/Admin/Admin';
import LogbookPage from './pages/LogbookPage/LogbookPage';
import PatronsPage from './pages/PatronsPage/PatronsPage';
import ReportsPage from './pages/ReportsPage/ReportsPage';
import CatalogPage from './pages/CatalogPage/CatalogPage';
import AddItemPage from './pages/AddItemPage/AddItemPage';
import ViewItem from './components/ViewItem/ViewItem';
import ViewItemPage from './pages/ViewItemPage/ViewItemPage';
import AttendancePage from './pages/AttendancePage/AttendancePage';
import CirculationPage from './pages/CirculationPage/CirculationPage';
import CirculationSelectPatronPage from './pages/CirculationSelectPatronPage/CirculationSelectPatronPage';
import CirculationSelectItemPage from './pages/CirculationSelectItemPage/CirculationSelectItemPage';
import CirculationCheckoutPage from './pages/CirculationCheckoutPage/CirculationCheckoutPage';
import AuditPage from './pages/AuditPage/AuditPage';
import AccountsPage from './pages/AccountsPage/AccountsPage';
import LoginPage from './pages/LoginPage/LoginPage';
import EditPatronPage from './pages/EditPatronPage/EditPatronPage';

import Cookies from 'js-cookie';
import ProtectedRoute from './components/ProtectedRoute'
import ViewPatronPage from './pages/ViewPatron/ViewPatronPage';
const App = () => {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<LoginPage />} />
          
          <Route path='/dashboard' element={
            <ProtectedRoute allowedRoles={['admin','staff']}>
              <DashboardPage/>
            </ProtectedRoute>}/>
          <Route path='/logbook' element={
            <ProtectedRoute allowedRoles={['admin','staff']}>
              <LogbookPage/>
            </ProtectedRoute>
          } />
          <Route path='/circulation' element={
            <ProtectedRoute allowedRoles={['admin','staff']}>
              <CirculationPage/>
            </ProtectedRoute>
          }/>
          <Route path='/circulation/patron' element={
            <ProtectedRoute allowedRoles={['admin','staff']}>
              <CirculationSelectPatronPage/>
            </ProtectedRoute>
          }/>
          <Route path='/circulation/patron/item/:id' element={
            <ProtectedRoute allowedRoles={['admin','staff']}>
              <CirculationSelectItemPage/>
            </ProtectedRoute>
          } />
          <Route path='/circulation/patron/item/checkout' element={
            <ProtectedRoute allowedRoles={['admin','staff']}>
              <CirculationCheckoutPage/>
            </ProtectedRoute>
          } />
          <Route path='/circulation/patron/item/checkin' element={
            <ProtectedRoute allowedRoles={['admin','staff']}>
              <CirculationCheckoutPage/>
            </ProtectedRoute>
          } />
          <Route path='/patrons' element={
            <ProtectedRoute allowedRoles={['admin','staff']}>
              <PatronsPage/>
            </ProtectedRoute>
          } />
          <Route path='/catalog' element={
            <ProtectedRoute allowedRoles={['admin','staff']}>
              <CatalogPage/>
            </ProtectedRoute>
          } />
          <Route path='/add-item' element={
            <ProtectedRoute allowedRoles={['admin','staff']}>
              <AddItemPage/>
            </ProtectedRoute>
          }/>
          <Route path='/view-item/:id' element={
            <ProtectedRoute allowedRoles={['admin','staff']}>
              <AddItemPage/>
            </ProtectedRoute>
          } />
          <Route path='/attendance' element={
              <AttendancePage/>
          } />
          <Route path='/circulation/patron/item/checkin' element={
            <ProtectedRoute allowedRoles={['staff', 'admin']}>
              <CirculationCheckoutPage />
              </ProtectedRoute>
          }/>

          <Route path='/view-patron/:id' element={
            <ProtectedRoute allowedRoles={['staff', 'admin']}>
              <ViewPatronPage/>
            </ProtectedRoute>
          }
          />
          
          {/* Restricted routes for staff */}

          <Route path='/edit-patron/:id' element={
            <ProtectedRoute allowedRoles={['admin']}>
              <EditPatronPage/>
            </ProtectedRoute>
          }
          />

          <Route path='/add-patron' element={
            <ProtectedRoute allowedRoles={['admin']}>
              <EditPatronPage/>
            </ProtectedRoute>
          }
          />

          <Route path='/audit' element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AuditPage/>
            </ProtectedRoute>
          } />
          <Route path='/accounts' element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AccountsPage/>
            </ProtectedRoute>
          } />
          <Route path='/reports' element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ReportsPage/>
            </ProtectedRoute>
          } />
          
        
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;