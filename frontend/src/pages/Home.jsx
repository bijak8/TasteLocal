
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="home-page">

      {/* Hero Section */}
      <header className="home-hero">
        <div className="container-custom home-hero-content">

          <span className="home-eyebrow">
            DISCOVER • TASTE • EXPERIENCE
          </span>

          <h1>
            Discover Local Food,
            <br />
            Culture & Experiences
          </h1>

          <p>
            Explore authentic food experiences and guided food tours
            created by local vendors and tour operators.
          </p>

          <div className="home-hero-buttons">
            <Link to="/food-experiences" className="taste-btn-primary">
              Explore Experiences
            </Link>

            <Link to="/food-tours" className="taste-btn-secondary">
              Discover Food Tours
            </Link>

            <Link to="/my-itineraries" className="taste-btn-outline">
              Plan My Food Trip
            </Link>
          </div>

        </div>
      </header>

      {/* Explore TasteLocal Section */}
      <section className="home-explore section-padding">
        <div className="container-custom">

          <div className="home-section-heading">
            <span className="home-eyebrow">EXPLORE TASTELOCAL</span>

            <h2>Discover More Than Just Food</h2>

            <p>
              Discover food experiences that connect you with local culture.
            </p>
          </div>

          <div className="home-feature-grid">

            <div className="home-feature-card">
              <div className="home-feature-icon">🍜</div>

              <h3>Food Experiences</h3>

              <p>
                Join cooking classes, food tastings and authentic
                local culinary activities.
              </p>

              <Link to="/food-experiences" className="home-card-link">
                Explore Experiences →
              </Link>
            </div>

            <div className="home-feature-card">
              <div className="home-feature-icon">🧭</div>

              <h3>Food Tours</h3>

              <p>
                Discover local food destinations through organised
                multi-stop food tours.
              </p>

              <Link to="/food-tours" className="home-card-link">
                Explore Food Tours →
              </Link>
            </div>

            <div className="home-feature-card">
              <div className="home-feature-icon">🏮</div>

              <h3>Local Culture</h3>

              <p>
                Learn about traditional dishes, ingredients and
                the stories behind local cuisine.
              </p>

              <Link to="/food-experiences" className="home-card-link">
                Discover Local Culture →
              </Link>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}

export default Home;