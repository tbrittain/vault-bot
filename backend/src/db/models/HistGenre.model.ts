import {
  Table,
  Column,
  Model,
  PrimaryKey
} from "sequelize-typescript"
import { TableOptions } from './interfaces/TableOptions'

const HistGenreOptions: TableOptions = {
  tableName: 'historical_genres',
  timestamps: false,
  underscored: true
}

@Table(HistGenreOptions)
export default class HistGenre extends Model {
  @PrimaryKey
  @Column
  updatedAt!: Date

  @PrimaryKey
  @Column
  genre!: string

  @PrimaryKey
  @Column
  count!: number
}
