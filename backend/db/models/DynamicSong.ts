import {
  Table,
  Column,
  Model,
  PrimaryKey,
  BelongsTo
} from "sequelize-typescript"
import Artist from "./Artist"
import { TableOptions } from './interfaces/TableOptions'
import Song from "./Song"

const DynamicSongOptions: TableOptions = {
  tableName: 'dynamic',
  timestamps: false,
  underscored: true
}

@Table(DynamicSongOptions)
export default class DynamicSong extends Model {
  @PrimaryKey
  @Column
  @BelongsTo(() => Song, 'id')
  songId!: string

  @Column
  @BelongsTo(() => Artist)
  artistId!: string

  @Column
  addedBy!: string

  @Column
  addedAt!: Date

  @Column
  popularity: number | undefined
}
