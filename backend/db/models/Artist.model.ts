import {
  Table,
  Column,
  Model,
  PrimaryKey
} from "sequelize-typescript"
import { TableOptions } from './interfaces/TableOptions'

const ArtistOptions: TableOptions = {
  tableName: 'artists',
  timestamps: false,
  underscored: true
}

@Table(ArtistOptions)
export default class Artist extends Model {
  @PrimaryKey
  @Column
  id!: string

  @Column
  name!: string

  @Column
  art!: string

  @Column
  featured!: Date
}

