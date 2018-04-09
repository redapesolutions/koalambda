'use strict';

const users = require('./users.json')
const lodash = require('lodash')
const {kompose, callbackBased, standardHttpResponse} = require('koalambda')

const _usersList = async (ctx, next) => {
  const [page, count] = [lodash.random(0,30), 20]
  const data = users.slice(page * count, (page + 1) * count)

  ctx.state.response = {
    data,
    input: ctx.event,
    pagination: {
      page,
      count
    }
  }
  await next()
}

module.exports._usersList = _usersList

module.exports.usersList = kompose(
  callbackBased,
  standardHttpResponse,
  _usersList
)
