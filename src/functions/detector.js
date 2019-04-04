var AWS = require('aws-sdk')

const logger = require('pino')()

var ydrua = require('../lib/ydrua')

logger.level = process.env.LOG_LEVEL || 'warn'
const awsRegion = process.env.AWS_REGION || 'us-east-1'

exports.detector = async function (event, context) {
  logger.info('detector started.')
  AWS.config.update({ region: awsRegion })
  let params = {
    StackStatusFilter: [
      'CREATE_COMPLETE',
      'ROLLBACK_COMPLETE',
      'UPDATE_COMPLETE',
      'UPDATE_ROLLBACK_COMPLETE',
      'REVIEW_IN_PROGRESS'
    ]
  }
  logger.debug('StackStatusFilter: ' + params.StackStatusFilter)
  var cloudformation = new AWS.CloudFormation({ apiVersion: '2010-05-15' })
  var cloudwatch = new AWS.CloudWatch({ apiVersion: '2010-08-01' })

  logger.info('retrieving information about all stacks')
  let stackSummaries = await ydrua.getAllStacks(cloudformation, params)

  logger.info('sending metrics')
  stackSummaries.forEach(function (stackSummary) {
    logger.debug('sending drift detection metrics for ' + stackSummary.StackName)
    ydrua.sendMetrics(cloudwatch, stackSummary)
  })
  logger.info('detector finished.')
}
