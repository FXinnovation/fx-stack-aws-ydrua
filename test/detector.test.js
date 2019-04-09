const expect = require('chai').expect
let detector = require('../src/functions/detector')

describe('detector', function () {
  it('should return nothing', async function () {
    let result = await detector.detector({})

    expect(result).to.eql(undefined)
  })
})
