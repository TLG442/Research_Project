import json
import boto3
from flask import request, jsonify
from services.dynamodb_service import put_item
# Initialize AWS Lambda client with a specific region
lambda_client = boto3.client('lambda', region_name='eu-north-1')  # Replace 'your-region' with the actual AWS region
from config import create_dynamodb_client

# Initialize DynamoDB client
dynamodb = create_dynamodb_client()
def log_water_usage():
    try:
        # Get JSON data from request
        data = request.get_json()

        # Ensure required fields are present
        if not data or 'water_flow' not in data:
            return jsonify({'error': 'Missing water_flow'}), 400

        # Invoke Lambda function
        response = lambda_client.invoke(
            FunctionName='water_flow_data_insert',  # Replace with your actual Lambda function name
            InvocationType='RequestResponse',  # Synchronous invocation
            Payload=json.dumps(data)
        )

        # Parse Lambda response
        response_payload = json.loads(response['Payload'].read())

        return jsonify(response_payload), response_payload.get('statusCode', 500)

    except Exception as e:
        return jsonify({'error': str(e)}), 500
