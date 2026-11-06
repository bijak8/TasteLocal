
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

// Booking pages
import Booking from './pages/Booking';
import MyBookings from './pages/MyBookings';
import ProviderBookings from './pages/ProviderBookings';

// Provider creation pages
import CreateFoodExperience from './pages/CreateFoodExperience';
import CreateFoodTour from './pages/CreateFoodTour';
import AddTourStop from './pages/AddTourStop';

// Itinerary page
import MyItineraries from './pages/MyItineraries';

// Favorites page
import MyFavourites from './pages/MyFavourites';

// Dashboards
import VendorDashboard from './pages/VendorDashboard';
import TourOperatorDashboard from './pages/TourOperatorDashboard';
import TouristDashboard from './pages/TouristDashboard';

// Edit / Delete Provider Pages
import EditFoodExperience from './pages/EditFoodExperience';
import EditFoodTour from './pages/EditFoodTour';
import EditTourStop from './pages/EditTourStop';

// Manage Tour Stops
import TourOperatorTourStops from './pages/TourOperatorTourStops';

// Tourist Page
import TouristProfile from './pages/TouristProfile';

// Review Page
import MyReviews from './pages/MyReviews';

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public pages with shared Navbar and Footer */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/food-experiences" element={<FoodExperiences />} />
          <Route path="/food-experiences/:id" element={<FoodExperienceDetails />} />
          <Route path="/food-tours" element={<FoodTours />} />
          <Route path="/food-tours/:id" element={<FoodTourDetails />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/my-itineraries" element={<MyItineraries />} />
          <Route path="/my-favourites" element={<MyFavourites />} />
          <Route path="/tourist/profile" element={<TouristProfile />} />
          <Route path="/my-reviews" element={<MyReviews />} />
        </Route>

        {/* Provider bookings and creation */}
        <Route path="/provider/bookings" element={<ProviderBookings />} />
        <Route path="/vendor/create-experience" element={<CreateFoodExperience />} />
        <Route path="/operator/create-tour" element={<CreateFoodTour />} />
        <Route path="/operator/add-tour-stop" element={<AddTourStop />} />

        {/* Dashboards */}
        <Route path="/vendor/dashboard" element={<VendorDashboard />} />
        <Route path="/operator/dashboard" element={<TourOperatorDashboard />} />
        <Route path="/tourist/dashboard" element={<TouristDashboard />} />

        {/* Edit provider content */}
        <Route path="/vendor/food-experiences/:id/edit" element={<EditFoodExperience />} />
        <Route path="/operator/food-tours/:id/edit" element={<EditFoodTour />} />
        <Route path="/operator/tour-stops/:id/edit" element={<EditTourStop />} />

        {/* Manage Tour Stops */}
        <Route path="/operator/tour-stops" element={<TourOperatorTourStops />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
