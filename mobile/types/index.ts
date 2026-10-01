export type PlaceCategory = 'gastro' | 'natureza' | 'passeios' | 'noturna';

export type ContentStatus = 'pending' | 'published' | 'removed';

export type UserLevel = 'Explorer' | 'Local Expert' | 'Ambassador' | 'Legend';

export interface Place {
  id: string;
  name: string;
  category: PlaceCategory;
  lat: number;
  lng: number;
  address: string;
  city: string;
  priceRange: 1 | 2 | 3 | 4;
  bestTime?: string;
  description: string;
  ratingAvg: number;
  reviewsCount: number;
  savesCount: number;
  popularityScore: number;
  imageUrl?: string;
}

export interface Post {
  id: string;
  authorName: string;
  authorAvatar?: string;
  placeId: string;
  placeName: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  caption: string;
  vibes: string[];
  likesCount: number;
  commentsCount: number;
  createdAt: string;
}

export interface Community {
  id: string;
  name: string;
  city: string;
  membersCount: number;
  postsToday: number;
  coverUrl?: string;
  isMember: boolean;
}

export interface UserProfile {
  id: string;
  username: string;
  bio: string;
  level: UserLevel;
  xp: number;
  postsCount: number;
  placesCount: number;
  savesCount: number;
}

export type DiscoveryMode = 'map' | 'feed' | 'ranking';
