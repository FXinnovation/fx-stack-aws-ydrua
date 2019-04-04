var AWS = require('aws-sdk')

const logger = require('pino')()

var ydrua = require('../lib/ydrua')

logger.level = process.env.LOG_LEVEL || 'warn'
const awsRegion = process.env.AWS_REGION || 'us-east-1'

exports.executor = async function (event, context) {
  logger.info('executor started.')
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
  let cloudformation = new AWS.CloudFormation({ apiVersion: '2010-05-15' })

  logger.info('retrieving information about all stacks')
  let stackSummaries = await ydrua.getAllStacks(cloudformation, params)

  logger.info('executing drift detection')
  stackSummaries.forEach(function (stackSummary) {
    logger.debug('executing drift detection for ' + stackSummary.StackName)
    ydrua.executeDriftDetection(cloudformation, stackSummary.StackName)
  })
  logger.info('executor finished.')
}
