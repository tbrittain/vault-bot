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

const ArchiveSongOptions: TableOptions = {
  tableName: 'archive',
  timestamps: false,
  underscored: true
}

@Table(ArchiveSongOptions)
export default class ArchiveSong extends Model {
  @PrimaryKey
  @Column
  id!: number

  @Column
  // @BelongsTo(() => Song, 'id')
  @ForeignKey(() => Song)
  songId!: string

  @Column
  // @BelongsTo(() => Artist, 'id')
  @ForeignKey(() => Artist)
  artistId!: string

  @Column
  addedBy!: string

  @Column
  addedAt!: Date
}
