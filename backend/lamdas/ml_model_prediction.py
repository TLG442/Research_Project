import json
import urllib.request
import urllib.error
import boto3
import logging
import electric_custom_encoder as CustomEncoder
from datetime import datetime, timedelta


dynamodb_table_name = 'smartmeter'
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(dynamodb_table_name)

logger = logging.getLogger()
logger.setLevel(logging.INFO)

smart_meter = '/initalconsumption'
get_Method = 'GET'

def lambda_handler(event, context):
    logger.info(f"Received event: {json.dumps(event)}")
    http_method = event['httpMethod']
    path = event['path']

    if http_method == get_Method and path == smart_meter:
        response = get_initial_consumption()
    else:
        response = buildResponse(200, {'energyConsumed': 1.0})

def buildResponse(statusCode, body=None):
    response = {
        'statusCode': statusCode,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    }
    if body is not None:
        logger.info(f"Building response with body: {json.dumps(body, cls=CustomEncoder)}")
        response['body'] = json.dumps(body, cls=CustomEncoder)
    return response

def get_initial_consumption():
    response = get_predicted_consumption()

    if response['statusCode'] == 200:
        # Extract the prediction value
        result = json.loads(response['body'])
        prediction = result['prediction'][0][0]

        # Get the latest energy consumption from DynamoDB
        response = getSmartMeterLog("s12")

        if response['statusCode'] == 200:
            smart_meter_data = json.loads(response['body'])
            payload = json.loads(smart_meter_data['payload'])
            
            # Extract and convert the values to float or decimal
            energy_consumed = float(payload['energyConsumed'])

            # Extract the timestamp from the smart meter data
            timestamp_str = smart_meter_data['timestamp']  # Assuming 'timestamp' is in ISO format
            timestamp = datetime.strptime(timestamp_str, "%Y-%m-%dT%H:%M:%S.%fZ")  # Adjust format as per your data
            
            # Calculate the time difference from the current time
            current_time = datetime.utcnow()
            time_difference = current_time - timestamp

            # If the time difference is more than 3 minutes, add the predicted value
            if time_difference > timedelta(minutes=3):
                adjusted_prediction = prediction + energy_consumed
            else:
                adjusted_prediction = energy_consumed  # Only return the current value if within 3 minutes

            return {
                'statusCode': 200,
                'body': json.dumps({'energyConsumed': adjusted_prediction})
            }
        else:
            return {
                'statusCode': 200,
                'body': json.dumps({'energyConsumed': 1.0})
            }
    else:
        # If the prediction fails, return a constant value (e.g., 50.0)
        return {
            'statusCode': 200,
            'body': json.dumps({'energyConsumed': 1.0})
        }    
def getSmartMeterLog(meterid):
    try:
        response = table.get_item(Key={'meterid': meterid})
        logger.info(f"Received DynamoDB response: {json.dumps(response)}")
        if 'Item' in response:
            return buildResponse(200, response['Item'])
        else:
            return buildResponse(404, f"No data found for {meterid}")
            
    except Exception as e:
        logger.error(f"Error fetching data: {str(e)}")
        return buildResponse(500, f"Error fetching data: {str(e)}")

    
def get_predicted_consumption():
    # Define the URL for the prediction API
    url = "http://52.66.242.95/predict"
    
    # Data to be sent to the API (features)
    data = {
        "features": [
            [0.04098361],
            [0.0],
            [0.03688525],
            [0.33606557],
            [0.0],
            [0.08606557],
            [0.38114754],
            [0.00819672],
            [0.00409836],
            [0.02459016],
            [0.11065574],
            [0.0],
            [0.0],
            [0.0],
            [0.01229508],
            [0.0],
            [0.02459016],
            [0.0],
            [0.15163934],
            [0.4795082],
            [0.00819672],
            [0.09836066],
            [0.21311475],
            [0.0204918],
            [0.02868852],
            [0.02868852],
            [0.00819672],
            [0.09016393],
            [0.00819672],
            [0.0204918],
            [0.0],
            [0.01229508],
            [0.0],
            [0.06967213],
            [0.21311475],
            [0.00409836],
            [0.24590164],
            [0.04918033],
            [0.06557377],
            [0.0],
            [0.04098361],
            [0.13934426],
            [0.11065574],
            [0.02868852],
            [0.08196721],
            [0.0],
            [0.04508197],
            [0.02868852],
            [0.09836066],
            [0.08196721],
            [0.0],
            [0.01639344],
            [0.12704918],
            [0.05737705],
            [0.01229508],
            [0.01639344],
            [0.06967213],
            [0.13934426],
            [0.0],
            [0.00819672]
        ]
    }

    # Prepare the data to be sent in JSON format
    json_data = json.dumps(data).encode('utf-8')

    # Set the headers
    headers = {
        'Content-Type': 'application/json',
    }

    # Create the request
    request = urllib.request.Request(url, data=json_data, headers=headers)

    try:
        # Make the request and get the response
        with urllib.request.urlopen(request) as response:
            result = json.loads(response.read().decode())

        # Return the result
        return {
            'statusCode': 200,
            'body': json.dumps(result)
        }

    except urllib.error.URLError as e:
        # Handle any errors that occur
        return {
            'statusCode': 500,
            'body': json.dumps({'error': 'Failed to get prediction', 'message': str(e)})
        }



    