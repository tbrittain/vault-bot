import { ITableOptions } from './interfaces/ITableOptions'
import {
  BelongsTo,
  Column,
  ForeignKey,
  IsUUID,
  Model,
  PrimaryKey,
  Table
} from 'sequelize-typescript'
import { DataTypes } from 'sequelize'
import Genre from './Genre.model'

const GenreRankOptions: ITableOptions = {
  tableName: 'v_rankings_genres',
  timestamps: false,
  underscored: true
}

@Table(GenreRankOptions)
export default class GenreRank extends Model {
  @PrimaryKey
  @IsUUID(4)
  @Column({
    type: DataTypes.UUID
  })
  @ForeignKey(() => Genre)
  genreId!: string

  @BelongsTo(() => Genre)
  genre!: Genre

  @Column
  numArtists!: number

  @Column
  numArtistsRank!: number

  @Column
  numSongs!: number

  @Column
  numSongsRank!: number
}
