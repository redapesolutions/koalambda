import {expect} from 'chai'
import { 
  kompose,
  when,
  whenAttributeExists,
  whenAttributeEquals,
} from '../lib'
import noop from 'lodash/noop'
import constant from 'lodash/constant'
import { stub, spy } from 'sinon'

describe('when logical switches', () => {
  describe('when logical switch', () => {
    it('should return a function', () => {
      expect(when(noop, noop)).to.be.a('Function')
    })
    describe('logic', () => {
      it('should skip the middleware if check fails', async () => {
        const middleware = spy()
        const fn = when(constant(false), middleware)
        await fn({}, noop)
        expect(middleware.called).to.be.false
      })
      it('should call the middleware if check passes', async () => {
        const middleware = spy()
        const fn = when(constant(true), middleware)
        await fn({}, noop)
        expect(middleware.called).to.be.true
      })
      it('should skip the middleware if check fails asynchronously', async () => {
        const middleware = spy()
        const fn = when(constant(Promise.resolve(false)), middleware)
        await fn({}, noop)
        expect(middleware.called).to.be.false
      })
      it('should call the middleware if check passes', async () => {
        const middleware = spy()
        const fn = when(constant(Promise.resolve(true)), middleware)
        await fn({}, noop)
        expect(middleware.called).to.be.true
      })
    })
  })
  describe('whenAttributeExists switch', () => {
    it('should return a function', () => {
      expect(whenAttributeExists('dsada', noop)).to.be.a('Function')
    })
    describe('logic', () => {
      it('should skip the middleware if state doesnt exist', async () => {
        const middleware = spy()
        const fn = whenAttributeExists('abc', middleware)
        await fn({
          state: {}
        }, noop)
        expect(middleware.called).to.be.false
      })
      it('should call the middleware if state attribute exists', async () => {
        const middleware = spy()
        const fn = whenAttributeExists('abc', middleware)
        await fn({
          state: {
            abc: 'lalal'
          }
        }, noop)
        expect(middleware.called).to.be.true
      })
      it('should call the middleware if state attribute exists, deep', async () => {
        const middleware = spy()
        const fn = whenAttributeExists('abc.def.ghi', middleware)
        await fn({
          state: {
            abc: {
              def: {
                ghi: null
              }
            }
          }
        }, noop)
        expect(middleware.called).to.be.true
      })
    })
  })
  describe('whenAttributeEquals switch', () => {
    it('should return a function', () => {
      expect(whenAttributeEquals('fdsds', 'fdsfdsfsd', noop)).to.be.a('Function')
    })
    describe('logic', () => {
      it('should skip the middleware if state doesnt exist', async () => {
        const middleware = spy()
        const fn = whenAttributeEquals('abc', 42, middleware)
        await fn({}, noop)
        expect(middleware.called).to.be.false
      })
      it('should skip the middleware if state exists but doesnt match', async () => {
        const middleware = spy()
        const fn = whenAttributeEquals('abc', 42, middleware)
        await fn({
          state: {
            abc: 66
          }
        }, noop)
        expect(middleware.called).to.be.false
      })
      it('should call the middleware if state attribute exists and matches', async () => {
        const middleware = spy()
        const fn = whenAttributeEquals('abc', 42, middleware)
        await fn({
          state: {
            abc: 42
          }
        }, noop)
        expect(middleware.called).to.be.true
      })
    })
  })
})

