import json
import boto3
from flask import request, jsonify

# Initialize AWS Lambda client
lambda_client = boto3.client('lambda')

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
