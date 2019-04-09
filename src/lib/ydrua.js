const logger = require('pino')()

exports.getAllStacks = async function (cloudformation, params = {}) {
  logger.debug('listing all cloudformation stacks')
  logger.debug('parameters: ' + params)
  let getMoreStacks = true
  let stackSummaries = []
  while (getMoreStacks) {
    try {
      let data = await cloudformation.listStacks(params).promise()
      console.log(data)
      if (data.NextToken == null) {
        getMoreStacks = false
      } else {
        params.NextToken = data.NextToken
      }
      data.StackSummaries.forEach(function (stackSummary) {
        stackSummaries.push(stackSummary)
        console.log(stackSummary)
      })
    } catch (error) {
      getMoreStacks = false
      logger.error(error)
    }
  }
  logger.debug('stack list has been fetched')
  return stackSummaries
}

exports.executeDriftDetection = function (cloudformation, stackName) {
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
  return true
}

exports.sendMetrics = function (cloudwatch, stackSummary) {
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
