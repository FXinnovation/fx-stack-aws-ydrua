const request = require('request')
const expect = require('chai').expect

var awsMock = require('aws-sdk-mock')
//var aws = require('aws-sdk')
//awsMock.setSDKInstance(aws)

let ydrua = require('../src/lib/ydrua')

describe('getAllStacks', function () {
  before(function () {
    awsMock.mock('CloudFormation', 'listStacks', function (params) {
      return {
        ResponseMetadata: {
          RequestId: '5476989e-46c9-11e9-b103-5f79a6f8ac27'
        },
        StackSummaries: [
          {
            StackId: 'arn:aws:cloudformation:us-east-1:714142492823:stack/aws-cur-tam-trust/df5724f0-3e8a-11e9-a756-0a5c603a1bba',
            StackName: 'aws-cur-tam-trust',
            TemplateDescription: 'A role that grants readonly access to a bucket and trusts another account to assume',
            CreationTime: new Date('2019-03-04T14:36:18.553Z'),
            StackStatus: 'CREATE_COMPLETE',
            DriftInformation: {
              StackDriftStatus: 'IN_SYNC',
              LastCheckTimestamp: new Date('2019-03-15T02:03:04.174Z')
            }
          }
        ]
      }
    })
  })
  after(function () {
    awsMock.restore('CloudFormation')
  })

  it('should return empty table', async function () {
    let cloudformation = awsMock.CloudFormation
    let result = await ydrua.getAllStacks(cloudformation)

    expect(result).to.eql([])
  })
})
