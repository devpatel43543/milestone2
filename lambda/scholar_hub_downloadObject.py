import json
import boto3
import logging
from botocore.exceptions import ClientError

# Configure logging
logging.getLogger().setLevel(logging.INFO)

# AWS Clients
dynamodb = boto3.client('dynamodb')
s3_client = boto3.client('s3', region_name='us-east-1')

# S3 Bucket name
S3_BUCKET = "scholar-hub-doc"

CORS_HEADERS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",  # Replace with specific domain in production
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
} 

def generate_presigned_url(s3_client, client_method, method_parameters, expires_in):
    """Generate a presigned URL for S3 object download"""
    try:
        return s3_client.generate_presigned_url(
            ClientMethod=client_method,
            Params=method_parameters,
            ExpiresIn=expires_in
        )
    except ClientError as e:
        logging.error(f"Couldn't generate presigned URL: {e}")
        return "Not available"

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
        # Extract body
        body = event.get("body")
        if body:
            try:
                body = json.loads(body)
            except json.JSONDecodeError:
                return {
                    'statusCode': 400,
                    'headers': CORS_HEADERS,
                    'body': json.dumps({'error': 'Invalid JSON in request body'}),
                }
        else:
            body = {}

        # Get postId
        post_id = body.get("postId") or event.get("postId") or body.get("data", {}).get("postId")
        if not post_id:
            return {
                'statusCode': 400,
                'headers': CORS_HEADERS,
                'body': json.dumps({'error': 'Missing postId'}),
            }

        # Fetch post from DynamoDB
        response = dynamodb.get_item(
            TableName='scholar_hub_posts',
            Key={'postId': {'S': post_id}}
        )

        if 'Item' not in response:
            return {
                'statusCode': 404,
                'headers': CORS_HEADERS,
                'body': json.dumps({'error': 'Post not found'}),
            }

        attachment_urls = response['Item'].get('attachmentUrls', {'L': []})['L']
        if not attachment_urls:
            return {
                'statusCode': 400,
                'headers': CORS_HEADERS,
                'body': json.dumps({'error': 'No attachments found for this post'}),
            }

        # Get the first attachment URL
        attachment_url = attachment_urls[0]['S']
        logging.info(f"Original attachment URL: {attachment_url}")
        
        # Extract S3 key from the URL
        # URL format: https://scholar-hub-doc.s3.us-east-1.amazonaws.com/posts/3859c6a9-3201-47f9-995f-ace683b218ad/attachments/AgenticAI.pdf
        s3_key = ""
        if attachment_url.startswith("https://"):
            # Split by "/" and take everything after the domain (index 3 onwards)
            s3_key = "/".join(attachment_url.split("/")[3:])
        else:
            # If it's already just the key, strip leading "/"
            s3_key = attachment_url.strip("/")
        
        logging.info(f"Extracted S3 key: {s3_key}")
        
        # Generate presigned URL for download (valid for 7 days = 604800 seconds)
        presigned_url = "Not available"
        if s3_key:
            presigned_url = generate_presigned_url(
                s3_client, 
                "get_object",
                {"Bucket": S3_BUCKET, "Key": s3_key}, 
                604800  # 7 days expiration
            )
            logging.info(f"Generated presigned URL: {presigned_url}")
  
        return {
            'statusCode': 200,
            'headers': CORS_HEADERS,
            'body': json.dumps({
                'message': 'Presigned URL generated successfully',
                'originalUrl': attachment_url,
                'presignedUrl': presigned_url,
                'expiresIn': '7 days'
            }),
        }
 
    except Exception as e:
        logging.error(f"Unexpected error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': CORS_HEADERS,
            'body': json.dumps({'error': f'Internal server error: {str(e)}'}),
        }