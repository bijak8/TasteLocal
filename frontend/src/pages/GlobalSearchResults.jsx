
import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import API from '../services/api';

function GlobalSearchResults() {
  const [searchParams] = useSearchParams();

  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || 'everything';

  const [results, setResults] = useState([]);
  const [aiAnswer, setAiAnswer] = useState('');
  const [searchMode, setSearchMode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setAiAnswer('');
      setSearchMode('');
      setError('');
      return;
    }

    let isActive = true;

    setLoading(true);
    setError('');
    setResults([]);
    setAiAnswer('');
    setSearchMode('');

    API.post('intelligent-search/', {
      query: query,
      category: category,
    })
      .then((response) => {
        if (!isActive) return;

        const data = response.data;

        setSearchMode(data.mode || 'database');
        setResults(data.results || []);
        setAiAnswer(data.answer || '');
      })
      .catch((err) => {
        if (!isActive) return;

        console.error('Search error:', err);

        setError(
          'Unable to complete your search. Please try again.'
        );
      })
      .finally(() => {
        if (isActive) {
          setLoading(false);
        }
      });

    return () => {
      isActive = false;
    };

  }, [query, category]);

  const groupedResults = results.reduce((groups, result) => {
    if (!groups[result.type]) {
      groups[result.type] = [];
    }

    groups[result.type].push(result);

    return groups;
  }, {});

  const categoryLabel = {
    everything: 'Everything',
    experiences: 'Food Experiences',
    tours: 'Food Tours',
  };

  return (
    <div className="global-search-page">

      <div className="global-search-container">

        <h1>
          {searchMode === 'ai'
            ? 'AI Search Results'
            : 'Search Results'}
        </h1>

        <p>
          Showing results for: <strong>{query}</strong>
        </p>

        <p>
          Category: <strong>
            {categoryLabel[category] || 'Everything'}
          </strong>
        </p>

        {/* Search Method */}
        {!loading && !error && searchMode && (
          <p>
            Search method: <strong>
              {searchMode === 'ai'
                ? 'AI-powered Search ✨'
                : 'Database Keyword Search'}
            </strong>
          </p>
        )}

        {/* Loading Indicator */}
        {loading && (
          <p>
            TasteLocal is searching for relevant food experiences and tours...
          </p>
        )}

        {/* Error Message */}
        {error && (
          <p>{error}</p>
        )}

        {/* AI Answer */}
        {!loading && !error && searchMode === 'ai' && aiAnswer && (
          <div className="ai-search-answer">

            <h2>Our Recommendations</h2>

            <p>{aiAnswer}</p>

          </div>
        )}

        {/* No Results */}
        {!loading && !error && results.length === 0 && query && (
          <p>
            {searchMode === 'ai'
              ? 'No suitable recommendations found. Try describing what kind of food experience or food tour you are looking for.'
              : 'No results found. Try another keyword.'}
          </p>
        )}

        {/* Search Results */}
        {!loading && !error && Object.entries(groupedResults).map(
          ([type, items]) => (

            <section
              key={type}
              className="global-search-section"
            >

              <h2>
                {type === 'Food Experience'
                  ? 'Food Experiences'
                  : type === 'Food Tour'
                    ? 'Food Tours'
                    : `${type}s`}
              </h2>

              {items.map((item, index) => (

                <div
                  key={`${type}-${item.id || index}`}
                  className="global-search-result"
                >

                  <div className="global-search-result-type">
                    {item.type}
                  </div>

                  <Link to={item.url}>
                    {item.title}
                  </Link>

                  <p>{item.description}</p>

                  {/* Additional AI Listing Information */}
                  {searchMode === 'ai' && (
                    <>

                      {(item.area || item.city) && (
                        <p>
                          {item.area && `${item.area}, `}
                          {item.city}
                        </p>
                      )}

                      {item.price && (
                        <p className="global-search-price">
                          {item.price}
                        </p>
                      )}

                    </>
                  )}

                  <Link
                    to={item.url}
                    className="global-search-view-link"
                  >
                    View Details →
                  </Link>

                </div>

              ))}

            </section>

          )
        )}

      </div>

    </div>
  );
}

export default GlobalSearchResults;
