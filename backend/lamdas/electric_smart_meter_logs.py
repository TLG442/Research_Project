import boto3
import json
import logging
from electric_custom_encoder import CustomEncoder
from boto3.dynamodb.conditions import Key

logger = logging.getLogger()
logger.setLevel(logging.INFO)


dyanamodb_table_name = 'smart-meter-logs'
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(dyanamodb_table_name)

get_Method = 'GET'
post_Method = 'POST'
health_check_path = '/health'
smart_meter = '/smart-meter'


def lambda_handler(event,context):
    logger.info(f"Received event: {json.dumps(event)}")
    http_method = event['httpMethod']
    path = event['path']

    if http_method == get_Method and path == health_check_path:
        response =  buildResponse(200)
    elif http_method == get_Method and path == smart_meter:
        response = getSmartMeterLogs(event['queryStringParameters']['meterId'])
    elif http_method == post_Method and path == smart_meter:
        response = saveLogs(json.loads(event['body']))
    else:
        response = buildResponse(404)

    return response


def buildResponse(statusCode,body=None):
    response = {
        'statusCode': statusCode,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    }
    if body is not None:
        response['body'] = json.dumps(body, cls=CustomEncoder)
    return response

def saveLogs(requestBody):
    try:
        table.put_item(Item=requestBody)
        body = {
            'Operation': 'SAVE',
            'Message': 'Successfully saved logs',
            'Log': requestBody
        }
        return buildResponse(201,body)
    except:
        logger.exception('Error saving logs')
        return buildResponse(500,{'Operation': 'SAVE', 'Message': 'Failed to save logs'})
    

def getSmartMeterLogs(meterId):
    try:
        response = table.query(
            KeyConditionExpression=Key('meterId').eq(meterId)
        )
        result = response['Items']
        return buildResponse(200, result)
    except:
        logger.exception('Error retrieving logs')
        return buildResponse(500, {'Operation': 'GET', 'Message': 'Failed to retrieve logs'}) 

def getSmartMeterLogsbyDate(meterId, start_date, end_date):
    try:
        response = table.query(
            KeyConditionExpression=Key('meterId').eq(meterId) & Key('date').between(start_date, end_date),
            ScanIndexForward=False  # Latest logs first
        )
        logs = response.get('Items', [])
        return buildResponse(200, logs)
    except Exception as e:
        logger.exception(f"Error retrieving logs for meterId: {meterId} from {start_date} to {end_date}")
        return buildResponse(500, {'Operation': 'GET', 'Message': 'Failed to fetch logs', 'Error': str(e)})
