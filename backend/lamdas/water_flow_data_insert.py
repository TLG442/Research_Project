import json
import boto3
import decimal  # Import Decimal for DynamoDB numeric storage
from datetime import datetime

# Initialize DynamoDB resource
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('water_usage_data')  # Replace with your DynamoDB table name

def lambda_handler(event, context):
    try:
        print(f"Received event: {json.dumps(event)}")  # Debugging: Log the full event

        # Extract request body
        body = event.get('body', event)  # If 'body' doesn't exist, treat event as body
        if isinstance(body, str):  # If body is a string, parse it
            body = json.loads(body)

        # Extract water flow data
        water_flow = body.get('water_flow')  # Expecting a list or single value
        timestamp = body.get('timestamp', str(datetime.utcnow()))  # Use current UTC timestamp if not provided

        # Ensure water_flow is present
        if water_flow is None:
            return {
                'statusCode': 400,
                'body': json.dumps('Water flow is a required field.')
            }

        # Convert single values into a list
        if not isinstance(water_flow, list):
            water_flow = [water_flow]

        # Convert all float values to Decimal (DynamoDB does not support float)
        water_flow = [decimal.Decimal(str(value)) for value in water_flow]

        # Validate timestamp format
        try:
            timestamp = datetime.strptime(timestamp, '%Y-%m-%dT%H:%M:%SZ') if timestamp else datetime.utcnow()
        except ValueError:
            return {
                'statusCode': 400,
                'body': json.dumps('Invalid timestamp format. Use ISO 8601 format (YYYY-MM-DDTHH:MM:SSZ).')
            }

        # Define a partition key based on the date (ignoring the time part)
        partition_key = f"water_usage_{timestamp.date().isoformat()}"  # Key based on the date only

        # Check if the record for the same date already exists
        response = table.get_item(
            Key={'Flow_data': partition_key}
        )

        if 'Item' in response:
            # Record exists, append new water flow values to existing list
            existing_flow_values = response['Item'].get('Flow_values', [])
            existing_flow_values.extend(water_flow)  # Append the new water flow data

            # Update the existing record with new water flow values
            table.update_item(
                Key={'Flow_data': partition_key},
                UpdateExpression="SET Flow_values = :updated_flow_values",
                ExpressionAttributeValues={
                    ':updated_flow_values': existing_flow_values
                }
            )

            # Return success response
            return {
                'statusCode': 200,
                'body': json.dumps(f"Successfully added water flow for {timestamp.date().isoformat()}")
            }
        else:
            # New record for the timestamp, insert into DynamoDB
            table.put_item(
                Item={
                    'Flow_data': partition_key,  # Unique key for each day
                    'Flow_values': water_flow,
                    'timestamp': timestamp.isoformat()
                }
            )

            # Return success response
            return {
                'statusCode': 200,
                'body': json.dumps(f'Successfully logged new water flow for {timestamp.date().isoformat()}')
            }

    except Exception as e:
        print(f"Error: {str(e)}")  # Log error
        return {
            'statusCode': 500,
            'body': json.dumps(f"Error logging water flow: {str(e)}")
        }
