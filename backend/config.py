import boto3

def create_dynamodb_client():
    """Create and return a DynamoDB client."""
    session = boto3.Session(
        aws_access_key_id="fakeAccessKey",  # Dummy key for local use
        aws_secret_access_key="fakeSecretKey",  # Dummy key for local use
        region_name="us-west-2"  # Set your region
    )
    return session.client('dynamodb', endpoint_url='http://localhost:8000')  # DynamoDB Local URL
