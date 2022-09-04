import {
	BelongsToMany,
	Column,
	HasMany,
	HasOne,
	Model,
	PrimaryKey,
	Table
} from 'sequelize-typescript'
import ArtistGenre from './ArtistGenre.model'
import { ITableOptions } from './interfaces/ITableOptions'
import ArtistSong from './ArtistSong.model'
import Song from './Song.model'
import ArtistRank from './ArtistRank.model'

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
	artistGenres!: ArtistGenre[]

	@BelongsToMany(() => Song, () => ArtistSong)
	songs!: Song[]

	@HasOne(() => ArtistRank)
	artistRank: ArtistRank
}
