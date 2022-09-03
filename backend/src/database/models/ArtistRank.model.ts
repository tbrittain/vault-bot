import { ITableOptions } from './interfaces/ITableOptions'
import {
  BelongsTo,
  Column,
  ForeignKey,
  Model,
  PrimaryKey,
  Table
} from 'sequelize-typescript'
import Artist from './Artist.model'

const ArtistRankOptions: ITableOptions = {
  tableName: 'v_rankings_artists',
  timestamps: false,
  underscored: true
}

@Table(ArtistRankOptions)
export default class ArtistRank extends Model {
  @PrimaryKey
  @Column
  @ForeignKey(() => Artist)
  artistId!: string

  @BelongsTo(() => Artist)
  artist!: Artist

  @Column
  numUniqueSongs!: number

  @Column
  numUniqueSongsRank!: number

  @Column
  numNonUniqueSongs!: number

  @Column
  numNonUniqueSongsRank!: number
}
