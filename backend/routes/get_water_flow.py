import json
import boto3
from flask import request, jsonify
from config import create_dynamodb_client

# Initialize AWS Lambda client
lambda_client = boto3.client('lambda', region_name='eu-north-1')  # Replace with your AWS region

# Initialize DynamoDB client
dynamodb = create_dynamodb_client()

def get_water_usage():
    try:
        # Get JSON data from request
        data = request.get_json()

        # Ensure required fields are present
        if not data or 'date' not in data:
            return jsonify({'error': 'Missing date field'}), 400

        # Invoke Lambda function
        response = lambda_client.invoke(
            FunctionName='get_water_flow_data',  # Replace with your actual get Lambda function name
            InvocationType='RequestResponse',  # Synchronous invocation
            Payload=json.dumps(data)
        )

        # Parse Lambda response
        response_payload = json.loads(response['Payload'].read())

        return jsonify(response_payload), response_payload.get('statusCode', 500)

    except Exception as e:
        return jsonify({'error': str(e)}), 500
