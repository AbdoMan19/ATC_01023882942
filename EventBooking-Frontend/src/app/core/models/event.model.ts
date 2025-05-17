export interface Event {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  location: string;
  description: string;
  price: number;
  imageUrl: string;
  category: EventCategory;
  organizer: {
    name: string;
    image: string;
    rating: number;
  };
  ticketsSold: number;
  duration: number;
  availableSeats: number;
  totalSeats: number;
  status: EventStatus;
  tags: string[];
  schedule: {
    time: string;
    activity: string;
    description: string;
  }[];
  gallery: string[];
  faq: {
    question: string;
    answer: string;
  }[];
  reviews: {
    user: {
      name: string;
      image: string;
    };
    rating: number;
    comment: string;
    date: Date;
  }[];
  timeRemaining?: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
}

export enum EventCategory {
  MUSIC = 'Music',
  TECHNOLOGY = 'Technology',
  FOOD = 'Food & Drink',
  ART = 'Art',
  SPORTS = 'Sports',
  COMEDY = 'Comedy',
  DANCE = 'Dance',
  THEATER = 'Theater',
  MOVIES = 'Movies',
  EXHIBITION = 'Exhibition'
}

export enum EventStatus {
  UPCOMING = 'upcoming',
  ONGOING = 'ongoing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
} 