// Event facts in one place — edit here, every language picks them up.
export const EVENT = {
  surface: 6000, // m²
  exhibitorsCapacity: 120,
  exhibitorsConfirmed: 40,
  visitors: 3000,
  sectors: 5,
  // Placeholder contact — replace with the organiser's real address.
  email: 'contact@ornsky27.com',
};

export const mailto = (subject) =>
  `mailto:${EVENT.email}?subject=${encodeURIComponent(subject)}`;
