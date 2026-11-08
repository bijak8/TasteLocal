
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import MainLayout from './components/MainLayout';

// Public pages
import Home from './pages/Home';
import FoodExperiences from './pages/FoodExperiences';
import FoodExperienceDetails from './pages/FoodExperienceDetails';
import FoodTours from './pages/FoodTours';
import FoodTourDetails from './pages/FoodTourDetails';

// Authentication
import Register from './pages/Register';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ChangePassword from './pages/ChangePassword';

// Booking pages
import Booking from './pages/Booking';
import MyBookings from './pages/MyBookings';
import ProviderBookings from './pages/ProviderBookings';

// Provider creation pages
import CreateFoodExperience from './pages/CreateFoodExperience';
import CreateFoodTour from './pages/CreateFoodTour';
import AddTourStop from './pages/AddTourStop';

// Itinerary and favourites
import MyItineraries from './pages/MyItineraries';
import MyFavourites from './pages/MyFavourites';

// Dashboards
import VendorDashboard from './pages/VendorDashboard';
import TourOperatorDashboard from './pages/TourOperatorDashboard';
import TouristDashboard from './pages/TouristDashboard';

// Edit provider pages
import EditFoodExperience from './pages/EditFoodExperience';
import EditFoodTour from './pages/EditFoodTour';
import EditTourStop from './pages/EditTourStop';

// Manage tour stops
import TourOperatorTourStops from './pages/TourOperatorTourStops';

// Tourist pages
import TouristProfile from './pages/TouristProfile';
import MyReviews from './pages/MyReviews';

// Vendor and Tour Operator profile pages
import VendorProfile from './pages/VendorProfile';
import TourOperatorProfile from './pages/TourOperatorProfile';

// Reviews for Providers
import ProviderReviews from './pages/ProviderReviews';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Pages using shared Navbar and Footer */}
        <Route element={<MainLayout />}>

          {/* Public pages */}
          <Route path="/" element={<Home />} />
          <Route
            path="/food-experiences"
            element={<FoodExperiences />}
          />
          <Route
            path="/food-experiences/:id"
            element={<FoodExperienceDetails />}
          />
          <Route path="/food-tours" element={<FoodTours />} />
          <Route
            path="/food-tours/:id"
            element={<FoodTourDetails />}
          />

          {/* Authentication */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* Forgot and Reset Password */}
          <Route
            path="/forgot-password"
            element={<ForgotPassword />}
          />
          <Route
            path="/reset-password/:uidb64/:token"
            element={<ResetPassword />}
          />
          <Route
            path="/change-password"
            element={<ChangePassword />}
          />

          {/* Booking pages */}
          <Route path="/booking" element={<Booking />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route
            path="/provider/bookings"
            element={<ProviderBookings />}
          />

          {/* Provider Reviews */}
          <Route
            path="/provider/reviews"
            element={<ProviderReviews />}
          />

          {/* Itinerary and favourites */}
          <Route
            path="/my-itineraries"
            element={<MyItineraries />}
          />
          <Route
            path="/my-favourites"
            element={<MyFavourites />}
          />

          {/* Tourist pages */}
          <Route
            path="/tourist/dashboard"
            element={<TouristDashboard />}
          />
          <Route
            path="/tourist/profile"
            element={<TouristProfile />}
          />
          <Route path="/my-reviews" element={<MyReviews />} />

          {/* Vendor pages */}
          <Route
            path="/vendor/dashboard"
            element={<VendorDashboard />}
          />
          <Route
            path="/vendor/profile"
            element={<VendorProfile />}
          />
          <Route
            path="/vendor/create-experience"
            element={<CreateFoodExperience />}
          />
          <Route
            path="/vendor/food-experiences/:id/edit"
            element={<EditFoodExperience />}
          />

          {/* Tour Operator pages */}
          <Route
            path="/operator/dashboard"
            element={<TourOperatorDashboard />}
          />
          <Route
            path="/operator/profile"
            element={<TourOperatorProfile />}
          />
          <Route
            path="/operator/create-tour"
            element={<CreateFoodTour />}
          />
          <Route
            path="/operator/food-tours/:id/edit"
            element={<EditFoodTour />}
          />
          <Route
            path="/operator/add-tour-stop"
            element={<AddTourStop />}
          />
          <Route
            path="/operator/tour-stops"
            element={<TourOperatorTourStops />}
          />
          <Route
            path="/operator/tour-stops/:id/edit"
            element={<EditTourStop />}
          />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
