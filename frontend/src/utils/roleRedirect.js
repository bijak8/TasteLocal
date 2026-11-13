
export const getDashboardPath = (role) => {
  const normalizedRole = role
    ?.toLowerCase()
    .trim()
    .replace(/[\s-]+/g, '_');

  switch (normalizedRole) {
    case 'tourist':
      return '/tourist/dashboard';

    case 'vendor':
      return '/vendor/dashboard';

    case 'tour_operator':
    case 'operator':
      return '/operator/dashboard';

    case 'admin':
    case 'administrator':
      return '/admin/dashboard';

    default:
      return '/';
  }
};
