import {
	Column,
	ForeignKey,
	IsUUID,
	Model,
	PrimaryKey,
	Table
} from 'sequelize-typescript'
import { ITableOptions } from './interfaces/ITableOptions'
import Genre from './Genre.model'
import { DataTypes } from 'sequelize'

const FeaturedGenreOptions: ITableOptions = {
	tableName: 'featured_genres',
	timestamps: false,
	underscored: true
}

@Table(FeaturedGenreOptions)
export default class FeaturedGenre extends Model {
	@PrimaryKey
	@Column
	@IsUUID(4)
	@Column({
		type: DataTypes.UUID
	})
	@ForeignKey(() => Genre)
	genreId!: string

	@Column
	featuredDate!: Date
}
