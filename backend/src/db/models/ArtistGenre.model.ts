import {
  Column,
  ForeignKey,
  Model,
  PrimaryKey,
  Table
} from 'sequelize-typescript'
import Artist from './Artist.model'
import { ITableOptions } from './interfaces/ITableOptions'

const ArtistGenreOptions: ITableOptions = {
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
