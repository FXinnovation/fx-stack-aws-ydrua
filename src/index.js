var AWS = require('aws-sdk')

const logger = require('pino')()

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
  let stackSummaries = await getAllStacks(cloudformation, params)

  logger.info('executing drift detection')
  stackSummaries.forEach(function (stackSummary) {
    logger.debug('executing drift detection for ' + stackSummary.StackName)
    executeDriftDetection(cloudformation, stackSummary.StackName)
  })
  logger.info('executor finished.')
}

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
  let stackSummaries = await getAllStacks(cloudformation, params)

  logger.info('sending metrics')
  stackSummaries.forEach(function (stackSummary) {
    logger.debug('sending drift detection metrics for ' + stackSummary.StackName)
    sendMetrics(cloudwatch, stackSummary)
  })
  logger.info('detector finished.')
}

async function getAllStacks (cloudformation, params = {}) {
  logger.debug('listing all cloudformation stacks')
  logger.debug('parameters: ' + params)
  let getMoreStacks = true
  let stackSummaries = []
  while (getMoreStacks) {
    try {
      let data = await cloudformation.listStacks(params).promise()
      if (data.NextToken == null) {
        getMoreStacks = false
      } else {
        params.NextToken = data.NextToken
      }
      data.StackSummaries.forEach(function (stackSummary) {
        stackSummaries.push(stackSummary)
      })
    } catch (error) {
      logger.error(error)
    }
  }
  logger.debug('stack list has been fetched')
  return stackSummaries
}

function executeDriftDetection (cloudformation, stackName) {
  logger.debug('executing drift detection for ' + stackName)
  let params = {
    StackName: stackName
  }
  cloudformation.detectStackDrift(params, function (err, data) {
    if (err) {
      if (err.message && err.message.match(/Drift detection is already in progress/)) {
        logger.warn('Stack Detection is already in progress for ' + stackName + ', skipping detection.')
      } else {
        logger.error(err)
        logger.trace(err.stack)
      }
    } else {
      logger.info('Stack Detection has been requested for ' + stackName)
      logger.debug('Stack Detection ID: ' + data.StackDriftDetectionId)
      logger.trace(data)
    }
  })
  logger.debug('Drift detection executed for ' + stackName)
}

function sendMetrics (cloudwatch, stackSummary) {
  let stackStatus = 0
  switch (stackSummary.DriftInformation.StackDriftStatus) {
    case 'IN_SYNC':
      stackStatus = 1
      break
    case 'DRIFTED':
      stackStatus = 2
      break
    case 'NOT_CHECKED':
      stackStatus = 3
      break
    case 'UNKNOWN':
      stackStatus = 4
      break
    default:
      stackStatus = 0
      break
  }
  var params = {
    MetricData: [
      {
        MetricName: 'YRDUA_DRIFT_STATUS',
        Dimensions: [
          {
            Name: 'STACK_NAME',
            Value: stackSummary.StackName
          }
        ],
        StorageResolution: 60,
        Timestamp: Date.now() / 1000,
        Unit: 'None',
        Value: stackStatus
      }
    ],
    Namespace: 'YDRUA'
  }
  cloudwatch.putMetricData(params, function (error, data) {
    if (error) {
      logger.error(error)
    } else {
      logger.info('Metric has been pushed for ' + stackSummary.StackName)
    }
  })
}
