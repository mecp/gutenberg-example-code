import { Model, Table, Column, DataType, ForeignKey } from 'sequelize-typescript';
import { AuthorModel } from './author';

@Table({ tableName: 'AuthorAlias' })
export class AuthorAliasModel extends Model<AuthorAliasModel> {
  @ForeignKey(() => AuthorModel)
  @Column({ allowNull: false, type: DataType.INTEGER })
  authorId: number;

  @Column({ allowNull: false, type: DataType.TEXT })
  alias: string;
}
