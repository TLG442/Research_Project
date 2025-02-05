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

        # Ensure water flow is provided
        if not water_flow:
            return {
                'statusCode': 400,
                'body': json.dumps('Water flow is a required field.')
            }

        # Ensure the timestamp is valid (it could be optional if not provided in the request)
        try:
            timestamp = datetime.strptime(timestamp, '%Y-%m-%dT%H:%M:%SZ') if timestamp else datetime.utcnow()
        except ValueError:
            return {
                'statusCode': 400,
                'body': json.dumps('Invalid timestamp format. Use ISO 8601 format (YYYY-MM-DDTHH:MM:SSZ).')
            }

        # Put the item into DynamoDB
        response = table.put_item(
            Item={
                'water_flow': water_flow,
                'timestamp': timestamp.isoformat(),  # Store timestamp in ISO format
            }
        )

        # Return success response
        return {
            'statusCode': 200,
            'body': json.dumps(f'Successfully logged water flow at {timestamp.isoformat()}')
        }

    except Exception as e:
        # Log error and return failure response
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps(f"Error logging water flow: {str(e)}")
        }
