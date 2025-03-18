import boto3
import json
import logging
from electric_custom_encoder import CustomEncoder
from boto3.dynamodb.conditions import Key
import datetime
from decimal import Decimal

logger = logging.getLogger()
logger.setLevel(logging.INFO)


dyanamodb_table_name = 'smartmeterlatestsixty'
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(dyanamodb_table_name)

get_Method = 'GET'
post_Method = 'POST'
health_check_path = '/health'
smart_meter = '/smartmeter'


def lambda_handler(event,context):
    logger.info(f"Received event: {json.dumps(event)}")
    http_method = event['httpMethod']
    path = event['path']

    if http_method == get_Method and path == health_check_path:
        response =  buildResponse(200)
    elif http_method == get_Method and path == smart_meter:
        response = getLatestLogs()
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

    

def getLatestLogs():
    try:
        # Perform a scan and limit the results to 60 items
        response = table.scan(
            Limit=60  # Limit the number of items returned
        )
        logs = response['Items']
        logger.info(f"Retrieved the latest 60 logs: {logs}")
        return buildResponse(200, logs)
    except Exception as e:
        logger.exception('Error scanning latest logs')
        return buildResponse(500, {'Operation': 'SCAN', 'Message': 'Failed to scan latest logs', 'Error': str(e)})
