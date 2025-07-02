import json
import boto3
import logging

# Configure logging
logging.getLogger().setLevel(logging.INFO)

# AWS clients
dynamodb = boto3.client("dynamodb", region_name="us-east-1")
doc_client = boto3.resource("dynamodb", region_name="us-east-1")

TABLE_NAME = "scholar_hub_posts"

CORS_HEADERS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",  # Replace with specific domain in production
    "Access-Control-Allow-Methods": "GET, OPTIONS",
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
        # Scan DynamoDB table for all items
        table = doc_client.Table(TABLE_NAME)
        response = table.scan()

        # Extract items from the response
        posts = response.get("Items", [])
        while "LastEvaluatedKey" in response:
            response = table.scan(ExclusiveStartKey=response["LastEvaluatedKey"])
            posts.extend(response.get("Items", []))

        # Format the response
        formatted_posts = [
            {
                "postId": item.get("postId", ""),
                "userId": item.get("userId", ""),
                "postContent": item.get("postContent", ""),
                "selectedCategory": item.get("selectedCategory", ""),
                "attachmentUrls": item.get("attachmentUrls", []),
                "createdAt": item.get("createdAt", "")
            }
            for item in posts
        ]

        return {
            "statusCode": 200,
            "headers": CORS_HEADERS,
            "body": json.dumps({"posts": formatted_posts, "count": len(formatted_posts)}),
        }

    except Exception as e:
        logging.error(f"Error: {str(e)}")
        return {
            "statusCode": 500,
            "headers": CORS_HEADERS,
            "body": json.dumps({"error": f"Failed to fetch posts: {str(e)}"}),
        }