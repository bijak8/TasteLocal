
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
import { getDashboardPath } from './utils/roleRedirect';

// =====================================
// PUBLIC PAGES
// =====================================

const Home = lazy(() => import('./pages/Home'));
const GlobalSearchResults = lazy(() => import('./pages/GlobalSearchResults'));
const Explore = lazy(() => import('./pages/Explore'));
const FoodExperiences = lazy(() => import('./pages/FoodExperiences'));
const FoodExperienceDetails = lazy(() => import('./pages/FoodExperienceDetails'));
const FoodTours = lazy(() => import('./pages/FoodTours'));
const FoodTourDetails = lazy(() => import('./pages/FoodTourDetails'));

// =====================================
// AUTHENTICATION
// =====================================

const Register = lazy(() => import('./pages/Register'));
const Login = lazy(() => import('./pages/Login'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const ChangePassword = lazy(() => import('./pages/ChangePassword'));

// =====================================
// BOOKING PAGES
// =====================================

const Booking = lazy(() => import('./pages/Booking'));
const MyBookings = lazy(() => import('./pages/MyBookings'));
const ProviderBookings = lazy(() => import('./pages/ProviderBookings'));

// =====================================
// PROVIDER CREATION PAGES
// =====================================

const CreateFoodExperience = lazy(() => import('./pages/CreateFoodExperience'));
const CreateFoodTour = lazy(() => import('./pages/CreateFoodTour'));
const AddTourStop = lazy(() => import('./pages/AddTourStop'));

// =====================================
// ITINERARY AND FAVOURITES
// =====================================

const MyItineraries = lazy(() => import('./pages/MyItineraries'));
const MyFavourites = lazy(() => import('./pages/MyFavourites'));

// =====================================
// INFORMATION PAGES
// All components are in InformationPages.jsx
// =====================================

const About = lazy(() =>
  import('./pages/InformationPages').then((m) => ({
    default: m.About
  }))
);

const VendorGuide = lazy(() =>
  import('./pages/InformationPages').then((m) => ({
    default: m.VendorGuide
  }))
);

const TourOperatorGuide = lazy(() =>
  import('./pages/InformationPages').then((m) => ({
    default: m.TourOperatorGuide
  }))
);

const HelpCentre = lazy(() =>
  import('./pages/InformationPages').then((m) => ({
    default: m.HelpCentre
  }))
);

const FAQs = lazy(() =>
  import('./pages/InformationPages').then((m) => ({
    default: m.FAQs
  }))
);

const Terms = lazy(() =>
  import('./pages/InformationPages').then((m) => ({
    default: m.Terms
  }))
);

const Privacy = lazy(() =>
  import('./pages/InformationPages').then((m) => ({
    default: m.Privacy
  }))
);

const Contact = lazy(() =>
  import('./pages/InformationPages').then((m) => ({
    default: m.Contact
  }))
);

// =====================================
// DASHBOARDS
// =====================================

const VendorDashboard = lazy(() => import('./pages/VendorDashboard'));
const TourOperatorDashboard = lazy(() => import('./pages/TourOperatorDashboard'));
const TouristDashboard = lazy(() => import('./pages/TouristDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

const AdminVendorManagement = lazy(() => import('./pages/AdminVendorManagement'));
const AdminTourOperatorManagement = lazy(() => import('./pages/AdminTourOperatorManagement'));
const AdminUserManagement = lazy(() => import('./pages/AdminUserManagement'));
const AdminCategoryManagement = lazy(() => import('./pages/AdminCategoryManagement'));

// =====================================
// EDIT PROVIDER PAGES
// =====================================

const EditFoodExperience = lazy(() => import('./pages/EditFoodExperience'));
const EditFoodTour = lazy(() => import('./pages/EditFoodTour'));
const EditTourStop = lazy(() => import('./pages/EditTourStop'));

// =====================================
// TOUR STOP MANAGEMENT
// =====================================

const TourOperatorTourStops = lazy(() => import('./pages/TourOperatorTourStops'));

// =====================================
// TOURIST PAGES
// =====================================

const TouristProfile = lazy(() => import('./pages/TouristProfile'));
const MyReviews = lazy(() => import('./pages/MyReviews'));

// =====================================
// VENDOR AND TOUR OPERATOR PROFILES
// =====================================

const VendorProfile = lazy(() => import('./pages/VendorProfile'));
const TourOperatorProfile = lazy(() => import('./pages/TourOperatorProfile'));

// =====================================
// PROVIDER REVIEWS
// =====================================

const ProviderReviews = lazy(() => import('./pages/ProviderReviews'));

// =====================================
// LOGIN REDIRECT
// Redirect logged-in users away from login page
// =====================================

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

// =====================================
// MAIN APP
// =====================================

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

            {/* PUBLIC PAGES */}

            <Route path="/" element={<Home />} />
            <Route path="/search" element={<GlobalSearchResults />} />
            <Route path="/explore" element={<Explore />} />

            <Route path="/food-experiences" element={<FoodExperiences />} />
            <Route path="/food-experiences/:id" element={<FoodExperienceDetails />} />

            <Route path="/food-tours" element={<FoodTours />} />
            <Route path="/food-tours/:id" element={<FoodTourDetails />} />

            {/* COMPANY AND INFORMATION PAGES */}

            <Route path="/about" element={<About />} />
            <Route path="/for-vendors" element={<VendorGuide />} />
            <Route path="/for-tour-operators" element={<TourOperatorGuide />} />
            <Route path="/help" element={<HelpCentre />} />
            <Route path="/faqs" element={<FAQs />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/contact" element={<Contact />} />

            {/* AUTHENTICATION */}

            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<LoginRedirect />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            <Route
              path="/reset-password/:uidb64/:token"
              element={<ResetPassword />}
            />

            <Route path="/change-password" element={<ChangePassword />} />

            {/* BOOKING */}

            <Route path="/booking" element={<Booking />} />
            <Route path="/my-bookings" element={<MyBookings />} />
            <Route path="/provider/bookings" element={<ProviderBookings />} />
            <Route path="/provider/reviews" element={<ProviderReviews />} />

            {/* ITINERARY AND FAVOURITES */}

            <Route path="/my-itineraries" element={<MyItineraries />} />
            <Route path="/my-favourites" element={<MyFavourites />} />

            {/* TOURIST */}

            <Route path="/tourist/dashboard" element={<TouristDashboard />} />
            <Route path="/tourist/profile" element={<TouristProfile />} />
            <Route path="/my-reviews" element={<MyReviews />} />

            {/* VENDOR */}

            <Route path="/vendor/dashboard" element={<VendorDashboard />} />
            <Route path="/vendor/profile" element={<VendorProfile />} />

            <Route
              path="/vendor/create-experience"
              element={<CreateFoodExperience />}
            />

            <Route
              path="/vendor/food-experiences/:id/edit"
              element={<EditFoodExperience />}
            />

            {/* TOUR OPERATOR */}

            <Route path="/operator/dashboard" element={<TourOperatorDashboard />} />
            <Route path="/operator/profile" element={<TourOperatorProfile />} />

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

            {/* ADMIN */}

            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/vendors" element={<AdminVendorManagement />} />

            <Route
              path="/admin/tour-operators"
              element={<AdminTourOperatorManagement />}
            />

            <Route path="/admin/users" element={<AdminUserManagement />} />
            <Route path="/admin/categories" element={<AdminCategoryManagement />} />

          </Route>

        </Routes>
      </Suspense>

      {/* FLOATING AI FOOD DISCOVERY CHATBOT */}
      <FoodDiscoveryChatbot />

    </BrowserRouter>
  );
}

export default App;
