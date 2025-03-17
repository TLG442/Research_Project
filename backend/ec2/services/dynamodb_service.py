import boto3
from config import create_dynamodb_client

# Initialize DynamoDB client
dynamodb = create_dynamodb_client()

def put_item(table_name, item):
    """Insert a new item into the DynamoDB table."""
    dynamodb.put_item(
        TableName=table_name,
        Item=item
    )

def scan_table(table_name):
    """Scan the DynamoDB table and return the items."""
    response = dynamodb.scan(TableName=table_name)
    return response.get('Items', [])

def create_table(table_name):
    """Create a DynamoDB table."""
    try:
        response = dynamodb.create_table(
            TableName=table_name,
            KeySchema=[
                {'AttributeName': 'x_Timestamp', 'KeyType': 'HASH'}
            ],
            AttributeDefinitions=[
                {'AttributeName': 'x_Timestamp', 'AttributeType': 'S'}
            ],
            ProvisionedThroughput={
                'ReadCapacityUnits': 5,
                'WriteCapacityUnits': 5
            }
        )
        return response
    except Exception as e:
        print(f"Error creating table: {e}")
