import { BelongsToMany, Column, HasMany, Model, PrimaryKey, Table } from "sequelize-typescript";
import ArtistGenre from './ArtistGenre.model'
import { ITableOptions } from './interfaces/ITableOptions'
import ArtistSong from "./ArtistSong.model";
import Song from "./Song.model";

const ArtistOptions: ITableOptions = {
  tableName: 'artists',
  timestamps: false,
  underscored: true
}

@Table(ArtistOptions)
export default class Artist extends Model {
  @PrimaryKey
  @Column
  id!: string

  @Column
  name!: string

  @Column
  art!: string

  @Column
  featured!: Date

  @HasMany(() => ArtistGenre)
  genres!: ArtistGenre[]

  @BelongsToMany(() => Song, () => ArtistSong)
  songs!: Song[]
}
