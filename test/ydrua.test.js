const expect = require('chai').expect

let ydrua = require('../src/lib/ydrua')

describe('ydrua', function () {
  // describe('getAllStacks', function () {
  //   it('should return a list of stacks', function () {
  //     let params = {}

  //     let cloudformation = {
  //       listStacks: function (params) {
  //         return []
  //       }
  //       .promise(function () {
  //         return []
  //       })
  //     }

  //     console.log(ydrua.getAllStacks(cloudformation, params))
  //   })
  // })

  describe('executeDriftDetection', function () {
    it('should return true on success', function () {
      let stackName = 'exampleStack'
      let cloudformation = {
        detectStackDrift: function (params, callback) {
          callback(null, 'success')
        }
      }
      expect(ydrua.executeDriftDetection(cloudformation, stackName))
        .to.equal(true)
    })
    it('should return true on error', function () {
      let stackName = 'exampleStack'
      let cloudformation = {
        detectStackDrift: function (params, callback) {
          let error = {
            message: 'failed'
          }
          callback(error, null)
        }
      }
      expect(ydrua.executeDriftDetection(cloudformation, stackName))
        .to.equal(true)
    })
    it('should return true when unable to execute drift detection', function () {
      let stackName = 'exampleStack'
      let cloudformation = {
        detectStackDrift: function (params, callback) {
          let error = {
            message: 'Drift detection is already in progress'
          }
          callback(error, null)
        }
      }
      expect(ydrua.executeDriftDetection(cloudformation, stackName))
        .to.equal(true)
    })
  })

  describe('sendMetrics', function () {
    ['IN_SYNC', 'DRIFTED', 'NOT_CHECKED', 'UNKNOWN', 'SOMETHING_ELSE'].forEach(function (driftStatus) {
      describe('when cloudwatch works and status is ' + driftStatus, function () {
        it('should return undefined', function () {
          let stackSummary = {
            StackId: 'arn:aws:cloudformation:us-east-1:714142492823:stack/aws-cur-tam-trust/df5724f0-3e8a-11e9-a75  6-0a5c603a1bba',
            StackName: 'aws-cur-tam-trust',
            TemplateDescription: 'A role that grants readonly access to a bucket and trusts another account to ass  ume',
            CreationTime: new Date('2019-03-04T14:36:18.553Z'),
            StackStatus: 'CREATE_COMPLETE',
            DriftInformation: {
              StackDriftStatus: driftStatus,
              LastCheckTimestamp: new Date('2019-03-15T02:03:04.174Z')
            }
          }

          let cloudwatch = {
            putMetricData: function (params, callback) {
              callback(null, 'success')
            }
          }

          expect(ydrua.sendMetrics(cloudwatch, stackSummary))
            .to.equal(undefined)
        })
      })
      describe('when cloudwatch fails and status is ' + driftStatus, function () {
        it('should return undefined', function () {
          let stackSummary = {
            StackId: 'arn:aws:cloudformation:us-east-1:714142492823:stack/aws-cur-tam-trust/df5724f0-3e8a-11e9-a75  6-0a5c603a1bba',
            StackName: 'aws-cur-tam-trust',
            TemplateDescription: 'A role that grants readonly access to a bucket and trusts another account to ass  ume',
            CreationTime: new Date('2019-03-04T14:36:18.553Z'),
            StackStatus: 'CREATE_COMPLETE',
            DriftInformation: {
              StackDriftStatus: driftStatus,
              LastCheckTimestamp: new Date('2019-03-15T02:03:04.174Z')
            }
          }

          let cloudwatch = {
            putMetricData: function (params, callback) {
              let error = 'failed'
              callback(error, null)
            }
          }

          expect(ydrua.sendMetrics(cloudwatch, stackSummary))
            .to.equal(undefined)
        })
      })
    })
  })
})
