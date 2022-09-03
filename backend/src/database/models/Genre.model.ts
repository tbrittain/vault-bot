import { ITableOptions } from './interfaces/ITableOptions'
import {
  Column,
  HasMany,
  HasOne,
  IsUUID,
  Model,
  PrimaryKey,
  Table,
  Unique
} from 'sequelize-typescript'
import { DataTypes } from 'sequelize'
import ArtistGenre from './ArtistGenre.model'
import GenreRank from './GenreRank.model'

const GenreOptions: ITableOptions = {
  tableName: 'genres',
  timestamps: false,
  underscored: true
}

@Table(GenreOptions)
export default class Genre extends Model {
  @PrimaryKey
  @IsUUID(4)
  @Column({
    type: DataTypes.UUID
  })
  id!: string

  @Unique
  @Column
  name: string

  @HasMany(() => ArtistGenre)
  artistGenres!: ArtistGenre[]

  @HasOne(() => GenreRank)
  genreRank: GenreRank
}
