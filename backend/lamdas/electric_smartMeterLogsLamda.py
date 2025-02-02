import json
import boto3
from datetime import datetime

# Initialize DynamoDB resource
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('SmartMeterLogs')  # Replace with your DynamoDB table name

def lambda_handler(event, context):
    try:
        # Parse the input JSON from the API Gateway event
        body = json.loads(event['body'])
        
        # Extract power consumption and other relevant details from the body
        device_id = body.get('device_id')
        power_consumption = body.get('power_consumption')  # in kWh or any unit you use
        timestamp = body.get('timestamp', str(datetime.utcnow()))  # Use current UTC timestamp if not provided

        # Ensure all necessary fields are available
        if not device_id or not power_consumption:
            return {
                'statusCode': 400,
                'body': json.dumps('Device ID and power consumption are required fields.')
            }

        # Put the item into DynamoDB
        response = table.put_item(
            Item={
                'device_id': device_id,
                'timestamp': timestamp,
                'power_consumption': power_consumption
            }
        )

        # Return success response
        return {
            'statusCode': 200,
            'body': json.dumps(f'Successfully logged power consumption for device {device_id} at {timestamp}')
        }

    except Exception as e:
        # Log error and return failure response
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps(f"Error logging power consumption: {str(e)}")
        }
