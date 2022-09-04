import { Column, Model, PrimaryKey, Table } from 'sequelize-typescript'
import { ITableOptions } from './interfaces/ITableOptions'

const HistGenreOptions: ITableOptions = {
	tableName: 'historical_genres',
	timestamps: false,
	underscored: true
}

@Table(HistGenreOptions)
export default class HistGenre extends Model {
	@PrimaryKey
	@Column
	updatedAt!: Date

	@PrimaryKey
	@Column
	genre!: string

	@PrimaryKey
	@Column
	count!: number
}
