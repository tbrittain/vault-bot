import HistGenre from '../../database/models/HistGenre.model'
import { Op } from 'sequelize'
import { IGetHistGenresArgs } from './interfaces/HistGenres'
import { validateDateStrings } from "../../utils/DateValidator";

export default {
  Query: {
    async getHistGenres(_parent, args: IGetHistGenresArgs) {
      const { startDate, endDate } = validateDateStrings(args.startDate, args.endDate)

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
