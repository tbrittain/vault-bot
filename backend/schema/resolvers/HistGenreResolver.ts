import HistGenre from '../../db/models/HistGenre.model'
import { Op } from 'sequelize'
import {
  GetHistGenresArgs
} from './interfaces/HistGenres'

export default {
  Query: {
    async getHistGenres (_parent, args: GetHistGenresArgs) {
      let endDate: Date
      if (args.endDate) {
        endDate = new Date(args.endDate)
      } else {
        endDate = new Date()
      }

      // Input validation
      const startDate = new Date(args.startDate)
      if (!(startDate instanceof Date && !isNaN(startDate.getTime()))) {
        throw new SyntaxError('Invalid startDate')
      }

      if (!(endDate instanceof Date && !isNaN(endDate.getTime()))) {
        throw new SyntaxError('Invalid endDate')
      }

      if (startDate > endDate) {
        throw new SyntaxError('endDate must be greater than startDate')
      }

      const dateToday = new Date()
      if (endDate > dateToday) {
        throw new SyntaxError(`endDate cannot be greater than the current date (${dateToday.toISOString()})`)
      }

      const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      console.log(diffDays)
      if (diffDays > 8) { // 8 instead of 7 due to the remainder of hours default endDate may have above 7 days
        throw new SyntaxError('Difference between dates must not be greater than one week')
      }

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
