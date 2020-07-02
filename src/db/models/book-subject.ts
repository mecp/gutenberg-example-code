import { Model, Table, Column, DataType, ForeignKey } from 'sequelize-typescript';
import { SubjectModel } from './subject';
import { BookModel } from './book';

@Table({ tableName: 'BookSubject' })
export class BookSubjectModel extends Model<BookSubjectModel> {
  @ForeignKey(() => BookModel)
  @Column({ allowNull: false, type: DataType.INTEGER })
  bookId: number;

  @ForeignKey(() => SubjectModel)
  @Column({ allowNull: false, type: DataType.INTEGER })
  subjectId: number;
}
