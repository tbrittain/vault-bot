import {
  Table,
  Column,
  Model,
  PrimaryKey,
  BelongsTo
} from "sequelize-typescript"
import Artist from "./Artist"
import { TableOptions } from './interfaces/TableOptions'

const SongOptions: TableOptions = {
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
  @BelongsTo(() => Artist)
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
  art: number | undefined

  @Column
  previewUrl: number | undefined

  @Column
  album!: string
}
