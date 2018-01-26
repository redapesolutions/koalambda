import {expect} from 'chai'
import { 
  kompose,
  contextBased,
  callbackBased,
} from '../lib'
import isFunction from 'lodash/isFunction'
import noop from 'lodash/noop'
import { stub, spy } from 'sinon'

describe('Context middleware', () => {
  it("should call the context's done method without error when nothing broke along the middleware line", () => {
    const done = spy()
    const context = {done}
    const event = {}
    return kompose(
      contextBased
    )(event, context)
    .then(_ => expect(done.calledWith(null)).to.be.true)
  })
  it("should include the event's response object in the done method call", () => {
    const done = spy()
    const context = {done}
    const event = {}
    const resp = {code: 'OK'}
    return kompose(
      contextBased,
      async (ctx, next) => {
        ctx.event.response = resp
        await next()
      }
    )(event, context)
    .then(_ => expect(done.calledWith(null, resp)).to.be.true)
  })
  it("should call the context's done method with error when something broke down the middleware line", () => {
    const done = spy()
    const context = {done}
    const event = {}
    const exception = {code: 'red'}
    return kompose(
      contextBased,
      async (ctx, next) => {
        throw exception
      }
    )(event, context)
    .then(_ => expect(done.calledWith(exception)).to.be.true)
  })
  it("should call the context's done method with error when something broke up the middleware line", () => {
    const done = spy()
    const context = {done}
    const event = {}
    const exception = {code: 'red'}
    return kompose(
      contextBased,
      async (ctx, next) => {
        await next()
        throw exception
      }
    )(event, context)
    .then(_ => expect(done.calledWith(exception)).to.be.true)
  })
})
describe('Callback middleware', () => {
  it("should call the callback without error when nothing broke along the middleware line", () => {
    const cb = spy()
    const context = {}
    const event = {}
    return kompose(
      callbackBased
    )(event, context, cb)
    .then(_ => expect(cb.calledWith(null)).to.be.true)
  })
  it("should include the event's response object in the callback call", () => {
    const cb = spy()
    const context = {}
    const event = {}
    const resp = {code: 'OK'}
    return kompose(
      callbackBased,
      async (ctx, next) => {
        ctx.event.response = resp
        await next()
      }
    )(event, context, cb)
    .then(_ => expect(cb.calledWith(null, resp)).to.be.true)
  })
  it("should call the callback with error when something broke down the middleware line", () => {
    const cb = spy()
    const context = {}
    const event = {}
    const exception = {code: 'red'}
    return kompose(
      callbackBased,
      async (ctx, next) => {
        throw exception
      }
    )(event, context, cb)
    .then(_ => expect(cb.calledWith(exception)).to.be.true)
  })
  it("should call the callback with error when something broke up the middleware line", () => {
    const cb = spy()
    const context = {}
    const event = {}
    const exception = {code: 'red'}
    return kompose(
      callbackBased,
      async (ctx, next) => {
        await next()
        throw exception
      }
    )(event, context, cb)
    .then(_ => expect(cb.calledWith(exception)).to.be.true)
  })
})
