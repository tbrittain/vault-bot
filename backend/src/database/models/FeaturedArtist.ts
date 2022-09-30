import {
	Column,
	ForeignKey,
	Model,
	PrimaryKey,
	Table
} from 'sequelize-typescript'
import { ITableOptions } from './interfaces/ITableOptions'
import Artist from './Artist.model'

const FeaturedArtistOptions: ITableOptions = {
	tableName: 'featured_artists',
	timestamps: false,
	underscored: true
}

@Table(FeaturedArtistOptions)
export default class FeaturedArtist extends Model {
	@PrimaryKey
	@Column
	@ForeignKey(() => Artist)
	artistId!: string

	@Column
	featuredDate!: Date
}
