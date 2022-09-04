import {
	BelongsTo,
	Column,
	Model,
	PrimaryKey,
	Table
} from 'sequelize-typescript'
import { ITableOptions } from './interfaces/ITableOptions'
import Song from './Song.model'

const ArchiveSongOptions: ITableOptions = {
	tableName: 'archive',
	timestamps: false,
	underscored: true
}

@Table(ArchiveSongOptions)
export default class ArchiveSong extends Model {
	@PrimaryKey
	@Column
	id!: number

	@BelongsTo(() => Song, 'songId')
	song!: Song

	@Column
	addedBy!: string

	@Column
	addedAt!: Date
}
