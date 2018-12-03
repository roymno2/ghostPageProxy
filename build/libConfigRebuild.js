function rebuildCellDelay (delayCell) {
  if (delayCell === 0 || delayCell === undefined || delayCell === null) {
    return 0
  } else {
    return delayCell * 1000
  }
}

function rebuildCellRewrite (tmpConfWrite) {
  // repObject {"from": "", "to": "", "useRegex": true}
  if (tmpConfWrite === undefined || tmpConfWrite === null) {
    // 如果没写/undefined/null的话，
    return null
  } else {
    if (tmpConfWrite['from'] === '' && tmpConfWrite['to'] === '') {
      return null
    } else {
      // 如果useRe是false的话,则不做正则处理，不写默认为true
      if (tmpConfWrite['useRe'] === false) {
        return {'from': tmpConfWrite['from'], 'to': tmpConfWrite['to'], 'useRe': false }
      } else {
        return {'from': new RegExp(tmpConfWrite['from']), 'to': tmpConfWrite['to'], 'useRe': true }
      }
    }
  }
}

function rebuildCellPath (tmpConfPath, pathUseRe) {
  if (pathUseRe === true) {
    return new RegExp(tmpConfPath)
  } else {
    return tmpConfPath
  }
}

function rebuildCellPathUseRe (pathUseRe) {
  if (pathUseRe === false) {
    return false
  } else {
    return true
  }
}

function rebuildCellMethod (methodData) {
  if (methodData === null || methodData === undefined || methodData === '') {
    return null
  } else {
    return methodData
  }
}

function rebuildCellStatus (resStatus) {
  if (resStatus === undefined || resStatus === null || resStatus === 0 || resStatus === '0') {
    return null
  } else {
    return parseInt(resStatus)
  }
}

function rebuildCellContent (resContent) {
  // 输出 null 或者 文本
  if (resContent === undefined || resContent === null) {
    return null
  } else {
    // if (gettype.call(resContent) === '[Object String]') {
    //   return resContent
    // } else {
    //   return JSON.stringify(resContent)
    // }
    return String(resContent)
  }
}

function rebuildCellWebHeader (webHeader) {
  if (webHeader === undefined || webHeader === null) {
    return null
  } else {
    return webHeader
  }
}
module.exports = {
  rebuildCellDelay,
  rebuildCellRewrite,
  rebuildCellPath,
  rebuildCellPathUseRe,
  rebuildCellMethod,
  rebuildCellStatus,
  rebuildCellContent,
  rebuildCellWebHeader
}
