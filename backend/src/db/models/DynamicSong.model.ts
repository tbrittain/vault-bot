import {
  Column,
  ForeignKey,
  Model,
  PrimaryKey,
  Table
} from 'sequelize-typescript'
import Artist from './Artist.model'
import { ITableOptions } from './interfaces/ITableOptions'
import Song from './Song.model'

const DynamicSongOptions: ITableOptions = {
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
