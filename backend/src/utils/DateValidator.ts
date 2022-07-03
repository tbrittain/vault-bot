export function validateDateStrings(startDateString: string, endDateString: string | undefined) {
  let endDate: Date
  if (endDateString) {
    endDate = new Date(endDateString)
  } else {
    endDate = new Date()
  }

  // Input validation
  const startDate = new Date(startDateString)
  if (!(startDate instanceof Date && !isNaN(startDate.getTime()))) {
    throw new Error('Invalid startDate')
  }

  if (!(endDate instanceof Date && !isNaN(endDate.getTime()))) {
    throw new Error('Invalid endDate')
  }

  startDate.setHours(0, 0, 0, 0)
  endDate.setHours(0, 0, 0, 0)

  if (startDate > endDate) {
    throw new Error('endDate must be greater than startDate')
  }

  const dateToday = new Date()
  dateToday.setHours(0, 0, 0, 0)
  if (endDate > dateToday) {
    throw new Error(
      `endDate cannot be greater than the current date (${dateToday.toISOString()})`
    )
  }

  const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays > 7) {
    throw new Error(
      'Difference between dates must not be greater than one week'
    )
  }

  return {
    startDate,
    endDate
  }
}