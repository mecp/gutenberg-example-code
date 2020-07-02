import { Model, Table, Column, DataType, PrimaryKey } from 'sequelize-typescript';
import { fn, col, ModelIndexesOptions } from 'sequelize';

@Table({
  tableName: 'Subject',
  indexes: ([
    {
      name: 'Subject_name_gin_index',
      fields: [fn('to_tsvector', 'english', col('name'))],
      using: 'gin'
    }
  ] as unknown) as ModelIndexesOptions[]
})
export class SubjectModel extends Model<SubjectModel> {
  @PrimaryKey
  @Column({ allowNull: false, type: DataType.INTEGER, autoIncrement: true })
  id: number;

  @Column({ allowNull: false, type: DataType.TEXT })
  name: string;
}
