const {_usersList} = require('./handler')
const lodash = require('lodash')
jest.mock('lodash')

describe('apigateway based koalambda examples', () => {
  describe('usersList', () => {
    let ctx
    beforeAll(() => {
      lodash.random.mockReturnValue(10)
    })
    beforeEach(() => {
      ctx = {
        state: {}
      }
    })
    describe('pagination in response', () => {
      it('should contain pagination as part of response', () => {
        _usersList(ctx, () => {})
        expect(ctx.state.response).toHaveProperty('pagination')
      })
      it('should contain page number as part of pagination', () => {
        _usersList(ctx, () => {})
        expect(ctx.state.response.pagination.page).toBe(10)
      })
      it('should contain count as part of pagination', () => {
        _usersList(ctx, () => {})
        expect(ctx.state.response.pagination.count).toBe(20)
      })
    })
  })
})