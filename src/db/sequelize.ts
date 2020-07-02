import { Sequelize } from 'sequelize-typescript';
import { BookModel } from './models/book';
import { AuthorModel } from './models/author';
import { AuthorAliasModel } from './models/author-alias';
import { BookAuthorModel } from './models/book-author';
import { PublisherModel } from './models/publisher';
import { SubjectModel } from './models/subject';
import { BookSubjectModel } from './models/book-subject';
import dbConfig from './config/config.json';

const config = (dbConfig as { [env: string]: Object })[process.env.NODE_ENV ?? 'development'];

export const sequelize = new Sequelize({
  ...config,
  models: [AuthorModel, AuthorAliasModel, BookModel, BookAuthorModel, PublisherModel, SubjectModel, BookSubjectModel]
});
