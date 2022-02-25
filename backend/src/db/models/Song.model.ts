import {
  Column,
  ForeignKey,
  Model,
  PrimaryKey,
  Table
} from 'sequelize-typescript'
import Artist from './Artist.model'
import { ITableOptions } from './interfaces/ITableOptions'

const SongOptions: ITableOptions = {
  tableName: 'songs',
  timestamps: false,
  underscored: true
}

@Table(SongOptions)
export default class Song extends Model {
  @PrimaryKey
  @Column
  id!: string

  @Column
  @ForeignKey(() => Artist)
  artistId!: string

  @Column
  name!: string

  @Column
  length!: number

  @Column
  tempo!: number

  @Column
  danceability!: number

  @Column
  energy!: number

  @Column
  loudness!: number

  @Column
  acousticness!: number

  @Column
  instrumentalness!: number

  @Column
  liveness!: number

  @Column
  valence!: number

  @Column
  art!: string

  @Column
  previewUrl!: string

  @Column
  album!: string
}
