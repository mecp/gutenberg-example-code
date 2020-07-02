import { Model, Table, Column, DataType, ForeignKey } from 'sequelize-typescript';
import { AuthorModel } from './author';
import { BookModel } from './book';

@Table({ tableName: 'BookAuthor' })
export class BookAuthorModel extends Model<BookAuthorModel> {
  @ForeignKey(() => AuthorModel)
  @Column({ allowNull: false, type: DataType.INTEGER })
  authorId: number;

  @ForeignKey(() => BookModel)
  @Column({ allowNull: false, type: DataType.INTEGER })
  bookId: number;
}
