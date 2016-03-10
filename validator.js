/**
 * 判斷是否為Json格式字串
 *
 * @param {String} str
 * @returns {Boolean}
 */
exports.isJsonString = function (str) {
  try {
    JSON.parse(str)
  } catch (e) {
    return false
  }

  return true
}

/**
 * 判斷是否為整數
 *
 * @param {String|Number|Object} val
 * @returns {Boolean}
 */
exports.isInt = function (val) {
  return /^-?[0-9]+$/.test(val)
}
