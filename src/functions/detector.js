var AWS = require('aws-sdk')
const awsRegion = process.env.AWS_REGION || 'us-east-1'
AWS.config.update({ region: awsRegion })
var cloudformation = new AWS.CloudFormation({ apiVersion: '2010-05-15' })
var cloudwatch = new AWS.CloudWatch({ apiVersion: '2010-08-01' })
const logger = require('pino')()
var ydrua = require('../lib/ydrua')
logger.level = process.env.LOG_LEVEL || 'warn'

exports.detector = async function (event, context) {
  logger.info('detector started.')
  let params = {
    StackStatusFilter: [
      'CREATE_COMPLETE',
      'UPDATE_COMPLETE',
      'UPDATE_ROLLBACK_COMPLETE',
      'REVIEW_IN_PROGRESS'
    ]
  }
  logger.debug('StackStatusFilter: ' + params.StackStatusFilter)

  logger.info('retrieving information about all stacks')
  let stackSummaries = await ydrua.getAllStacks(cloudformation, params)

  logger.info('sending metrics')
  stackSummaries.forEach(function (stackSummary) {
    logger.debug('sending drift detection metrics for ' + stackSummary.StackName)
    ydrua.sendMetrics(cloudwatch, stackSummary)
  })
  logger.info('detector finished.')
}
