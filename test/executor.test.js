// const request = require('request')
const expect = require('chai').expect

let executor = require('../src/functions/executor')

describe('executor', function () {
  it('should return nothing', async function () {
    let result = await executor.executor({})

    expect(result).to.eql(undefined)
  })
})
// var AWS = require('aws-sdk-mock')
//
// AWS.mock('Cloudformation', 'listStacks', function (params, callback) {
//   callback(null, 'test')
// })
//
// describe('foo', function () {
//
// })
//
// AWS.restore('Cloudformation', 'listStacks')
