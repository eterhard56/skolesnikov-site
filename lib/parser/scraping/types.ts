/** Raw business extracted from Yandex Maps search HTML */
export type YandexRawBusiness = {
  id: string;
  name: string;
  phone: string;
  website: string;
  rating: number;
  reviewsCount: number;
  address: string;
  yandexUrl: string;
  categories: string[];
};
