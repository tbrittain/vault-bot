import {
  Table,
  Column,
  Model,
  PrimaryKey,
  BelongsTo
} from 'sequelize-typescript'
import Artist from './Artist'
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
  @BelongsTo(() => Artist)
  artistId!: string

  @PrimaryKey
  @Column
  genre!: string
}
