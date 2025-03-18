import numpy as np
import boto3
import json
import io
import pandas as pd

s3 = boto3.client("s3")
lambda_client = boto3.client('lambda')

BUCKET_NAME = "smartify-ml-data"
MODEL_FILE = "Qlearn/model/q_table.npy"

def load_q_table():
    try:
        response = s3.get_object(Bucket=BUCKET_NAME, Key=MODEL_FILE)
        np_bytes = io.BytesIO(response["Body"].read())
        q_table = np.load(np_bytes)
        print("Successfully loaded Q-table from S3.")
        return q_table
    except s3.exceptions.NoSuchKey:
        print("Q-table not found")
        return None
    except Exception as e:
        print(f"Unexpected error loading model : {str(e)}")
        return None

def timestamp_to_state(timestamp):
    try:
        dt = pd.to_datetime(timestamp)  # Convert to datetime object
        day_of_week = dt.weekday()  # Monday = 0, Sunday = 6
        hour, minute = dt.hour, dt.minute
        state = day_of_week * 96 + (hour * 4 + (minute // 15))  # Time slots per day
        return state
    except Exception as e:
        print(f"{str(e)}")
        return None

def trigger_MQTT_bulb(room,action):
    response = lambda_client.invoke(
        FunctionName='ControlMQTTLights', 
        InvocationType='RequestResponse', 
        Payload = json.dumps({
            "body": json.dumps({  # Ensure body remains a JSON string
                "room": room,
                "action": action
            })
        })
    )
    
    response_payload = json.loads(response['Payload'].read())
    print(response_payload)



def lambda_handler(event, context):
    try:
        body = json.loads(event["body"])
        timestamp = body["timestamp"]
        user_id = body.get("user_id", "User 1")  
    except Exception as e:
        return {
            "statusCode": 400,
            "body": json.dumps({"error": f" Invalid request format: {str(e)}"})
        }

    # Load model
    q_table = load_q_table()
    if q_table is None:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": "Trained model not found !"})
        }

    # Convert timestamp to a state index
    state = timestamp_to_state(timestamp)
    if state is None:
        return {
            "statusCode": 400,
            "body": json.dumps({"error": "Invalid timestamp format"})
        }

    try:
        predicted_action = np.argmax(q_table[state])
        predicted_room = f"Room{predicted_action + 1}"  # Convert to Room X format

        trigger_MQTT_bulb(predicted_room, "ON") # Turn on bulb of predicted room
        
    except IndexError:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": "State index out of range."})
        }

    # Return the predicted room
    return {
        "statusCode": 200,
        "body": json.dumps({
            "timestamp": timestamp,
            "predicted_room": predicted_room
        })
    }

