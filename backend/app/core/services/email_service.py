import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.core.config.settings import settings


def _build_message(to_email: str, subject: str, html_body: str) -> MIMEMultipart:
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"{settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL}>"
    msg["To"] = to_email
    msg.attach(MIMEText(html_body, "html"))
    return msg


def send_email(to_email: str, subject: str, html_body: str) -> None:
    """Send an email via SMTP. No-op when SMTP_HOST is not configured."""
    if not settings.SMTP_HOST:
        return

    msg = _build_message(to_email, subject, html_body)
    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
        server.starttls()
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.sendmail(settings.EMAILS_FROM_EMAIL, to_email, msg.as_string())


def send_welcome_email(to_email: str, name: str) -> None:
    """Send a welcome email to a newly registered user."""
    subject = f"Welcome to {settings.APP_NAME}!"
    html_body = f"""
    <h2>Hi {name}, welcome to {settings.APP_NAME}!</h2>
    <p>We're glad to have you on board. Your calm companion is always here.</p>
    """
    send_email(to_email, subject, html_body)


def send_password_reset_email(to_email: str, reset_token: str) -> None:
    """Send a password reset email."""
    subject = f"{settings.APP_NAME} — Password Reset"
    html_body = f"""
    <h2>Password Reset</h2>
    <p>Use the token below to reset your password. It expires in 30 minutes.</p>
    <code>{reset_token}</code>
    """
    send_email(to_email, subject, html_body)
