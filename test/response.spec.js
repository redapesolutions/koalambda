import {expect} from 'chai'
import {fixedResponseBody} from '../lib'
import noop from 'lodash/noop'

describe('Fixed response body', () => {
  it('should return a middleware', () => {
    expect(fixedResponseBody('lala')).to.be.a('Function')
  })
  it('should set a clone of the value onto the response', async () => {
    const toRespond = {a:42}
    const ctx = {state:{}}
    await fixedResponseBody(toRespond)(ctx, noop)
    expect(ctx.state).to.have.property('response').which.not.equal(toRespond)
    expect(ctx.state['response']).to.eql(toRespond)
  })
  it('should set the value onto the response if no clone is specified', async () => {
    const toRespond = {a:42}
    const ctx = {state:{}}
    await fixedResponseBody(toRespond, false)(ctx, noop)
    expect(ctx.state).to.have.property('response').which.equal(toRespond)
  })
})