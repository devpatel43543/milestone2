
import json
import boto3
import uuid
from datetime import datetime
import logging

# Configure logging
logging.getLogger().setLevel(logging.INFO)

# AWS clients
s3 = boto3.client("s3", region_name="us-east-1")
dynamodb = boto3.client("dynamodb", region_name="us-east-1")
doc_client = boto3.resource("dynamodb", region_name="us-east-1")

BUCKET_NAME = "scholar-hub-doc"
TABLE_NAME = "scholar_hub_posts"

CORS_HEADERS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",  # Replace with specific domain in production
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Amz-Date, Authorization, X-Api-Key, X-Amz-Security-Token",
}

def create_table_if_not_exists():
    try:
        dynamodb.describe_table(TableName=TABLE_NAME)
        logging.info(f"Table {TABLE_NAME} already exists")
    except dynamodb.exceptions.ResourceNotFoundException:
        logging.info(f"Creating table {TABLE_NAME}")
        dynamodb.create_table(
            TableName=TABLE_NAME,
            KeySchema=[{"AttributeName": "postId", "KeyType": "HASH"}],
            AttributeDefinitions=[{"AttributeName": "postId", "AttributeType": "S"}],
            ProvisionedThroughput={
                "ReadCapacityUnits": 5,
                "WriteCapacityUnits": 5,
            },
        )
        dynamodb.get_waiter("table_exists").wait(TableName=TABLE_NAME)
        logging.info(f"Table {TABLE_NAME} created successfully")
    except Exception as e:
        logging.error(f"Error creating table: {str(e)}")
        raise

def lambda_handler(event, context):
    # Handle OPTIONS preflight request
    if event.get("httpMethod") == "OPTIONS":
        return {
            "statusCode": 200,
            "headers": CORS_HEADERS,
            "body": json.dumps({"message": "CORS preflight"}),
        }

    logging.info(f"Received event: {json.dumps(event)}")  # Log the full event for debugging

    try:
        # Parse JSON body with error handling
        body = event.get("body")
        if not body:
            return {
                "statusCode": 400,
                "headers": CORS_HEADERS,
                "body": json.dumps({"error": "Request body is missing"}),
            }
        try:
            body = json.loads(body) if isinstance(body, str) else body
        except json.JSONDecodeError as e:
            return {
                "statusCode": 400,
                "headers": CORS_HEADERS,
                "body": json.dumps({"error": f"Invalid JSON body: {str(e)}"}),
            }

        user_id = body.get("userId")
        filename = body.get("filename")
        post_content = body.get("postContent")
        selected_category = body.get("selectedCategory")
        fileType = body.get("fileType")
        if not user_id or not filename or not post_content or not selected_category:
            return {
                "statusCode": 400,
                "headers": CORS_HEADERS,
                "body": json.dumps({"error": "Missing required fields: userId, filename, postContent, or selectedCategory"}),
            }

        # Create table if it doesn't exist
        create_table_if_not_exists()

        # Generate unique postId and file key
        post_id = str(uuid.uuid4())
        file_key = f"posts/{post_id}/attachments/{filename}"

        # Create empty object in S3 (placeholder)
        s3.put_object(
            Bucket=BUCKET_NAME,
            Key=file_key,
            Body=b"",  # Empty body as placeholder
            ContentType="application/octet-stream",
        )
        attachment_url = f"https://{BUCKET_NAME}.s3.us-east-1.amazonaws.com/{file_key}"

        # Generate presigned URL (1 hour expiration)
        presigned_url = s3.generate_presigned_url(
            "put_object",
            Params={"Bucket": BUCKET_NAME, "Key": file_key, "ContentType": fileType},
            ExpiresIn=3600  # 1 hour
        )

        # Store post details in DynamoDB
        table = doc_client.Table(TABLE_NAME)
        table.put_item(
            Item={
                "postId": post_id,
                "userId": user_id,
                "postContent": post_content,
                "selectedCategory": selected_category,
                "attachmentUrls": [attachment_url],
                "createdAt": datetime.utcnow().isoformat(),
            }
        )

        return {
            "statusCode": 200,
            "headers": CORS_HEADERS,
            "body": json.dumps({
                "message": "Presigned URL generated",
                "postId": post_id,
                "presignedUrl": presigned_url,
                "attachmentUrl": attachment_url,
            }),
        }

    except Exception as e:
        logging.error(f"Error: {str(e)}")
        return {
            "statusCode": 500,
            "headers": CORS_HEADERS,
            "body": json.dumps({"error": f"Failed to generate presigned URL: {str(e)}"}),
        }