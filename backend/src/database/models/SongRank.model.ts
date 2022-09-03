import { ITableOptions } from './interfaces/ITableOptions'
import {
  BelongsTo,
  Column,
  ForeignKey,
  Model,
  Table
} from 'sequelize-typescript'
import Song from './Song.model'

const SongRankOptions: ITableOptions = {
  tableName: 'v_rankings_songs',
  timestamps: false,
  underscored: true
}

@Table(SongRankOptions)
export default class SongRank extends Model {
  @Column
  @ForeignKey(() => Song)
  songId!: string

  @BelongsTo(() => Song)
  song!: Song

  @Column
  numTimesAdded!: number

  @Column
  rank!: number
}
