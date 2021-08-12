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
  @BelongsTo(() => Song, 'id')
  songId!: string

  @Column
  @BelongsTo(() => Artist)
  artistId!: string

  @Column
  addedBy!: string

  @Column
  addedAt!: Date
}
