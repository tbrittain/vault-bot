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

const ArtistSongOptions: ITableOptions = {
	tableName: 'artists_songs',
	timestamps: false,
	underscored: true
}

@Table(ArtistSongOptions)
export default class ArtistSong extends Model {
	@PrimaryKey
	@Column
	@ForeignKey(() => Artist)
	artistId!: string

	@PrimaryKey
	@Column
	@ForeignKey(() => Song)
	songId!: string
}
