import { Model, Table, Column, HasMany, PrimaryKey, DataType, BelongsToMany } from 'sequelize-typescript';
import { fn, col, ModelIndexesOptions } from 'sequelize';

import { BookModel } from './book';
import { AuthorAliasModel } from './author-alias';
import { BookAuthorModel } from './book-author';

@Table({
  tableName: 'Author',
  indexes: ([
    {
      name: 'Author_name_gin_index',
      fields: [fn('to_tsvector', 'english', col('name'))],
      using: 'gin'
    }
  ] as unknown) as ModelIndexesOptions[]
})
export class AuthorModel extends Model<AuthorModel> {
  @PrimaryKey
  @Column({ allowNull: false, type: DataType.INTEGER })
  id: number;

  @Column({ allowNull: false, type: DataType.TEXT })
  name: string;

  @Column({ allowNull: true, type: DataType.INTEGER })
  birthYear: number;

  @Column({ allowNull: true, type: DataType.INTEGER })
  deathYear: number;

  @Column({ allowNull: true, type: DataType.TEXT })
  webpage: string;

  @HasMany(() => AuthorAliasModel)
  public aliases: AuthorAliasModel[];

  @BelongsToMany(() => BookModel, () => BookAuthorModel)
  public books: BookModel[];
}
