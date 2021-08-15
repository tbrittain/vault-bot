import {
  Table,
  Column,
  Model,
  PrimaryKey,
  HasMany
} from "sequelize-typescript"
import ArtistGenre from "./ArtistGenre.model"
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

  @HasMany(() => ArtistGenre)
  genres!: ArtistGenre[]
}

