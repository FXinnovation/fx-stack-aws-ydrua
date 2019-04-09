const expect = require('chai').expect
let executor = require('../src/functions/executor')

describe('executor', function () {
  it('should return nothing', async function () {
    let result = await executor.executor({})

    expect(result).to.eql(undefined)
  })
})
