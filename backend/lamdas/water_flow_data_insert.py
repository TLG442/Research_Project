import json
import boto3
from datetime import datetime

# Initialize DynamoDB resource
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('water_usage_data')  # Replace with your DynamoDB table name

def lambda_handler(event, context):
    try:
        # Parse the input JSON from the API Gateway event
        body = json.loads(event['body'])
        
        # Extract water flow and other relevant details from the body

        water_flow = body.get('water_flow')  # in liters per second (L/s) or any unit you use
        timestamp = body.get('timestamp', str(datetime.utcnow()))  # Use current UTC timestamp if not provided

        # Ensure all necessary fields are available
        if  not water_flow:
            return {
                'statusCode': 400,
                'body': json.dumps('Device ID and water flow are required fields.')
            }

        # Put the item into DynamoDB
        response = table.put_item(
            Item={
                'water_flow': water_flow,
                'timestamp': timestamp
                
            }
        )

        # Return success response
        return {
            'statusCode': 200,
            'body': json.dumps(f'Successfully logged water flow for device  at {timestamp}')
        }

    except Exception as e:
        # Log error and return failure response
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps(f"Error logging water flow: {str(e)}")
        }