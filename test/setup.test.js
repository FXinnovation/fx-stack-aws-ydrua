//const chai = require('chai')
const sinon = require('sinon')
var awsMock = require('aws-sdk-mock');
var aws = require('aws-sdk')
awsMock.setSDKInstance(aws)

beforeEach(function () {
  this.sandbox = sinon.createSandbox()
  awsMock.mock('CloudFormation', 'listStacks', [])
})

afterEach(function () {
  this.sandbox.restore()
  awsMock.restore('Cloudformation')
})
