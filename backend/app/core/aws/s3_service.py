import boto3
from botocore.exceptions import ClientError

from app.core.config.settings import settings


def _get_client():
    return boto3.client(
        "s3",
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_REGION,
    )


def upload_file(file_bytes: bytes, key: str, content_type: str = "application/octet-stream") -> str:
    """
    Upload bytes to S3 and return the public URL.

    Args:
        file_bytes: Raw file content.
        key: S3 object key (e.g. "avatars/user_123.jpg").
        content_type: MIME type of the file.

    Returns:
        Public URL of the uploaded object.
    """
    client = _get_client()
    client.put_object(
        Bucket=settings.AWS_S3_BUCKET,
        Key=key,
        Body=file_bytes,
        ContentType=content_type,
    )
    return f"https://{settings.AWS_S3_BUCKET}.s3.{settings.AWS_REGION}.amazonaws.com/{key}"


def delete_file(key: str) -> None:
    """Delete an object from S3 by key."""
    client = _get_client()
    client.delete_object(Bucket=settings.AWS_S3_BUCKET, Key=key)


def generate_presigned_url(key: str, expires_in: int = 3600) -> str:
    """
    Generate a pre-signed URL for temporary read access.

    Args:
        key: S3 object key.
        expires_in: Expiry in seconds (default 1 hour).

    Returns:
        Pre-signed URL string.
    """
    client = _get_client()
    try:
        return client.generate_presigned_url(
            "get_object",
            Params={"Bucket": settings.AWS_S3_BUCKET, "Key": key},
            ExpiresIn=expires_in,
        )
    except ClientError as exc:
        raise RuntimeError(f"Could not generate pre-signed URL: {exc}") from exc
