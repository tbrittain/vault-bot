import {
  Table,
  Column,
  Model,
  PrimaryKey
} from "sequelize-typescript"
import { TableOptions } from './interfaces/TableOptions'

const ArtistOptions: TableOptions = {
  tableName: 'songs',
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
  art: string | undefined

  @Column
  featured: Date | undefined
}


// Artist.hasMany(DynamicSong)
// Artist.hasMany(ArchiveSong)

