import json
import boto3
import pandas as pd
import io
import datetime
import logging

# Set up logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Initialize S3 client
s3 = boto3.client("s3")

# S3 Bucket and File
BUCKET_NAME = "smartify-ml-data"
FILE_NAME = "movements/dataset.csv"

def lambda_handler(event, context):

    logger.info(f"Received event: {json.dumps(event)}")

    # Ensure the event contains a body
    if "body" not in event or not event["body"]:
        logger.error("Missing request body")
        return {
            "statusCode": 400,
            "body": json.dumps({"error": "Missing request body"})
        }

    # Parse the JSON body
    try:
        body = json.loads(event["body"])
    except json.JSONDecodeError as e:
        logger.error(f"Invalid JSON format: {str(e)}")
        return {
            "statusCode": 400,
            "body": json.dumps({"error": "Invalid JSON format"})
        }

    event = body

    # Extract only required fields
    required_keys = ["timestamp", "latitude", "longitude", "room", "user_details"]
    print(event)
    if not all(key in event for key in required_keys):
        return {
            "statusCode": 400,
            "body": json.dumps({"error": "Missing required parameters"})
        }

    # Create a DataFrame from input
    new_data = {
        "timestamp": event["timestamp"],
        "latitude": event["latitude"],
        "longitude": event["longitude"],
        "room": event["room"],
        "user_details": event["user_details"]
    }
    
    new_row = pd.DataFrame([new_data])

    # Try appending data to the existing CSV file
    try:
        # Check if file exists in S3
        obj = s3.get_object(Bucket=BUCKET_NAME, Key=FILE_NAME)
        existing_data = pd.read_csv(io.BytesIO(obj['Body'].read()))
        
        # Append new row
        print("appending")
        updated_data = pd.concat([existing_data, new_row], ignore_index=True)
    except s3.exceptions.NoSuchKey:
        # If file doesn't exist, create a new one
        print("new data")
        updated_data = new_row

    # Convert DataFrame to CSV format
    csv_buffer = io.StringIO()
    updated_data.to_csv(csv_buffer, index=False)
    print("created buffer")

    # Upload updated file back to S3
    s3.put_object(Bucket=BUCKET_NAME, Key=FILE_NAME, Body=csv_buffer.getvalue(), ContentType="text/csv")
    print("written to s3")

    return {
        "statusCode": 200,
        "body": json.dumps({"message": "Data appended successfully!"})
    }