
import { lazy, Suspense } from 'react';
import './App.css';

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

import MainLayout from './components/MainLayout';
import FoodDiscoveryChatbot from './components/FoodDiscoveryChatbot';

// Lazy load all page components
const Home = lazy(() => import('./pages/Home'));
const GlobalSearchResults = lazy(() => import('./pages/GlobalSearchResults'));
const Explore = lazy(() => import('./pages/Explore'));
const FoodExperiences = lazy(() => import('./pages/FoodExperiences'));
const FoodExperienceDetails = lazy(() => import('./pages/FoodExperienceDetails'));
const FoodTours = lazy(() => import('./pages/FoodTours'));
const FoodTourDetails = lazy(() => import('./pages/FoodTourDetails'));

const Register = lazy(() => import('./pages/Register'));
const Login = lazy(() => import('./pages/Login'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const ChangePassword = lazy(() => import('./pages/ChangePassword'));

const Booking = lazy(() => import('./pages/Booking'));
const MyBookings = lazy(() => import('./pages/MyBookings'));
const ProviderBookings = lazy(() => import('./pages/ProviderBookings'));

const CreateFoodExperience = lazy(() => import('./pages/CreateFoodExperience'));
const CreateFoodTour = lazy(() => import('./pages/CreateFoodTour'));
const AddTourStop = lazy(() => import('./pages/AddTourStop'));

const MyItineraries = lazy(() => import('./pages/MyItineraries'));
const MyFavourites = lazy(() => import('./pages/MyFavourites'));

const VendorDashboard = lazy(() => import('./pages/VendorDashboard'));
const TourOperatorDashboard = lazy(() => import('./pages/TourOperatorDashboard'));
const TouristDashboard = lazy(() => import('./pages/TouristDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminVendorManagement = lazy(() => import('./pages/AdminVendorManagement'));
const AdminTourOperatorManagement = lazy(() => import('./pages/AdminTourOperatorManagement'));
const AdminUserManagement = lazy(() => import('./pages/AdminUserManagement'));
const AdminCategoryManagement = lazy(() => import('./pages/AdminCategoryManagement'));

const EditFoodExperience = lazy(() => import('./pages/EditFoodExperience'));
const EditFoodTour = lazy(() => import('./pages/EditFoodTour'));
const EditTourStop = lazy(() => import('./pages/EditTourStop'));

const TourOperatorTourStops = lazy(() => import('./pages/TourOperatorTourStops'));

const TouristProfile = lazy(() => import('./pages/TouristProfile'));
const MyReviews = lazy(() => import('./pages/MyReviews'));

const VendorProfile = lazy(() => import('./pages/VendorProfile'));
const TourOperatorProfile = lazy(() => import('./pages/TourOperatorProfile'));

const ProviderReviews = lazy(() => import('./pages/ProviderReviews'));

import { getDashboardPath } from './utils/roleRedirect';

// Redirect logged-in users away from login page
function LoginRedirect() {
  const accessToken = localStorage.getItem('accessToken');
  const userRole = localStorage.getItem('userRole');

  if (accessToken && userRole) {
    return (
      <Navigate
        to={getDashboardPath(userRole)}
        replace
      />
    );
  }

  return <Login />;
}

function App() {
  return (
    <BrowserRouter>
      <Suspense
        fallback={
          <div className="page-loading">
            Loading TasteLocal...
          </div>
        }
      >
        <Routes>

          <Route element={<MainLayout />}>

            {/* Public pages */}
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<GlobalSearchResults />} />
            <Route path="/explore" element={<Explore />} />

            <Route path="/food-experiences" element={<FoodExperiences />} />
            <Route path="/food-experiences/:id" element={<FoodExperienceDetails />} />

            <Route path="/food-tours" element={<FoodTours />} />
            <Route path="/food-tours/:id" element={<FoodTourDetails />} />

            {/* Authentication */}
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<LoginRedirect />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:uidb64/:token" element={<ResetPassword />} />
            <Route path="/change-password" element={<ChangePassword />} />

            {/* Booking */}
            <Route path="/booking" element={<Booking />} />
            <Route path="/my-bookings" element={<MyBookings />} />
            <Route path="/provider/bookings" element={<ProviderBookings />} />
            <Route path="/provider/reviews" element={<ProviderReviews />} />

            {/* Itinerary and favourites */}
            <Route path="/my-itineraries" element={<MyItineraries />} />
            <Route path="/my-favourites" element={<MyFavourites />} />

            {/* Tourist */}
            <Route path="/tourist/dashboard" element={<TouristDashboard />} />
            <Route path="/tourist/profile" element={<TouristProfile />} />
            <Route path="/my-reviews" element={<MyReviews />} />

            {/* Vendor */}
            <Route path="/vendor/dashboard" element={<VendorDashboard />} />
            <Route path="/vendor/profile" element={<VendorProfile />} />
            <Route path="/vendor/create-experience" element={<CreateFoodExperience />} />
            <Route path="/vendor/food-experiences/:id/edit" element={<EditFoodExperience />} />

            {/* Tour Operator */}
            <Route path="/operator/dashboard" element={<TourOperatorDashboard />} />
            <Route path="/operator/profile" element={<TourOperatorProfile />} />
            <Route path="/operator/create-tour" element={<CreateFoodTour />} />
            <Route path="/operator/food-tours/:id/edit" element={<EditFoodTour />} />
            <Route path="/operator/add-tour-stop" element={<AddTourStop />} />
            <Route path="/operator/tour-stops" element={<TourOperatorTourStops />} />
            <Route path="/operator/tour-stops/:id/edit" element={<EditTourStop />} />

            {/* Admin */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/vendors" element={<AdminVendorManagement />} />
            <Route path="/admin/tour-operators" element={<AdminTourOperatorManagement />} />
            <Route path="/admin/users" element={<AdminUserManagement />} />
            <Route path="/admin/categories" element={<AdminCategoryManagement />} />

          </Route>
        </Routes>
      </Suspense>

      {/* Floating AI Food Discovery Chatbot */}
      <FoodDiscoveryChatbot />

    </BrowserRouter>
  );
}

export default App;
