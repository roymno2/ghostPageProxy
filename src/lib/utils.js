export const makeLooper = function (arr) {
  arr.loop_idx = 0
  arr.step_count = 0

  // return current item
  arr.current = function () {
    this.loop_idx = (this.loop_idx) % this.length
    return arr[ this.loop_idx ]
  }

  // 增加 loop_idx 然后返回新的当前元素
  arr.next = function () {
    this.loop_idx++
    this.step_count++
    return this.current()
  }

  // 减少 loop_idx 然后返回新的当前元素
  arr.prev = function () {
    this.loop_idx += this.length - 1
    this.step_count--
    return this.current()
  }

  arr.go = function (idx) {
    this.loop_idx = idx
  }

  arr.getRound = function () {
    return ~~(this.step_count / this.length)
  }
}

export const numberFloor = function (number, decimal) {
  var str = number.toString()
  if (str.indexOf('.') !== -1) {
    var arr = str.split('.')
    str = arr[0] + '.' + arr[1].slice(0, decimal)
  }
  return str - 0
}

export const getValueFixer = function (unitsArray, step, separate, floor) {
  var units = unitsArray || ['', 'K', 'M', 'G', 'T']
  step = step || 1000
  floor = floor || false
  var valueFixer = function (value, decimal) {
    decimal = decimal || 1
    for (var i = 1; i <= units.length; i++) {
      if (value / Math.pow(step, i) < 1 || i === units.length) {
        value = value / Math.pow(step, i - 1)
        if (value.toString().indexOf('.') > 0) {
          var tmpDecimal = value.toString().length - 1 - value.toString().indexOf('.')
          if (decimal < tmpDecimal) {
            value = floor ? numberFloor(value, decimal) : (value.toFixed(decimal) - 0).toString()
          }
        }
        if (separate) {
          value = {
            value: value,
            unit: units[i - 1]
          }
        } else {
          value += units[i - 1]
        }
        break
      }
    }
    return value
  }
  return valueFixer
}

export const getWheelDirect = function (e) {
  let direct = 0
  e = e || window.event
  if (e.wheelDelta) {
    direct = e.wheelDelta > 0 ? 1 : -1
  } else if (e.detail) {
    direct = e.detail < 0 ? 1 : -1
  }
  return direct
}
export const oneOf = function (value, validList) {
  for (let i = 0; i < validList.length; i++) {
    if (value === validList[i]) {
      return true
    }
  }
  return false
}
export const calcRange = function (min, max, splitNum, fixed) {
  if (!fixed || typeof fixed !== 'number') {
    fixed = 0
  }
  var outPut = []
  if (splitNum < 2 || typeof min !== 'number' || typeof max !== 'number' || typeof splitNum !== 'number') {
    console && console.info('地图传入参数有误')
  } else {
    if (min === max) {
      outPut = [min, max]
    } else {
      if (min > max) {
        var tmp = max
        max = min
        min = tmp
      }
      var Y = max - min
      var X = Math.log(Y + 1)
      if (numberFloor(Math.exp(X / splitNum), fixed) - 1 === 0) {
        splitNum = Math.floor(X / Math.log(1 / Math.pow(10, fixed) + 1))
      }
      outPut.push(min)
      for (var i = 1; i < splitNum; i++) {
        var _tmpX = X * i / splitNum
        outPut.push(numberFloor(Math.exp(_tmpX) - 1 + min, fixed))
      }
      outPut.push(max)
    }
  }
  return outPut
}

export const calcLinearRange = function (min, max, splitNum, fixed) {
  if (!fixed || typeof fixed !== 'number') {
    fixed = 0
  }
  var outPut = []
  if (splitNum < 2 || typeof min !== 'number' || typeof max !== 'number' || typeof splitNum !== 'number') {
    console && console.info('地图传入参数有误')
  } else {
    if (min === max) {
      outPut = [min, max]
    } else {
      if (min > max) {
        var tmp = max
        max = min
        min = tmp
      }
      var Y = max - min
      if (numberFloor(Y / splitNum, fixed) === 0) {
        // Y / 1 * Math.pow(10, fixed)
        splitNum = Math.floor(Y * Math.pow(10, fixed))
      }
      outPut.push(min)
      for (var i = 1; i < splitNum; i++) {
        var _tmpX = Y * i / splitNum
        outPut.push(numberFloor(_tmpX + min, fixed))
      }
      outPut.push(max)
    }
  }
  return outPut
}
