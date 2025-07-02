import json
import boto3
import logging

# Configure logging
logging.getLogger().setLevel(logging.INFO)

# AWS clients
dynamodb = boto3.client("dynamodb", region_name="us-east-1")
doc_client = boto3.resource("dynamodb", region_name="us-east-1")

TABLE_NAME = "dal_community_users"

CORS_HEADERS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",  # Replace with specific domain in production
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Amz-Date, Authorization, X-Api-Key, X-Amz-Security-Token",
}

def lambda_handler(event, context):
    # Handle OPTIONS preflight request
    if event.get("httpMethod") == "OPTIONS":
        return {
            "statusCode": 200,
            "headers": CORS_HEADERS,
            "body": json.dumps({"message": "CORS preflight"}),
        }

    logging.info(f"Received event: {json.dumps(event)}")

    try:
        # Get userId directly from event
        user_id = event.get("userId")
        print(f"Extracted user_id: {user_id}")

        if not user_id:
            return {
                "statusCode": 400,
                "headers": CORS_HEADERS,
                "body": json.dumps({"error": "userId is required in event"}),
            }

        # Query DynamoDB for user by sub (partition key)
        table = doc_client.Table(TABLE_NAME)
        response = table.get_item(Key={"sub": user_id})

        # Extract user item from the response
        user = response.get("Item", None)

        if not user:
            return {
                "statusCode": 404,
                "headers": CORS_HEADERS,
                "body": json.dumps({"error": f"No user found with sub: {user_id}"}),
            }

        # Format the response
        formatted_user = {
            "sub": user.get("sub", ""),
            "email": user.get("email", ""),
            "name": user.get("name", ""),
            "role": user.get("role", ""),
            # Add more attributes as needed based on your table schema
        }

        return {
            "statusCode": 200,
            "headers": CORS_HEADERS,
            "body": json.dumps({"user": formatted_user}),
        }

    except Exception as e:
        logging.error(f"Error: {str(e)}")
        return {
            "statusCode": 500,
            "headers": CORS_HEADERS,
            "body": json.dumps({"error": f"Failed to fetch user: {str(e)}"}),
        }