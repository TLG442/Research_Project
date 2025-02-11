import json
import boto3
import decimal  # Required to handle DynamoDB Decimal type

# Initialize DynamoDB resource
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('water_usage_data')  # Replace with your actual table name

def decimal_to_float(obj):
    """Convert Decimal types to float for JSON serialization."""
    if isinstance(obj, decimal.Decimal):
        return float(obj)
    raise TypeError

def lambda_handler(event, context):
    try:
        print(f"Received event: {json.dumps(event)}")  # Debugging

        # Extract 'Flow_data' key from request
        body = event.get('body', event)
        if isinstance(body, str):
            body = json.loads(body)

        flow_data_key = body.get('Flow_data')  # Example: "water_usage_2025-02-16"
        if not flow_data_key:
            return {
                'statusCode': 400,
                'body': json.dumps('Flow_data key is required.')
            }

        # Fetch item from DynamoDB
        response = table.get_item(Key={'Flow_data': flow_data_key})

        if 'Item' not in response:
            return {
                'statusCode': 404,
                'body': json.dumps(f"No data found for {flow_data_key}")
            }

        # Convert Decimal values to float
        item = response['Item']
        item['Flow_values'] = [float(value) for value in item.get('Flow_values', [])]

        # Return response
        return {
            'statusCode': 200,
            'body': json.dumps(item, default=decimal_to_float)  # Ensures Decimal values are converted
        }

    except Exception as e:
        print(f"Error: {str(e)}")  # Debugging
        return {
            'statusCode': 500,
            'body': json.dumps(f"Error fetching data: {str(e)}")
        }
