// import * as routeNames from './routeNames'

var redirectMap = {
  // 1: routeNames.LOGIN,
  // 2: routeNames.NOTFOUND
}

var redirect = function redirect (context, state, data) {
  if (redirectMap[state] && context.$route.name !== redirectMap[state]) {
    context.$router.push({ name: redirectMap[state] })
  }
  if (state === 1 && data.redirect) {
    window.location.replace(data.redirect)
  }
}

export default redirect
