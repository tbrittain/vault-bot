import {
  Table,
  Column,
  Model,
  PrimaryKey,
  BelongsTo,
  ForeignKey
} from 'sequelize-typescript'
import Artist from './Artist.model'
import { TableOptions } from './interfaces/TableOptions'

const ArtistGenreOptions: TableOptions = {
  tableName: 'artists_genres',
  timestamps: false,
  underscored: true
}

@Table(ArtistGenreOptions)
export default class ArtistGenre extends Model {
  @PrimaryKey
  @Column
  @ForeignKey(() => Artist)
  artistId!: string

  @PrimaryKey
  @Column
  genre!: string
}
