class CompareAnyController {
  constructor () {
    this.storeDiffDict = {}
  }
  getDiff () {
    let tmpOut = ''
    let idCount = 0
    for (let i in this.storeDiffDict) {
      tmpOut = tmpOut + '#' + String(idCount) + ' -------<br>' + this.storeDiffDict[i]
    }
    return tmpOut
  }
  getDataType (value) {
    // 用于获取类型
    if (value === null) {
      return 'null'
    } else if (value === undefined) {
      // 如果是undefined或者null则不用判定类型
      return 'undefined'
    } else if (value === true || value === false) {
      // 如果是undefined或者null则不用判定类型
      return 'boolean'
    } else if (value instanceof Array) {
      // 因为数组的走instanceof Object还是返回true，所以要先instanceof Array
      return 'array'
    } else if (value instanceof Object) {
      return 'object'
    } else if (typeof (value) === 'string') {
      return 'string'
    } else if (typeof (value) === 'number') {
      return 'number'
    }
  }
  compareAnyData (x, y, lineId) {
    // 比较两个数值，且不考虑类型
    let typeX = this.getDataType(x)
    // 得到第一个值的类型
    if (typeX === this.getDataType(y)) {
      // 如果两边类型一样
      if (typeX === 'null' || typeX === 'undefined') {
        // 如果两边都是null或者undefined 说明值一定相等
        return true
      } else if (typeX === 'number' || typeX === 'string' || typeX === 'boolean') {
        // 如果是数字或者字符，直接比较就行了
        if (x === y) {
          return true
        } else {
          this.addStoreDiff(x, y, ' 值不相等', lineId)
          return false
        }
      } else if (typeX === 'array') {
        return this.compareArray(x, y, lineId)
      } else if (typeX === 'object') {
        return this.compareObject(x, y, lineId)
      } else {
        return true
      }
    } else {
      this.addStoreDiff(x, y, ' 类型不一样', lineId)
      // 如果类型不一样就回false
      return false
    }
  }

  addStoreDiff (x, y, reason, lineId) {
    if (lineId === undefined) {
      lineId = Math.random()
    }
    if (this.storeDiffDict.hasOwnProperty(lineId) === false) {
      this.storeDiffDict[lineId] = ' -> <pre>' + JSON.stringify(x, null, 4) + '\n\n 和 \n\n' + JSON.stringify(y, null, 4) + '\n\n</pre> ' + reason
    } else {
      this.storeDiffDict[lineId] = ' -> ' + reason + '<br>' + this.storeDiffDict[lineId]
    }
  }

  compareArray (x, y, lineId) {
    // 判断数组类型的是否相等
    if (lineId === undefined) {
      lineId = Math.random()
    }
    if (x.length !== y.length) {
      // 如果数组长度不等就回false
      this.addStoreDiff(x, y, '的数组长度不等', lineId)
      return false
    } else {
      // 如果长度一致就遍历，如果遍历到某项是false就回false，如果全部不是false
      for (let i = 0; i < x.length; i++) {
        if (this.compareAnyData(x[i], y[i], lineId) === false) {
          this.addStoreDiff(x, y, ' 第' + String(i + 1) + '个值不相等', lineId)
          return false
        }
      }
      return true
    }
  }

  compareObject (x, y, lineId) {
    if (lineId === undefined) {
      lineId = Math.random()
    }
    if (Object.keys(x).length !== Object.keys(y).length) {
      // 如果key数量不一致就肯定不对
      let tmpA = Object.keys(x)
      let tmpB = Object.keys(y)
      let tmpAOut = []
      let tmpBOut = []
      for (let i in tmpA) {
        if (tmpB.indexOf(tmpA[i]) === -1) {
          tmpAOut.push(tmpA[i])
        }
      }
      for (let i in tmpB) {
        if (tmpA.indexOf(tmpB[i]) === -1) {
          tmpBOut.push(tmpB[i])
        }
      }
      this.addStoreDiff(x, y, ' key不一致 左边多key: ' + tmpAOut.join(',') + ' 右边多key: ' + tmpBOut.join(','), lineId)
      return false
    } else {
      for (let i in x) {
        // 一个一个key遍历，如果y有这个key，比较key的值，如果y中没有对应的key也回false
        if (y.hasOwnProperty(i)) {
          if (this.compareAnyData(x[i], y[i], lineId) === false) {
            this.addStoreDiff(x, y, ' key：' + String(i) + '的值不相等', lineId)
            return false
          }
        } else {
          this.addStoreDiff(x, y, ' 有对方没有的key：' + String(i), lineId)
          return false
        }
      }
      return true
    }
  }
}

export default CompareAnyController
