import {
  Model,
  Table,
  Column,
  PrimaryKey,
  DataType,
  ForeignKey,
  BelongsTo,
  BelongsToMany,
  Index
} from 'sequelize-typescript';
import { fn, col, ModelIndexesOptions } from 'sequelize';

import { AuthorModel } from './author';
import { BookAuthorModel } from './book-author';
import { BookSubjectModel } from './book-subject';
import { PublisherModel } from './publisher';
import { SubjectModel } from './subject';

@Table({
  tableName: 'Book',
  indexes: ([
    {
      name: 'Book_title_gin_index',
      fields: [fn('to_tsvector', 'english', col('title'))],
      using: 'gin'
    }
  ] as unknown) as ModelIndexesOptions[]
})
export class BookModel extends Model<BookModel> {
  @PrimaryKey
  @Column({ allowNull: false, type: DataType.INTEGER })
  id: number;

  @Column({ allowNull: true, type: DataType.TEXT })
  title: string;

  @Index
  @Column({ allowNull: true, type: DataType.DATEONLY })
  publicationDate: Date;

  @Column({ allowNull: true, type: DataType.STRING })
  languageCode: string;

  @Column({ allowNull: true, type: DataType.TEXT })
  public licenseRights: string;

  @ForeignKey(() => PublisherModel)
  @Column({ allowNull: true })
  public publisherId: number;

  @BelongsTo(() => PublisherModel)
  public publisher: PublisherModel;

  @BelongsToMany(() => AuthorModel, () => BookAuthorModel)
  public authors: AuthorModel[];

  @BelongsToMany(() => SubjectModel, () => BookSubjectModel)
  public subjects: SubjectModel[];
}
