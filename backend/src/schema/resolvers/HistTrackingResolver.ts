import HistTrack from '../../database/models/HistTrack.model'
import { Op } from 'sequelize'
import { IGetHistTrackingArgs } from './interfaces/HistTracking'
import { validateDateStrings } from "../../utils/DateValidator";

export default {
  Query: {
    async getHistTracking(_parent, args: IGetHistTrackingArgs) {
      const { startDate, endDate } = validateDateStrings(args.startDate, args.endDate)

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
