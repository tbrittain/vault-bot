import {
  Table,
  Column,
  Model,
  PrimaryKey,
  BelongsTo,
  ForeignKey
} from "sequelize-typescript"
import Artist from "./Artist.model"
import { TableOptions } from './interfaces/TableOptions'
import Song from "./Song.model"

const DynamicSongOptions: TableOptions = {
  tableName: 'dynamic',
  timestamps: false,
  underscored: true
}

@Table(DynamicSongOptions)
export default class DynamicSong extends Model {
  @PrimaryKey
  @Column
  // @BelongsTo(() => Song, 'id')
  @ForeignKey(() => Song)
  songId!: string

  @Column
  // @BelongsTo(() => Artist)
  @ForeignKey(() => Artist)
  artistId!: string

  @Column
  addedBy!: string

  @Column
  addedAt!: Date

  @Column
  popularity!: number
}
