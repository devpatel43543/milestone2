import json
import boto3
import logging
from boto3.dynamodb.conditions import Attr

# Configure logging
logging.getLogger().setLevel(logging.INFO)

# AWS client
doc_client = boto3.resource("dynamodb", region_name="us-east-1")
TABLE_NAME = "scholar_hub_posts"

CORS_HEADERS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Amz-Date, Authorization, X-Api-Key, X-Amz-Security-Token",
}

def lambda_handler(event, context):
    if event.get("httpMethod") == "OPTIONS":
        return {
            "statusCode": 200,
            "headers": CORS_HEADERS,
            "body": json.dumps({"message": "CORS preflight"}),
        }

    logging.info(f"Received event: {json.dumps(event)}")

    try:
        user_id = event.get("userId")
        if not user_id:
            return {
                "statusCode": 400,
                "headers": CORS_HEADERS,
                "body": json.dumps({"error": "userId is required"}),
            }

        # Scan DynamoDB with filter
        table = doc_client.Table(TABLE_NAME)
        response = table.scan(
            FilterExpression=Attr("userId").eq(user_id)
        )

        posts = response.get("Items", [])
        while "LastEvaluatedKey" in response:
            response = table.scan(
                FilterExpression=Attr("userId").eq(user_id),
                ExclusiveStartKey=response["LastEvaluatedKey"]
            )
            posts.extend(response.get("Items", []))

        # Log raw posts before formatting
        logging.info(f"Raw posts from DB: {posts}")

        # Format posts safely
        formatted_posts = [
            {
                "postId": item.get("postId", ""),
                "postContent": item.get("postContent", ""),
                "selectedCategory": item.get("selectedCategory", ""),
                "attachmentUrls": item.get("attachmentUrls", []),
                "createdAt": item.get("createdAt", "")
            }
            for item in posts
        ]

        logging.info(f"Total posts found: {len(formatted_posts)}")

        return {
            "statusCode": 200,
            "headers": CORS_HEADERS,
            "body": json.dumps({
                "posts": formatted_posts,
                "count": len(formatted_posts)
            })
        }

    except Exception as e:
        logging.error(f"Error: {str(e)}")
        return {
            "statusCode": 500,
            "headers": CORS_HEADERS,
            "body": json.dumps({"error": f"Failed to fetch posts: {str(e)}"}),
        }
