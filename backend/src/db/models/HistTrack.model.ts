import { Table, Column, Model, PrimaryKey } from 'sequelize-typescript'
import { TableOptions } from './interfaces/TableOptions'

const HistTrackOptions: TableOptions = {
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
