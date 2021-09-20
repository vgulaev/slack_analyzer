exports.dateToSQLFormat = (date) => {
  let dateStr = [date.getFullYear(), date.getMonth() + 1, date.getDate()].join('-')
  let timeStr = [date.getHours(), date.getMinutes(), date.getSeconds()].join(':')
  return `${dateStr} ${timeStr}`
}