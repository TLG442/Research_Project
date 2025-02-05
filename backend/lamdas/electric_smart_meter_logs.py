import boto3
import json
import logging
from electric_custom_encoder import CustomEncoder
from boto3.dynamodb.conditions import Key
import datetime

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
        # Validate required fields
        required_fields = ["meterId", "powerConsumption"]
        missing_fields = [field for field in required_fields if field not in requestBody or requestBody[field] in [None, ""]]

        meter_id = requestBody["meterId"]
        current_power = requestBody["powerConsumption"]

        if missing_fields:
            return buildResponse(400, {
                'Operation': 'SAVE',
                'Message': f'Missing required fields: {", ".join(missing_fields)}'
            })
        
        # Ensure powerConsumption is a valid number
        if not isinstance(current_power, (int, float)) or current_power < 0:
            return buildResponse(400, {
                'Operation': 'SAVE',
                'Message': 'Invalid powerConsumption value. It must be a non-negative number.'
            })
        
        # Get the current month in YYYY-MM format
        current_month = datetime.datetime.now().strftime("%Y-%m")

        # Retrieve the latest log for this meterId and month
        prev_response = table.query(
            KeyConditionExpression=Key('meterId').eq(meter_id) & Key('month').eq(current_month),
            ScanIndexForward=False,  # Get the latest entry first
            Limit=1
        )
        prev_log = prev_response.get('Items', [])

        # If previous log exists, calculate total power consumption
        if prev_log:
            prev_power = prev_log[0].get('totalPowerConsumption', 0)
            total_power = prev_power + current_power
        else:
            # If no previous log, set the current power as the total consumption
            total_power = current_power
        
        # Save the updated log with total power consumption
        response = table.put_item(
            Item={
                'meterId': meter_id,
                'month': current_month,
                'totalPowerConsumption': total_power,
                'timestamp': datetime.datetime.now().isoformat(),  # Optional, for logging purposes
            }
        )
        
        return buildResponse(200, {
            'Operation': 'SAVE',
            'Message': 'Power consumption logged successfully.',
            'TotalPowerConsumption': total_power
        })

    except Exception as e:
        return buildResponse(500, {
            'Operation': 'SAVE',
            'Message': f'Error occurred: {str(e)}'
        })    

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
