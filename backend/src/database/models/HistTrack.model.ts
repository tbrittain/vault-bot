import { Column, Model, PrimaryKey, Table } from 'sequelize-typescript'
import { ITableOptions } from './interfaces/ITableOptions'

const HistTrackOptions: ITableOptions = {
	tableName: 'historical_tracking',
	timestamps: false,
	underscored: true
}

@Table(HistTrackOptions)
export default class HistTrack extends Model {
	@PrimaryKey
	@Column
	id!: number

	@Column
	updatedAt!: Date

	@Column
	pdi!: number

	@Column
	popularity!: number

	@Column
	danceability!: number

	@Column
	energy!: number

	@Column
	valence!: number

	@Column
	songLength!: number

	@Column
	tempo!: number

	@Column
	novelty!: number
}
