import { Author } from './author';

export interface Book {
  id: number;
  title: string;
  publicationDate: Date;
  languageCode: string;

  publisher: string;
  authors: Author[];
  subjects: string[];
  licenseRights: string[];
}
