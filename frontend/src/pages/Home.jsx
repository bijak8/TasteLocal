
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
          <Link className="navbar-brand fw-bold" to="/">
            TasteLocal
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarMenu"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarMenu">
            <ul className="navbar-nav ms-auto align-items-lg-center">
              <li className="nav-item">
                <Link className="nav-link" to="/">Home</Link>
              </li>

              <li className="nav-item">
                <Link className="nav-link" to="/food-experiences">
                  Food Experiences
                </Link>
              </li>

              <li className="nav-item">
                <Link className="nav-link" to="/food-tours">
                  Food Tours
                </Link>
              </li>

              <li className="nav-item">
                <Link className="nav-link" to="/my-itineraries">
                  My Itineraries
                </Link>
              </li>

              <li className="nav-item">
                <Link className="nav-link" to="/my-favourites">
                  My Favourites
                </Link>
              </li> 

              <li className="nav-item">
                <Link className="nav-link" to="/login">Login</Link>
              </li>

              <li className="nav-item ms-lg-2">
                <Link className="btn btn-warning" to="/register">
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <header className="bg-light py-5">
        <div className="container py-5 text-center">
          <h1 className="display-3 fw-bold">
            Discover Local Food, Culture & Experiences
          </h1>

          <p className="lead text-secondary mt-3">
            Explore authentic food experiences and guided food tours
            created by local vendors and tour operators.
          </p>

          <div className="mt-4">
            <Link
              to="/food-experiences"
              className="btn btn-warning btn-lg me-2"
            >
              Explore Experiences
            </Link>

            <Link
              to="/food-tours"
              className="btn btn-outline-dark btn-lg me-2"
            >
              Discover Food Tours
            </Link>

            <Link
              to="/my-itineraries"
              className="btn btn-dark btn-lg mt-2 mt-lg-0"
            >
              Plan My Food Trip
            </Link>
          </div>
        </div>
      </header>

      <section className="container py-5">
        <div className="text-center mb-5">
          <h2 className="fw-bold">Explore TasteLocal</h2>

          <p className="text-secondary">
            Discover food experiences that connect you with local culture.
          </p>
        </div>

        <div className="row g-4">
          <div className="col-md-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body p-4">
                <h4>Food Experiences</h4>
                <p className="text-secondary">
                  Join cooking classes, food tastings and authentic
                  local culinary activities.
                </p>
                <Link to="/food-experiences" className="btn btn-outline-dark">
                  Explore
                </Link>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body p-4">
                <h4>Food Tours</h4>
                <p className="text-secondary">
                  Discover local food destinations through organised
                  multi-stop food tours.
                </p>
                <Link to="/food-tours" className="btn btn-outline-dark">
                  Explore
                </Link>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body p-4">
                <h4>Local Culture</h4>
                <p className="text-secondary">
                  Learn about traditional dishes, ingredients and
                  the stories behind local cuisine.
                </p>
                <Link to="/food-experiences" className="btn btn-outline-dark">
                  Discover
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-dark text-white py-4">
        <div className="container text-center">
          <h5>TasteLocal</h5>
          <p className="mb-0 text-white-50">
            Discover authentic local food experiences.
          </p>
          <small className="text-white-50">
            © 2026 TasteLocal. All rights reserved.
          </small>
        </div>
      </footer>
    </div>
  );
}

export default Home;
