import { sequelize } from './sequelize';

import { BookModel } from './models/book';
import { AuthorModel } from './models/author';
import { PublisherModel } from './models/publisher';
import { SubjectModel } from './models/subject';
import { BookSubjectModel } from './models/book-subject';
import { AuthorAliasModel } from './models/author-alias';
import { BookAuthorModel } from './models/book-author';

export const bookRepository = sequelize.getRepository(BookModel);
export const publisherRepository = sequelize.getRepository(PublisherModel);
export const subjectRepository = sequelize.getRepository(SubjectModel);
export const bookSubjectRepository = sequelize.getRepository(BookSubjectModel);
export const authorRepository = sequelize.getRepository(AuthorModel);
export const authorAliasRepository = sequelize.getRepository(AuthorAliasModel);
export const bookAuthorRepository = sequelize.getRepository(BookAuthorModel);
