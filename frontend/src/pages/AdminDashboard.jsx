
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  Label,
  LabelList,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import API from '../services/api';
import '../AdminDashboard.css';

const CHART_COLORS = {
  purple: '#54258A',
  royalPurple: '#7950B5',
  lavender: '#B9A0DC',
  gold: '#E5B94D',
  green: '#69A88A',
  red: '#D97979',
  grey: '#A7A0AD',
};

function AdminDashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);
    // Vendor Bulk Import States
  const [vendorImportFile, setVendorImportFile] = useState(null);
  const [vendorImporting, setVendorImporting] = useState(false);
  const [vendorImportResult, setVendorImportResult] = useState(null);
  const [vendorImportError, setVendorImportError] = useState('');

  const [tourOperatorImportFile, setTourOperatorImportFile] = useState(null);
  const [tourOperatorImporting, setTourOperatorImporting] = useState(false);
  const [tourOperatorImportResult, setTourOperatorImportResult] = useState(null);
  const [tourOperatorImportError, setTourOperatorImportError] = useState('');

  // Handle Vendor CSV Bulk Import
  const handleVendorBulkImport = async (event) => {
    event.preventDefault();

    if (!vendorImportFile) {
      setVendorImportError('Please select a CSV file.');
      return;
    }

    const formData = new FormData();
    formData.append('file', vendorImportFile);

    try {
      setVendorImporting(true);
      setVendorImportError('');
      setVendorImportResult(null);

      const response = await API.post(
        'admin/vendors/bulk-import/',
        formData
      );

      setVendorImportResult(response.data);
      setVendorImportFile(null);

      // Refresh dashboard statistics
      setRetryCount((previous) => previous + 1);

    } catch (err) {
      console.error('Vendor bulk import error:', err);

      setVendorImportError(
        err.response?.data?.error ||
        err.response?.data?.detail ||
        'Unable to import vendors. Please try again.'
      );

    } finally {
      setVendorImporting(false);
    }
  };

  // Download Vendor CSV Template
  const handleDownloadVendorTemplate = () => {
    const headers = [
      'business_name',
      'owner_name',
      'email',
      'phone',
      'description',
      'website',
      'social_media',
      'address',
      'city',
      'area',
      'latitude',
      'longitude',
      'logo',
    ];

    const sampleRow = [
      'Example Food Business',
      'John Tan',
      'john@example.com',
      '0123456789',
      'Traditional local food business',
      'https://example.com',
      'https://instagram.com/example',
      '123 Example Street',
      'Singapore',
      'Little India',
      '1.3067',
      '103.8490',
      '',
    ];

    const escapeCsvValue = (value) =>
      `"${String(value).replace(/"/g, '""')}"`;

    const csvContent = [
      headers.join(','),
      sampleRow.map(escapeCsvValue).join(','),
    ].join('\n');

    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'tastelocal_vendor_template.csv';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };


  // Handle Tour Operator CSV Bulk Import
  const handleTourOperatorBulkImport = async (event) => {
    event.preventDefault();

    if (!tourOperatorImportFile) {
      setTourOperatorImportError('Please select a CSV file.');
      return;
    }

    const formData = new FormData();
    formData.append('file', tourOperatorImportFile);

    try {
      setTourOperatorImporting(true);
      setTourOperatorImportError('');
      setTourOperatorImportResult(null);

      const response = await API.post(
        'admin/tour-operators/bulk-import/',
        formData
      );

      setTourOperatorImportResult(response.data);
      setTourOperatorImportFile(null);
      setRetryCount((previous) => previous + 1);
    } catch (err) {
      console.error('Tour Operator bulk import error:', err);
      setTourOperatorImportError(
        err.response?.data?.error ||
        err.response?.data?.detail ||
        'Unable to import tour operators. Please try again.'
      );
    } finally {
      setTourOperatorImporting(false);
    }
  };

  // Download Tour Operator CSV Template
  const handleDownloadTourOperatorTemplate = () => {
    const headers = [
      'business_name',
      'owner_name',
      'email',
      'phone',
      'description',
      'website',
      'social_media',
      'logo',
    ];

    const sampleRow = [
      'Example Tour Company',
      'Jane Tan',
      'jane@example.com',
      '0123456789',
      'Local food and cultural tour operator',
      'https://example.com',
      'https://instagram.com/example',
      '',
    ];

    const escapeCsvValue = (value) =>
      '"' + String(value).replace(/"/g, '""') + '"';

    const csvContent = [
      headers.join(','),
      sampleRow.map(escapeCsvValue).join(','),
    ].join('\n');

    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'tastelocal_tour_operator_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Fetch Admin Dashboard Statistics
  useEffect(() => {
    let cancelled = false;

    const fetchDashboard = async () => {
      const token = localStorage.getItem('accessToken');

      if (!token) {
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        setError('');

        const response = await API.get('admin/dashboard/');

        if (!cancelled) {
          setDashboard(response.data);
        }

      } catch (err) {
        console.error('Error fetching Admin Dashboard:', err);

        if (err.response?.status === 401) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          navigate('/login');
          return;
        }

        if (!cancelled) {
          setError(
            err.response?.data?.detail ||
            err.response?.data?.error ||
            'Unable to load the Admin Dashboard. Please try again.'
          );
        }

      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchDashboard();

    return () => {
      cancelled = true;
    };

  }, [navigate, retryCount]);

  // Main dashboard statistics
  const statistics = dashboard
    ? [
        {
          label: 'Total Users',
          value: dashboard.total_users,
          icon: '♙',
          description: 'Registered platform users',
        },
        {
          label: 'Active Users',
          value: dashboard.active_users,
          icon: '✓',
          description: 'Currently active accounts',
        },
        {
          label: 'Inactive Users',
          value: dashboard.inactive_users,
          icon: '⊘',
          description: 'Deactivated accounts',
        },
        {
          label: 'Total Bookings',
          value: dashboard.total_bookings,
          icon: '▤',
          description: 'All booking requests',
        },
      ]
    : [];

  // Booking Status Chart Data
  const bookingChartData = dashboard
    ? [
        {
          name: 'Pending',
          value: Number(dashboard.pending_bookings ?? 0),
          color: CHART_COLORS.gold,
        },
        {
          name: 'Confirmed',
          value: Number(dashboard.confirmed_bookings ?? 0),
          color: CHART_COLORS.green,
        },
        {
          name: 'Rejected',
          value: Number(dashboard.rejected_bookings ?? 0),
          color: CHART_COLORS.red,
        },
        {
          name: 'Cancelled',
          value: Number(dashboard.cancelled_bookings ?? 0),
          color: CHART_COLORS.grey,
        },
      ]
    : [];

  const totalBookings = bookingChartData.reduce(
  (total, booking) => total + booking.value,
  0
);

  // User Distribution Chart Data
  const userChartData = dashboard
    ? [
        {
          name: 'Tourists',
          value: Number(dashboard.total_tourists ?? 0),
          color: CHART_COLORS.purple,
        },
        {
          name: 'Vendors',
          value: Number(dashboard.total_vendors ?? 0),
          color: CHART_COLORS.royalPurple,
        },
        {
          name: 'Tour Operators',
          value: Number(dashboard.total_tour_operators ?? 0),
          color: CHART_COLORS.gold,
        },
      ]
    : [];

  const totalRegisteredUsers = userChartData.reduce(
  (total, user) => total + user.value,
  0
);

  // Provider Approval Chart Data
  const providerChartData = dashboard
    ? [
        {
          status: 'Pending',
          vendors: Number(dashboard.pending_vendors ?? 0),
          tourOperators: Number(dashboard.pending_tour_operators ?? 0),
        },
        {
          status: 'Approved',
          vendors: Number(dashboard.approved_vendors ?? 0),
          tourOperators: Number(dashboard.approved_tour_operators ?? 0),
        },
        {
          status: 'Rejected',
          vendors: Number(dashboard.rejected_vendors ?? 0),
          tourOperators: Number(dashboard.rejected_tour_operators ?? 0),
        },
      ]
    : [];

  // Listing Distribution Chart Data
  const listingChartData = dashboard
    ? [
        {
          type: 'Food Experiences',
          count: Number(dashboard.total_food_experiences ?? 0),
        },
        {
          type: 'Food Tours',
          count: Number(dashboard.total_food_tours ?? 0),
        },
      ]
    : [];

  // Reviews and Ratings Chart Data
  const reviewsChartData = dashboard
    ? (dashboard.reviews_by_rating ?? []).map((review) => ({
        rating: `${review.rating} Star${review.rating === 1 ? '' : 's'}`,
        count: Number(review.count ?? 0),
      }))
    : [];

  // Most Popular Booked Listings Chart Data
  const popularListingsChartData = dashboard
    ? (dashboard.popular_listings ?? []).map((listing) => ({
        ...listing,
        booking_count: Number(listing.booking_count ?? 0),
      }))
    : [];

  // Loading state
  if (loading) {
    return (
      <div className="admin-dashboard-loading">
        <div className="admin-dashboard-spinner"></div>
        <p>Loading Admin Dashboard...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="admin-dashboard-page">
        <div className="admin-dashboard-container">
          <div className="admin-dashboard-error">
            <h2>Unable to Load Dashboard</h2>
            <p>{error}</p>

            <button
              type="button"
              className="admin-dashboard-primary-btn"
              onClick={() =>
                setRetryCount((previous) => previous + 1)
              }
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return null;
  }

  return (
    <div className="admin-dashboard-page">
      <div className="admin-dashboard-container">

        {/* Dashboard Header */}
        <header className="admin-dashboard-header">
          <div>
            <span className="admin-dashboard-eyebrow">
              TASTELOCAL ADMINISTRATION
            </span>

            <h1>Admin Dashboard</h1>

            <p>
              Monitor platform activity, manage providers and
              oversee bookings.
            </p>

            <button
              type="button"
              className="admin-dashboard-primary-btn"
              onClick={() =>
                setRetryCount((previous) => previous + 1)
              }
              disabled={loading}
            >
              Refresh Dashboard
            </button>
          </div>

          <div className="admin-dashboard-welcome">
            <span>ADMIN PORTAL</span>
            <strong>Platform Overview</strong>
          </div>
        </header>

        {/* Admin Quick Navigation */}
        <section className="admin-dashboard-quick-nav">

          <div className="admin-dashboard-section-heading">
            <span className="admin-dashboard-section-label">
              QUICK ACCESS
            </span>

            <h2>Management Shortcuts</h2>

            <p>
              Quickly access platform management sections.
            </p>
          </div>

          <div className="admin-dashboard-quick-nav-grid">

            <button
              type="button"
              onClick={() => navigate('/admin/users')}
            >
              <span>♙</span>
              <strong>Manage Users</strong>
              <small>View and manage user accounts</small>
            </button>

            <button
              type="button"
              onClick={() => navigate('/admin/vendors')}
            >
              <span>▣</span>
              <strong>Manage Vendors</strong>
              <small>Review vendor registrations</small>
            </button>

            <button
              type="button"
              onClick={() =>
                navigate('/admin/tour-operators')
              }
            >
              <span>⌂</span>
              <strong>Manage Tour Operators</strong>
              <small>Review tour operator registrations</small>
            </button>

          </div>
        </section>

        {/* Main Statistics */}
        <section className="admin-dashboard-stats">

          {statistics.map((statistic) => (
            <div
              className="admin-dashboard-stat-card"
              key={statistic.label}
            >
              <div className="admin-dashboard-stat-icon">
                {statistic.icon}
              </div>

              <p>{statistic.label}</p>

              <h2>
                {Number(
                  statistic.value ?? 0
                ).toLocaleString()}
              </h2>

              <span>{statistic.description}</span>
            </div>
          ))}

        </section>

        {/* Dashboard Charts */}
        <section className="admin-dashboard-section">

          <div className="admin-dashboard-section-heading">
            <span className="admin-dashboard-section-label">
              PLATFORM ANALYTICS
            </span>

            <h2>Visual Overview</h2>

            <p>
              Explore platform users, bookings, providers and listings.
            </p>
          </div>

          <div className="admin-dashboard-charts-grid">
            {/* Booking Status Distribution */}
            <div className="admin-dashboard-chart-card">
              <div className="admin-dashboard-chart-heading">
                <h3>Booking Status Distribution</h3>
                <p>Breakdown of all booking requests.</p>
              </div>

              {totalBookings > 0 ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-around',
                    gap: '10px',
                    width: '100%',
                    minWidth: 0,
                  }}
                >
                  {/* Doughnut Chart */}
                  <PieChart width={300} height={280}>
                    <Pie
                      data={bookingChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={100}
                      paddingAngle={3}
                      label={({
                        cx,
                        cy,
                        midAngle,
                        innerRadius,
                        outerRadius,
                        percent,
                        payload,
                      }) => {
                        const RADIAN = Math.PI / 180;
                        const radius =
                          innerRadius +
                          (outerRadius - innerRadius) / 2;

                        const x =
                          cx + radius * Math.cos(-midAngle * RADIAN);

                        const y =
                          cy + radius * Math.sin(-midAngle * RADIAN);

                        return (
                          <text
                            x={x}
                            y={y}
                            fill={
                              payload.name === 'Pending' ||
                              payload.name === 'Cancelled'
                                ? CHART_COLORS.purple
                                : '#FFFFFF'
                            }
                            textAnchor="middle"
                            dominantBaseline="central"
                            fontSize={13}
                            fontWeight="bold"
                          >
                            {`${(percent * 100).toFixed(0)}%`}
                          </text>
                        );
                      }}
                    >
                      {bookingChartData.map((entry) => (
                        <Cell
                          key={entry.name}
                          fill={entry.color}
                        />
                      ))}

                      <Label
                        value={totalBookings}
                        position="center"
                        fill="#54258A"
                        fontSize={28}
                        fontWeight="bold"
                      />

                      <Label
                        value="Total Bookings"
                        position="center"
                        dy={24}
                        fill="#88818F"
                        fontSize={11}
                      />
                    </Pie>

                    <Tooltip />
                  </PieChart>

                  {/* Booking Status Breakdown */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      gap: '15px',
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    {bookingChartData.map((booking) => (
                      <div
                        key={booking.name}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                        }}
                      >
                        <div
                          style={{
                            width: '11px',
                            height: '11px',
                            minWidth: '11px',
                            borderRadius: '50%',
                            backgroundColor: booking.color,
                          }}
                        />

                        <div>
                          <p
                            style={{
                              margin: 0,
                              fontSize: '13px',
                              color: '#77717F',
                            }}
                          >
                            {booking.name}
                          </p>

                          <strong
                            style={{
                              display: 'block',
                              marginTop: '3px',
                              fontSize: '23px',
                              color: '#54258A',
                            }}
                          >
                            {booking.value.toLocaleString()}
                          </strong>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="admin-dashboard-chart-empty">
                  No booking data available yet.
                </div>
              )}
            </div>


            
            {/* User Distribution */}
            <div className="admin-dashboard-chart-card">
              <div className="admin-dashboard-chart-heading">
                <h3>User Distribution</h3>
                <p>Registered users by account type.</p>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-around',
                  gap: '10px',
                  width: '100%',
                  minWidth: 0,
                }}
              >
                {/* Doughnut Chart */}
                <PieChart width={300} height={280}>
                  <Pie
                    data={userChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={100}
                    paddingAngle={3}
                    label={({
                      cx,
                      cy,
                      midAngle,
                      innerRadius,
                      outerRadius,
                      percent,
                      payload,
                    }) => {
                      const RADIAN = Math.PI / 180;
                      const radius =
                        innerRadius +
                        (outerRadius - innerRadius) / 2;

                      const x =
                        cx + radius * Math.cos(-midAngle * RADIAN);

                      const y =
                        cy + radius * Math.sin(-midAngle * RADIAN);

                      return (
                        <text
                          x={x}
                          y={y}
                          fill={
                            payload.color === CHART_COLORS.gold
                              ? CHART_COLORS.purple
                              : '#FFFFFF'
                          }
                          textAnchor="middle"
                          dominantBaseline="central"
                          fontSize={13}
                          fontWeight="bold"
                        >
                          {`${(percent * 100).toFixed(0)}%`}
                        </text>
                      );
                    }}
                  >
                    {userChartData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={entry.color}
                      />
                    ))}

                    <Label
                      value={totalRegisteredUsers}
                      position="center"
                      fill="#54258A"
                      fontSize={28}
                      fontWeight="bold"
                    />

                    <Label
                      value="Total Users"
                      position="center"
                      dy={24}
                      fill="#88818F"
                      fontSize={11}
                    />
                  </Pie>

                  <Tooltip />
                </PieChart>

                {/* User Breakdown */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    gap: '22px',
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  {userChartData.map((user) => (
                    <div
                      key={user.name}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                      }}
                    >
                      <div
                        style={{
                          width: '11px',
                          height: '11px',
                          minWidth: '11px',
                          borderRadius: '50%',
                          backgroundColor: user.color,
                        }}
                      />

                      <div>
                        <p
                          style={{
                            margin: 0,
                            fontSize: '13px',
                            color: '#77717F',
                          }}
                        >
                          {user.name}
                        </p>

                        <strong
                          style={{
                            display: 'block',
                            marginTop: '4px',
                            fontSize: '23px',
                            color: '#54258A',
                          }}
                        >
                          {user.value.toLocaleString()}
                        </strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>


            {/* Provider Approval Status */}
            <div className="admin-dashboard-chart-card">
              <div className="admin-dashboard-chart-heading">
                <h3>Provider Approval Status</h3>
                <p>Compare vendor and tour operator applications.</p>
              </div>

              <BarChart
  width={600}
  height={300}
  data={providerChartData}
  barGap={8}
  barCategoryGap="30%"
  margin={{
    top: 30,
    right: 25,
    left: 0,
    bottom: 10,
  }}
>
  <CartesianGrid
    strokeDasharray="3 5"
    vertical={false}
    stroke="#EAE5F0"
  />

  <XAxis
    dataKey="status"
    axisLine={false}
    tickLine={false}
    tick={{ fill: '#77717F', fontSize: 13 }}
    tickMargin={12}
  />

  <YAxis
    allowDecimals={false}
    axisLine={false}
    tickLine={false}
    tick={{ fill: '#99919F', fontSize: 12 }}
    domain={[0, 'auto']}
  />

  <Tooltip
    cursor={{ fill: '#F7F2FC' }}
    contentStyle={{
      borderRadius: '10px',
      border: '1px solid #EAE5F0',
      backgroundColor: '#FFFFFF',
    }}
  />

  <Legend
    verticalAlign="bottom"
    iconType="circle"
    iconSize={10}
    wrapperStyle={{
      paddingTop: '18px',
      fontSize: '13px',
    }}
  />

  <Bar
    dataKey="vendors"
    name="Vendors"
    fill={CHART_COLORS.purple}
    radius={[7, 7, 0, 0]}
    barSize={45}
  >
    <LabelList
      dataKey="vendors"
      position="top"
      fill={CHART_COLORS.purple}
      fontSize={13}
      fontWeight={600}
    />
  </Bar>

  <Bar
    dataKey="tourOperators"
    name="Tour Operators"
    fill={CHART_COLORS.gold}
    radius={[7, 7, 0, 0]}
    barSize={45}
  >
    <LabelList
      dataKey="tourOperators"
      position="top"
      fill={CHART_COLORS.purple}
      fontSize={13}
      fontWeight={600}
    />
  </Bar>
</BarChart>
            </div>

            {/* Listing Distribution */}
            <div className="admin-dashboard-chart-card">
              <div className="admin-dashboard-chart-heading">
                <h3>Listing Distribution</h3>
                <p>Food experiences compared with food tours.</p>
              </div>

              <BarChart
  width={600}
  height={300}
  data={listingChartData}
  margin={{
    top: 30,
    right: 25,
    left: 0,
    bottom: 10,
  }}
>
  <CartesianGrid
    strokeDasharray="3 5"
    vertical={false}
    stroke="#EAE5F0"
  />

  <XAxis
    dataKey="type"
    axisLine={false}
    tickLine={false}
    tick={{ fill: '#77717F', fontSize: 12 }}
    tickMargin={12}
    interval={0}
  />

  <YAxis
    allowDecimals={false}
    axisLine={false}
    tickLine={false}
    tick={{ fill: '#99919F', fontSize: 12 }}
  />

  <Tooltip
    cursor={{ fill: '#F7F2FC' }}
    contentStyle={{
      borderRadius: '10px',
      border: '1px solid #EAE5F0',
      backgroundColor: '#FFFFFF',
    }}
  />

  <Bar
    dataKey="count"
    name="Total Listings"
    radius={[8, 8, 0, 0]}
    barSize={75}
  >
    {listingChartData.map((entry) => (
      <Cell
        key={entry.type}
        fill={
          entry.type === 'Food Experiences'
            ? CHART_COLORS.purple
            : CHART_COLORS.gold
        }
      />
    ))}

    <LabelList
      dataKey="count"
      position="top"
      fill={CHART_COLORS.purple}
      fontSize={14}
      fontWeight={600}
    />
  </Bar>
</BarChart>
            </div>

            {/* Reviews and Ratings */}
            <div className="admin-dashboard-chart-card">
              <div className="admin-dashboard-chart-heading">
                <h3>Reviews &amp; Ratings</h3>
                <p>Overview of tourist ratings across the platform.</p>
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: '28px',
                  alignItems: 'center',
                  marginBottom: '12px',
                  padding: '12px 16px',
                  backgroundColor: '#F7F2FC',
                  borderRadius: '10px',
                }}
              >
                <div>
                  <p style={{ margin: 0, fontSize: '12px', color: '#77717F' }}>
                    Average Rating
                  </p>
                  <strong style={{ display: 'block', marginTop: '4px', fontSize: '25px', color: CHART_COLORS.purple }}>
                    {Number(dashboard.average_rating ?? 0).toFixed(1)}
                    <span style={{ fontSize: '14px', color: '#88818F' }}> / 5</span>
                  </strong>
                </div>

                <div>
                  <p style={{ margin: 0, fontSize: '12px', color: '#77717F' }}>
                    Total Reviews
                  </p>
                  <strong style={{ display: 'block', marginTop: '4px', fontSize: '25px', color: CHART_COLORS.purple }}>
                    {Number(dashboard.total_reviews ?? 0).toLocaleString()}
                  </strong>
                </div>
              </div>

              {reviewsChartData.some((review) => review.count > 0) ? (
                <BarChart
                  width={600}
                  height={260}
                  data={reviewsChartData}
                  margin={{ top: 25, right: 25, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 5" vertical={false} stroke="#EAE5F0" />
                  <XAxis
                    dataKey="rating"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#77717F', fontSize: 12 }}
                    tickMargin={10}
                  />
                  <YAxis
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#99919F', fontSize: 12 }}
                  />
                  <Tooltip
                    cursor={{ fill: '#F7F2FC' }}
                    contentStyle={{
                      borderRadius: '10px',
                      border: '1px solid #EAE5F0',
                      backgroundColor: '#FFFFFF',
                    }}
                  />
                  <Bar
                    dataKey="count"
                    name="Reviews"
                    fill={CHART_COLORS.purple}
                    radius={[7, 7, 0, 0]}
                    barSize={48}
                  >
                    <LabelList
                      dataKey="count"
                      position="top"
                      fill={CHART_COLORS.purple}
                      fontSize={13}
                      fontWeight={600}
                    />
                  </Bar>
                </BarChart>
              ) : (
                <div className="admin-dashboard-chart-empty">
                  No review data available yet.
                </div>
              )}
            </div>

            {/* Most Popular Booked Listings */}
            <div className="admin-dashboard-chart-card">
              <div className="admin-dashboard-chart-heading">
                <h3>Most Popular Booked Listings</h3>
                <p>Top five food experiences and food tours by bookings.</p>
              </div>

              {popularListingsChartData.length > 0 ? (
                <>
                  <BarChart
                    width={600}
                    height={300}
                    data={popularListingsChartData}
                    layout="vertical"
                    margin={{ top: 10, right: 35, left: 10, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 5" horizontal={false} stroke="#EAE5F0" />
                    <XAxis
                      type="number"
                      allowDecimals={false}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#99919F', fontSize: 12 }}
                    />
                    <YAxis
                      type="category"
                      dataKey="title"
                      width={145}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#77717F', fontSize: 11 }}
                    />
                    <Tooltip
                      cursor={{ fill: '#F7F2FC' }}
                      formatter={(value) => [value, 'Bookings']}
                      contentStyle={{
                        borderRadius: '10px',
                        border: '1px solid #EAE5F0',
                        backgroundColor: '#FFFFFF',
                      }}
                    />
                    <Bar dataKey="booking_count" name="Bookings" radius={[0, 7, 7, 0]} barSize={27}>
                      {popularListingsChartData.map((listing) => (
                        <Cell
                          key={`${listing.type}-${listing.id}`}
                          fill={
                            listing.type === 'Food Experience'
                              ? CHART_COLORS.purple
                              : CHART_COLORS.gold
                          }
                        />
                      ))}
                      <LabelList
                        dataKey="booking_count"
                        position="right"
                        fill={CHART_COLORS.purple}
                        fontSize={12}
                        fontWeight={600}
                      />
                    </Bar>
                  </BarChart>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      gap: '24px',
                      flexWrap: 'wrap',
                      marginTop: '8px',
                      fontSize: '12px',
                      color: '#77717F',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: CHART_COLORS.purple }} />
                      Food Experiences
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: CHART_COLORS.gold }} />
                      Food Tours
                    </span>
                  </div>
                </>
              ) : (
                <div className="admin-dashboard-chart-empty">
                  No booking data available yet.
                </div>
              )}
            </div>

          </div>
        </section>

        {/* Provider Approval Overview */}
        <section className="admin-dashboard-section">

          <div className="admin-dashboard-section-heading">
            <span className="admin-dashboard-section-label">
              PROVIDER MANAGEMENT
            </span>

            <h2>Provider Approval Overview</h2>

            <p>
              Monitor vendor and tour operator registration statuses.
            </p>
          </div>

          <div className="admin-dashboard-overview-grid">

            {/* Vendor Status */}
            <div className="admin-dashboard-panel">

              <div className="admin-dashboard-panel-heading">
                <div className="admin-dashboard-panel-icon">
                  ▣
                </div>

                <div>
                  <h3
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate('/admin/vendors')}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        navigate('/admin/vendors');
                      }
                    }}
                    style={{ cursor: 'pointer' }}
                    title="Manage vendors"
                  >
                    Vendors
                  </h3>
                  <p>Vendor account applications</p>
                </div>
              </div>

              <div className="admin-dashboard-status-list">

                <div className="admin-dashboard-status-row">
                  <span className="admin-status-label">
                    <span className="admin-status-dot pending"></span>
                    Pending
                  </span>

                  <strong>
                    {dashboard.pending_vendors ?? 0}
                  </strong>
                </div>

                <div className="admin-dashboard-status-row">
                  <span className="admin-status-label">
                    <span className="admin-status-dot approved"></span>
                    Approved
                  </span>

                  <strong>
                    {dashboard.approved_vendors ?? 0}
                  </strong>
                </div>

                <div className="admin-dashboard-status-row">
                  <span className="admin-status-label">
                    <span className="admin-status-dot rejected"></span>
                    Rejected
                  </span>

                  <strong>
                    {dashboard.rejected_vendors ?? 0}
                  </strong>
                </div>

              </div>
            </div>

            {/* Tour Operator Status */}
            <div className="admin-dashboard-panel">

              <div className="admin-dashboard-panel-heading">
                <div className="admin-dashboard-panel-icon">
                  ⌂
                </div>

                <div>
                  <h3
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate('/admin/tour-operators')}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        navigate('/admin/tour-operators');
                      }
                    }}
                    style={{ cursor: 'pointer' }}
                    title="Manage tour operators"
                  >
                    Tour Operators
                  </h3>
                  <p>Tour operator applications</p>
                </div>
              </div>

              <div className="admin-dashboard-status-list">

                <div className="admin-dashboard-status-row">
                  <span className="admin-status-label">
                    <span className="admin-status-dot pending"></span>
                    Pending
                  </span>

                  <strong>
                    {dashboard.pending_tour_operators ?? 0}
                  </strong>
                </div>

                <div className="admin-dashboard-status-row">
                  <span className="admin-status-label">
                    <span className="admin-status-dot approved"></span>
                    Approved
                  </span>

                  <strong>
                    {dashboard.approved_tour_operators ?? 0}
                  </strong>
                </div>

                <div className="admin-dashboard-status-row">
                  <span className="admin-status-label">
                    <span className="admin-status-dot rejected"></span>
                    Rejected
                  </span>

                  <strong>
                    {dashboard.rejected_tour_operators ?? 0}
                  </strong>
                </div>

              </div>
            </div>

          </div>
        </section>

        {/* Booking Overview */}
        <section className="admin-dashboard-section">

          <div className="admin-dashboard-section-heading">
            <span className="admin-dashboard-section-label">
              BOOKING ACTIVITY
            </span>

            <h2>Booking Overview</h2>

            <p>
              Overview of booking requests across the platform.
            </p>
          </div>

          <div className="admin-dashboard-bookings">

            <div className="admin-dashboard-booking-item">
              <span className="admin-booking-dot pending"></span>

              <p>Pending Bookings</p>

              <strong>
                {dashboard.pending_bookings ?? 0}
              </strong>
            </div>

            <div className="admin-dashboard-booking-item">
              <span className="admin-booking-dot confirmed"></span>

              <p>Confirmed Bookings</p>

              <strong>
                {dashboard.confirmed_bookings ?? 0}
              </strong>
            </div>

            <div className="admin-dashboard-booking-item">
              <span className="admin-booking-dot rejected"></span>

              <p>Rejected Bookings</p>

              <strong>
                {dashboard.rejected_bookings ?? 0}
              </strong>
            </div>

            <div className="admin-dashboard-booking-item">
              <span className="admin-booking-dot cancelled"></span>

              <p>Cancelled Bookings</p>

              <strong>
                {dashboard.cancelled_bookings ?? 0}
              </strong>
            </div>

          </div>
        </section>


        {/* Bulk Import Providers */}
        <section className="admin-dashboard-section admin-provider-import-section">
          <div className="admin-dashboard-section-heading">
            <span className="admin-dashboard-section-label">DATA MANAGEMENT</span>
            <h2>Bulk Import Providers</h2>
            <p>Import multiple vendors and tour operators using CSV files.</p>
          </div>

          <div className="admin-provider-import-grid">
          <div className="admin-dashboard-chart-card admin-provider-import-card">

            <div className="admin-dashboard-chart-heading">
              <h3>Import Vendors</h3>
              <p>
                Upload a CSV file containing vendor business information.
              </p>
            </div>

            <button
              type="button"
              className="admin-dashboard-primary-btn"
              onClick={handleDownloadVendorTemplate}
              style={{ marginBottom: '20px' }}
            >
              Download Vendor CSV Template
            </button>

            <form onSubmit={handleVendorBulkImport}>

              <div style={{ marginBottom: '20px' }}>
                <label htmlFor="vendor-csv-file" className="admin-provider-import-label">
                  Select Vendor CSV File
                </label>

                <input
                  id="vendor-csv-file"
                  type="file"
                  accept=".csv,text/csv"
                  onChange={(event) => {
                    setVendorImportFile(
                      event.target.files[0] || null
                    );
                    setVendorImportError('');
                    setVendorImportResult(null);
                  }}
                />
              </div>

              {vendorImportFile && (
                <p style={{ color: '#77717F', fontSize: '13px' }}>
                  Selected file: {vendorImportFile.name}
                </p>
              )}


              <button
                type="submit"
                className="admin-dashboard-primary-btn"
                disabled={vendorImporting || !vendorImportFile}
              >
                {vendorImporting
                  ? 'Importing Vendors...'
                  : 'Upload and Import Vendors'}
              </button>

            </form>

            {vendorImportError && (
              <div
                style={{
                  marginTop: '20px',
                  padding: '14px',
                  backgroundColor: '#FCECEC',
                  color: '#B54747',
                  borderRadius: '8px',
                }}
              >
                {vendorImportError}
              </div>
            )}

            {vendorImportResult && (
              <div style={{ marginTop: '25px' }}>

                <h3>Import Results</h3>

                <div
                  style={{
                    display: 'flex',
                    gap: '20px',
                    flexWrap: 'wrap',
                    margin: '15px 0',
                  }}
                >
                  <div>
                    <strong style={{ color: '#398568' }}>
                      {vendorImportResult.imported_count}
                    </strong>
                    <p>Successfully Imported</p>
                  </div>

                  <div>
                    <strong style={{ color: '#C66B6B' }}>
                      {vendorImportResult.skipped_count}
                    </strong>
                    <p>Skipped Records</p>
                  </div>
                </div>

                {vendorImportResult.imported?.length > 0 && (
                  <>
                    <h3>Generated Account Credentials</h3>

                    <p style={{ fontSize: '13px', color: '#77717F' }}>
                      Save these credentials securely. Initial passwords
                      are displayed only in this import response.
                    </p>

                    <div style={{ overflowX: 'auto' }}>
                      <table style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        marginTop: '15px',
                      }}>
                        <thead>
                          <tr>
                            <th>Business Name</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Initial Password</th>
                          </tr>
                        </thead>

                        <tbody>
                          {vendorImportResult.imported.map((vendor) => (
                            <tr key={vendor.vendor_id}>
                              <td>{vendor.business_name}</td>
                              <td>{vendor.username}</td>
                              <td>{vendor.email}</td>
                              <td>
                                <code>{vendor.initial_password}</code>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}

                {vendorImportResult.skipped?.length > 0 && (
                  <>
                    <h3 style={{ marginTop: '25px' }}>
                      Skipped Records
                    </h3>

                    <div style={{ overflowX: 'auto' }}>
                      <table style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                      }}>
                        <thead>
                          <tr>
                            <th>CSV Row</th>
                            <th>Reason</th>
                          </tr>
                        </thead>

                        <tbody>
                          {vendorImportResult.skipped.map((item, index) => (
                            <tr key={`${item.row}-${index}`}>
                              <td>{item.row}</td>
                              <td>{item.reason}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}

              </div>
            )}

          </div>

          <div className="admin-dashboard-chart-card admin-provider-import-card">

            <div className="admin-dashboard-chart-heading">
              <h3>Import Tour Operators</h3>
              <p>
                Upload a CSV file containing tour operator business information.
              </p>
            </div>

            <button
              type="button"
              className="admin-dashboard-primary-btn"
              onClick={handleDownloadTourOperatorTemplate}
              style={{ marginBottom: '20px' }}
            >
              Download Tour Operator CSV Template
            </button>

            <form onSubmit={handleTourOperatorBulkImport}>

              <div style={{ marginBottom: '20px' }}>
                <label htmlFor="tour-operator-csv-file" className="admin-provider-import-label">
                  Select Tour Operator CSV File
                </label>

                <input
                  id="tour-operator-csv-file"
                  type="file"
                  accept=".csv,text/csv"
                  onChange={(event) => {
                    setTourOperatorImportFile(
                      event.target.files[0] || null
                    );
                    setTourOperatorImportError('');
                    setTourOperatorImportResult(null);
                  }}
                />
              </div>

              {tourOperatorImportFile && (
                <p style={{ color: '#77717F', fontSize: '13px' }}>
                  Selected file: {tourOperatorImportFile.name}
                </p>
              )}


              <button
                type="submit"
                className="admin-dashboard-primary-btn"
                disabled={tourOperatorImporting || !tourOperatorImportFile}
              >
                {tourOperatorImporting
                  ? 'Importing Tour Operators...'
                  : 'Upload and Import Tour Operators'}
              </button>

            </form>

            {tourOperatorImportError && (
              <div
                style={{
                  marginTop: '20px',
                  padding: '14px',
                  backgroundColor: '#FCECEC',
                  color: '#B54747',
                  borderRadius: '8px',
                }}
              >
                {tourOperatorImportError}
              </div>
            )}

            {tourOperatorImportResult && (
              <div style={{ marginTop: '25px' }}>

                <h3>Import Results</h3>

                <div
                  style={{
                    display: 'flex',
                    gap: '20px',
                    flexWrap: 'wrap',
                    margin: '15px 0',
                  }}
                >
                  <div>
                    <strong style={{ color: '#398568' }}>
                      {tourOperatorImportResult.imported_count}
                    </strong>
                    <p>Successfully Imported</p>
                  </div>

                  <div>
                    <strong style={{ color: '#C66B6B' }}>
                      {tourOperatorImportResult.skipped_count}
                    </strong>
                    <p>Skipped Records</p>
                  </div>
                </div>

                {tourOperatorImportResult.imported?.length > 0 && (
                  <>
                    <h3>Generated Account Credentials</h3>

                    <p style={{ fontSize: '13px', color: '#77717F' }}>
                      Save these credentials securely. Initial passwords
                      are displayed only in this import response.
                    </p>

                    <div style={{ overflowX: 'auto' }}>
                      <table style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        marginTop: '15px',
                      }}>
                        <thead>
                          <tr>
                            <th>Business Name</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Initial Password</th>
                          </tr>
                        </thead>

                        <tbody>
                          {tourOperatorImportResult.imported.map((operator) => (
                            <tr key={operator.tour_operator_id}>
                              <td>{operator.business_name}</td>
                              <td>{operator.username}</td>
                              <td>{operator.email}</td>
                              <td>
                                <code>{operator.initial_password}</code>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}

                {tourOperatorImportResult.skipped?.length > 0 && (
                  <>
                    <h3 style={{ marginTop: '25px' }}>
                      Skipped Records
                    </h3>

                    <div style={{ overflowX: 'auto' }}>
                      <table style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                      }}>
                        <thead>
                          <tr>
                            <th>CSV Row</th>
                            <th>Reason</th>
                          </tr>
                        </thead>

                        <tbody>
                          {tourOperatorImportResult.skipped.map((item, index) => (
                            <tr key={`${item.row}-${index}`}>
                              <td>{item.row}</td>
                              <td>{item.reason}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}

              </div>
            )}

          </div>
          </div>
        </section>

      </div>
    </div>
  );
}

export default AdminDashboard;
