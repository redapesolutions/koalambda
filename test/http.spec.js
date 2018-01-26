import {
  kompose,
  jsonBody,
  HTTP_ERROR_CODES
} from '../lib'
import { expect } from 'chai'
import noop from 'lodash/noop'

describe('jsonBody middleware', () => {
  it('should parse the json body and put it onto event s body', async () => {
    const ctx = {
      event: {
        body: JSON.stringify({a:42})
      }
    }
    await jsonBody(ctx, noop)
    expect(ctx.event.body).to.be.an('Object').which.has.property('a')
  })
  it('should raise if body is not valid JSON', async () => {
    const ctx = {
      event: {
        body: 'not json'
      }
    }
    try {
      await jsonBody(ctx, noop)
      throw 'Should not happen'
    } catch(e) {
      expect(e).to.have.property('code').which.equal(HTTP_ERROR_CODES.JSON_PARSING_ERROR)
    }
  })
  it('should raise if body is missing', async () => {
    const ctx = {
      event: {}
    }
    try {
      await jsonBody(ctx, noop)
      throw 'Should not happen'
    } catch(e) {
      expect(e).to.have.property('code').which.equal(HTTP_ERROR_CODES.MISSING_BODY)
    }
  })
})