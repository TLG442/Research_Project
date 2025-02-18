import json
import boto3
from botocore.exceptions import ClientError

# Initialize the IoT client
iot_client = boto3.client('iot-data', region_name='eu-north-1')  # Example: 'us-west-2'

# Set the endpoint for AWS IoT
iot_endpoint = 'a1e2qijealxzn7-ats.iot.eu-north-1.amazonaws.com'  # Example: 'abcd1234.iot.us-west-2.amazonaws.com'

def lambda_handler(event, context):
    try:
        # Print the full event to help debug
        print("Full Event: ", event)

        # Directly access the 'metrics' value from the event
        metrics_value = event.get('metrics', None)

        # If no metrics value is found in the event
        if metrics_value is None:
            return {
                'statusCode': 400,
                'body': json.dumps({'message': 'No metrics value found'})
            }

        # MQTT topic to publish
        topic = 'esp32/pub'

        # Payload to send
        payload = {
            'metrics': metrics_value
        }

        # Publish to AWS IoT topic
        try:
            response = iot_client.publish(
                topic=topic,
                qos=0,
                payload=json.dumps(payload)
            )
            return {
                'statusCode': 200,
                'body': json.dumps({'message': 'Message published successfully'})
            }
        except ClientError as e:
            return {
                'statusCode': 500,
                'body': json.dumps({'message': 'Failed to publish message', 'error': str(e)})
            }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'message': 'Error processing request', 'error': str(e)})
        }
