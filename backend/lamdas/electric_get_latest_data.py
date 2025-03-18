import boto3
import json
import logging
from electric_custom_encoder import CustomEncoder

logger = logging.getLogger()
logger.setLevel(logging.INFO)

dynamodb_table_name = 'smartmeterv2'
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(dynamodb_table_name)

get_Method = 'GET'
post_Method = 'POST'
health_check_path = '/health'
smart_meter = '/smartmetertotalconsumption'

def lambda_handler(event, context):
    logger.info(f"Received event: {json.dumps(event)}")
    http_method = event['httpMethod']
    path = event['path']

    if http_method == get_Method and path == health_check_path:
        response = buildResponse(200)
    elif http_method == get_Method and path == smart_meter:
        response = getSmartMeterLog(event['queryStringParameters']['meterid'])
    else:
        response = buildResponse(404)
    return response

def getSmartMeterLog(meterid):
    try:
        response = table.get_item(Key={'meterid': meterid})
        if 'Item' in response:
            return buildResponse(200, response['Item'])
        else:
            return buildResponse(404, f"No data found for {meterid}")
    except Exception as e:
        logger.error(f"Error fetching data: {str(e)}")
        return buildResponse(500, f"Error fetching data: {str(e)}")
        

def buildResponse(statusCode, body=None):
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

