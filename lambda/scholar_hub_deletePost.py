
import json
import boto3
from botocore.exceptions import ClientError
import logging

# Configure logging
logging.getLogger().setLevel(logging.INFO)

dynamodb = boto3.client('dynamodb')

CORS_HEADERS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",  # Replace with specific domain in production
    "Access-Control-Allow-Methods": "DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
}

def lambda_handler(event, context):
    logging.info(f"Received event: {json.dumps(event)}")

    # Handle OPTIONS preflight request
    if event.get("httpMethod") == "OPTIONS":
        return {
            "statusCode": 200,
            "headers": CORS_HEADERS,
            "body": json.dumps({"message": "CORS preflight"}),
        }

    try:
        # Extract postId from event payload
        postId = event.get("postId") or event.get("data", {}).get("postId")
        logging.info(f"Extracted postId: {postId}")
        if not postId:
            return {
                'statusCode': 400,
                'headers': CORS_HEADERS,
                'body': json.dumps({'error': 'Missing postId'}),
            }

        table_name = 'scholar_hub_posts'

        # Check if post exists
        response = dynamodb.get_item(
            TableName=table_name,
            Key={
                'postId': {'S': postId}
            }
        )

        if 'Item' not in response:
            return {
                'statusCode': 404,
                'headers': CORS_HEADERS,
                'body': json.dumps({'error': 'Post not found'}),
            }

        # Delete the item without checking ownership
        dynamodb.delete_item(
            TableName=table_name,
            Key={
                'postId': {'S': postId}
            }
        )

        logging.info(f"Successfully deleted post with postId: {postId}")

        return {
            'statusCode': 200,
            'headers': CORS_HEADERS,
            'body': json.dumps({'message': f'Post {postId} deleted successfully'}),
        }

    except ClientError as e:
        logging.error(f"ClientError: {e}")
        return {
            'statusCode': 500,
            'headers': CORS_HEADERS,
            'body': json.dumps({'error': 'Failed to delete post due to client error'}),
        }

    except Exception as e:
        logging.error(f"Unexpected error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': CORS_HEADERS,
            'body': json.dumps({'error': f'Internal server error: {str(e)}'}),
        }