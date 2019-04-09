// const chai = require('chai')
const sinon = require('sinon')
// var awsMock = require('aws-sdk-mock')
// var aws = require('aws-sdk')
// awsMock.setSDKInstance(aws)
//
// beforeEach(function () {
// })
//
afterEach(function () {
  sinon.restore()
})
