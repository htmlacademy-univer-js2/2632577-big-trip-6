
const TYPES = [
  'taxi', 'bus', 'train', 'ship', 'drive', 'flight',
  'check-in', 'sightseeing', 'restaurant'
];

const CITIES = [
  'Amsterdam', 'Chamonix', 'Geneva', 'Paris', 'London',
  'Berlin', 'Rome', 'Madrid', 'Prague', 'Vienna'
];

const OFFERS_BY_TYPE = {
  taxi: ['Order Uber', 'Comfort class', 'Child seat'],
  flight: ['Add luggage', 'Business class', 'Priority boarding'],
  'check-in': ['Breakfast', 'Late check-out', 'Mini-bar'],
  sightseeing: ['Audio guide', 'Skip the line', 'Lunch'],
  default: ['Extra option', 'Insurance']
};

const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min, max) => min + Math.floor(Math.random() * (max - min + 1));

const getRandomDate = (daysShift = 0) => {
  const date = new Date();
  date.setDate(date.getDate() + daysShift + getRandomInt(0, 5));
  return date;
};

const generateDestinations = () => {
  return CITIES.map((city, index) => ({
    id: index + 1,
    name: city,
    description: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras aliquet varius magna, non porta ligula feugiat eget.`,
    pictures: [
      { src: `https://loremflickr.com/248/152?random=${index}`, description: city },
      { src: `https://loremflickr.com/248/152?random=${index + 10}`, description: `${city} view` }
    ]
  }));
};

const generateOffers = () => {
  const offers = [];
  TYPES.forEach((type) => {
    const offerTitles = OFFERS_BY_TYPE[type] || OFFERS_BY_TYPE.default;
    offerTitles.forEach((title, idx) => {
      offers.push({
        id: `${type}-${idx + 1}`,
        title,
        price: getRandomInt(10, 200),
        type
      });
    });
  });
  return offers;
};

const generatePoints = (destinations, offers) => {
  const points = [];
  for (let i = 1; i <= 5; i++) {
    const type = getRandomItem(TYPES);
    const destinationId = getRandomItem(destinations).id;
    const startDate = getRandomDate(i);
    const endDate = new Date(startDate);
    endDate.setHours(startDate.getHours() + getRandomInt(1, 5));
    const typeOffers = offers.filter(offer => offer.type === type);
    const selectedOffers = typeOffers.slice(0, getRandomInt(0, typeOffers.length));

    points.push({
      id: i,
      type,
      destinationId,
      offersIds: selectedOffers.map(o => o.id),
      startDateTime: startDate.toISOString(),
      endDateTime: endDate.toISOString(),
      basePrice: getRandomInt(50, 500),
      isFavorite: Math.random() > 0.7
    });
  }
  return points;
};

export { generateDestinations, generateOffers, generatePoints };
