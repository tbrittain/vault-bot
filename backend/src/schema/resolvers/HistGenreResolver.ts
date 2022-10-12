import HistGenre from '../../database/models/HistGenre.model'
import { Op } from 'sequelize'
import { IGetHistGenresArgs } from './interfaces/HistGenres'

export default {
	Query: {
		async getHistGenres(_parent, args: IGetHistGenresArgs) {
			let { startDate, endDate } = args
			if (!endDate) {
				endDate = new Date(startDate)
				endDate.setDate(endDate.getDate() + 7)
			}

			startDate.setHours(0, 0, 0, 0)
			endDate.setHours(0, 0, 0, 0)

			let result = await HistGenre.findAll({
				where: {
					updatedAt: {
						[Op.between]: [startDate.toISOString(), endDate.toISOString()]
					}
				}
			})
			result = JSON.parse(JSON.stringify(result))
			return result
		}
	}
}
