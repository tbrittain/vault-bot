import HistTrack from '../../database/models/HistTrack.model'
import { Op } from 'sequelize'
import { IGetHistTrackingArgs } from './interfaces/HistTracking'

export default {
	Query: {
		async getHistTracking(_parent, args: IGetHistTrackingArgs) {
			let { startDate, endDate } = args
			if (!endDate) {
				endDate = new Date(startDate)
				endDate.setDate(endDate.getDate() + 7)
			}

			startDate.setHours(0, 0, 0, 0)
			endDate.setHours(0, 0, 0, 0)

			let result = await HistTrack.findAll({
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
