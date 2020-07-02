import { Model, Table, Column, PrimaryKey, DataType } from 'sequelize-typescript';
import { fn, col, ModelIndexesOptions } from 'sequelize';

@Table({
  tableName: 'Publisher',
  indexes: ([
    {
      name: 'Publisher_name_gin_index',
      fields: [fn('to_tsvector', 'english', col('name'))],
      using: 'gin'
    }
  ] as unknown) as ModelIndexesOptions[]
})
export class PublisherModel extends Model<PublisherModel> {
  @PrimaryKey
  @Column({ allowNull: false, type: DataType.INTEGER, autoIncrement: true })
  id: number;

  @Column({ allowNull: false, type: DataType.TEXT })
  name: string;
}
