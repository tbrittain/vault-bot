const HistGenre = require('../../db/models/HistGenre')
const { Op } = require('sequelize')

module.exports = {
  Query: {
    async getHistGenres (parent, args, context, info) {
      let { startDate } = args
      let endDate
      if (args.endDate) {
        endDate = args.endDate
      } else {
        endDate = new Date()
      }

      // Input validation
      startDate = new Date(startDate)
      if (!(startDate instanceof Date && isFinite(startDate))) {
        throw new SyntaxError('Invalid startDate')
      }

      endDate = new Date(endDate)
      if (!(endDate instanceof Date && isFinite(endDate))) {
        throw new SyntaxError('Invalid endDate')
      }

      if (startDate > endDate) {
        throw new SyntaxError('endDate must be greater than startDate')
      }

      const dateToday = new Date()
      if (endDate > dateToday) {
        throw new SyntaxError(`endDate cannot be greater than the current date (${dateToday.toISOString()})`)
      }

      const diffTime = Math.abs(endDate - startDate)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
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
