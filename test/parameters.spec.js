import {
    withPathValue,
    withQuerystringValue,
    kompose
} from '../lib'
import { expect, AssertionError } from 'chai'
describe('Parameters', async () => {

    describe('withPathValue', async () => {
        it('should throw if value is not defined and it is not optional', async () => {
            context = {
                state: {}
            }

            let kompo = await kompose(
                async (ctx, next) => {
                    ctx.state = context.state
                    await next()
                },
                async (ctx, next) => {
                    let isExecuted = true
                    expect(isExecuted).be.true
                    await next()
                    expect(isExecuted).be.true
                },
                withPathValue('test'),
                async (ctx, next) => {
                    let isExecuted = true
                    expect(isExecuted).be.false
                    await next()
                    expect(isExecuted).be.false

                },
            )

            try {
                await kompo({}, {})
            } catch (err) {
                if (err instanceof AssertionError)
                    throw err

                expect(err).be.instanceOf(Error)
            }
        })
        it('should not throw if value is not defined and it is optional', async () => {
            context = {
                state: {}
            }

            let kompo = await kompose(
                async (ctx, next) => {
                    ctx.state = context.state
                    await next()
                },
                async (ctx, next) => {
                    let isExecuted = true
                    expect(isExecuted).be.true
                    await next()
                    expect(isExecuted).be.true
                },
                withPathValue('test', undefined, true),
                async (ctx, next) => {
                    let isExecuted = true
                    expect(isExecuted).be.true
                    await next()
                    expect(isExecuted).be.true

                },
            )

            try {
                await kompo({}, {})
            } catch (err) {
                if (err instanceof AssertionError)
                    throw err
                throw new Error('Should not throw')
            }
        })
        it('should set the default value if value not found', async () => {
            context = {
                state: {}
            }

            let kompo = await kompose(
                async (ctx, next) => {
                    ctx.state = context.state
                    await next()
                },
                async (ctx, next) => {
                    expect(ctx.state).to.not.have.property('test')
                    await next()
                    expect(ctx.state).to.have.property('test').which.equal(25)
                },
                withPathValue('test', 25, true),
                async (ctx, next) => {
                    expect(ctx.state).to.have.property('test').which.equal(25)
                    await next()
                    expect(ctx.state).to.have.property('test').which.equal(25)
                },
            )

            try {
                await kompo({}, {})
            } catch (err) {
                if (err instanceof AssertionError)
                    throw err
                throw new Error('Should not throw')
            }
        })
        it('should set the value', async () => {
            context = {
                state: {
                    test: 'NotOk'
                }
            }

            let kompo = await kompose(
                async (ctx, next) => {
                    ctx.state = context.state
                    await next()
                },
                async (ctx, next) => {
                    expect(ctx.state).to.have.property('test').which.equal('NotOk')
                    await next()
                    expect(ctx.state).to.have.property('test').which.equal('OK')
                },
                withPathValue('test', 25, true),
                async (ctx, next) => {
                    expect(ctx.state).to.have.property('test').which.equal('OK')
                    await next()
                    expect(ctx.state).to.have.property('test').which.equal('OK')
                },
            )

            try {
                await kompo({
                    pathParameters: {
                        test: 'OK'
                    }
                }, {})
            } catch (err) {
                if (err instanceof AssertionError)
                    throw err
                throw new Error('Should not throw')
            }
        })
        it('should set the value even if name has dot', async () => {
            context = {
                state: {
                }
            }

            let kompo = await kompose(
                async (ctx, next) => {
                    ctx.state = context.state
                    await next()
                },
                async (ctx, next) => {
                    expect(ctx.state).to.not.have.property('test.test')
                    await next()
                    expect(ctx.state).to.have.property('test.test').which.equal('OK')
                },
                withPathValue('test.test', 25, true),
                async (ctx, next) => {
                    expect(ctx.state).to.have.property('test.test').which.equal('OK')
                    await next()
                    expect(ctx.state).to.have.property('test.test').which.equal('OK')
                },
            )

            try {
                await kompo({
                    pathParameters: {
                        'test.test': 'OK'
                    }
                }, {})
            } catch (err) {
                if (err instanceof AssertionError)
                    throw err
                throw new Error('Should not throw')
            }
        })
    })


    describe('withQuerystringValue', async () => {
        it('should throw if value is not defined and it is not optional', async () => {
            context = {
                state: {}
            }

            let kompo = await kompose(
                async (ctx, next) => {
                    ctx.state = context.state
                    await next()
                },
                async (ctx, next) => {
                    let isExecuted = true
                    expect(isExecuted).be.true
                    await next()
                    expect(isExecuted).be.true
                },
                withQuerystringValue('test'),
                async (ctx, next) => {
                    let isExecuted = true
                    expect(isExecuted).be.false
                    await next()
                    expect(isExecuted).be.false

                },
            )

            try {
                await kompo({}, {})
            } catch (err) {
                if (err instanceof AssertionError)
                    throw err

                expect(err).be.instanceOf(Error)
            }
        })
        it('should not throw if value is not defined and it is optional', async () => {
            context = {
                state: {}
            }

            let kompo = await kompose(
                async (ctx, next) => {
                    ctx.state = context.state
                    await next()
                },
                async (ctx, next) => {
                    let isExecuted = true
                    expect(isExecuted).be.true
                    await next()
                    expect(isExecuted).be.true
                },
                withQuerystringValue('test', undefined, true),
                async (ctx, next) => {
                    let isExecuted = true
                    expect(isExecuted).be.true
                    await next()
                    expect(isExecuted).be.true

                },
            )

            try {
                await kompo({}, {})
            } catch (err) {
                if (err instanceof AssertionError)
                    throw err
                throw new Error('Should not throw')
            }
        })
        it('should set the default value if value not found', async () => {
            context = {
                state: {}
            }

            let kompo = await kompose(
                async (ctx, next) => {
                    ctx.state = context.state
                    await next()
                },
                async (ctx, next) => {
                    expect(ctx.state).to.not.have.property('test')
                    await next()
                    expect(ctx.state).to.have.property('test').which.equal(25)
                },
                withQuerystringValue('test', 25, true),
                async (ctx, next) => {
                    expect(ctx.state).to.have.property('test').which.equal(25)
                    await next()
                    expect(ctx.state).to.have.property('test').which.equal(25)
                },
            )

            try {
                await kompo({}, {})
            } catch (err) {
                if (err instanceof AssertionError)
                    throw err
                throw new Error('Should not throw')
            }
        })
        it('should set the value', async () => {
            context = {
                state: {
                    test: 'NotOk'
                }
            }

            let kompo = await kompose(
                async (ctx, next) => {
                    ctx.state = context.state
                    await next()
                },
                async (ctx, next) => {
                    expect(ctx.state).to.have.property('test').which.equal('NotOk')
                    await next()
                    expect(ctx.state).to.have.property('test').which.equal('OK')
                },
                withQuerystringValue('test', 25, true),
                async (ctx, next) => {
                    expect(ctx.state).to.have.property('test').which.equal('OK')
                    await next()
                    expect(ctx.state).to.have.property('test').which.equal('OK')
                },
            )

            try {
                await kompo({
                    queryStringParameters: {
                        test: 'OK'
                    }
                }, {})
            } catch (err) {
                if (err instanceof AssertionError)
                    throw err
                throw new Error('Should not throw')
            }
        })
        it('should set the value even if name has dot', async () => {
            context = {
                state: {
                }
            }

            let kompo = await kompose(
                async (ctx, next) => {
                    ctx.state = context.state
                    await next()
                },
                async (ctx, next) => {
                    expect(ctx.state).to.not.have.property('test.test')
                    await next()
                    expect(ctx.state).to.have.property('test.test').which.equal('OK')
                },
                withQuerystringValue('test.test', 25, true),
                async (ctx, next) => {
                    expect(ctx.state).to.have.property('test.test').which.equal('OK')
                    await next()
                    expect(ctx.state).to.have.property('test.test').which.equal('OK')
                },
            )

            try {
                await kompo({
                    queryStringParameters: {
                        'test.test': 'OK'
                    }
                }, {})
            } catch (err) {
                if (err instanceof AssertionError)
                    throw err
                throw new Error('Should not throw')
            }
        })
    })
})