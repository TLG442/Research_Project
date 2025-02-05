import json
import boto3
from datetime import datetime

# Initialize DynamoDB resource
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('water_usage_data')  # Replace with your DynamoDB table name

def lambda_handler(event, context):
    try:
        print(f"Received event: {json.dumps(event)}")  # Debugging: Log the full event

        # Check if 'body' is in the event, handle it accordingly
        body = event.get('body', event)  # If 'body' doesn't exist, treat the whole event as the body
        if isinstance(body, str):  # If body is a string, parse it
            body = json.loads(body)

        # Extract water flow
        water_flow = body.get('water_flow')  # in liters per second
        timestamp = body.get('timestamp', str(datetime.utcnow()))  # Use current UTC timestamp if not provided

        # Ensure water_flow is present
        if water_flow is None:
            return {
                'statusCode': 400,
                'body': json.dumps('Water flow is a required field.')
            }

        # Validate timestamp format
        try:
            timestamp = datetime.strptime(timestamp, '%Y-%m-%dT%H:%M:%SZ') if timestamp else datetime.utcnow()
        except ValueError:
            return {
                'statusCode': 400,
                'body': json.dumps('Invalid timestamp format. Use ISO 8601 format (YYYY-MM-DDTHH:MM:SSZ).')
            }

        # Insert into DynamoDB
        response = table.put_item(
            Item={
                'Flow_data': str(water_flow),  # Store as string if necessary
                'timestamp': timestamp.isoformat(),
            }
        )

        # Return success response
        return {
            'statusCode': 200,
            'body': json.dumps(f'Successfully logged water flow at {timestamp.isoformat()}')
        }

    except Exception as e:
        print(f"Error: {str(e)}")  # Log error
        return {
            'statusCode': 500,
            'body': json.dumps(f"Error logging water flow: {str(e)}")
        }
