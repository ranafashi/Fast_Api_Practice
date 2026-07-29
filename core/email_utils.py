
import smtplib
from email.message import EmailMessage
from config import settings
from log.logs import logger


def send_order_email(order: dict, customer_email: str):
    msg = EmailMessage()
    msg["Subject"] = f"New Order Placed - {order['order_id']}"
    msg["From"] = settings.SMTP_USER
    msg["To"] = settings.NOTIFY_EMAIL

    lines = [
        f"A new order was placed by customer: {customer_email}",
        f"Order ID: {order['order_id']}",
        f"Total: {order['total']}",
        "",
        "Items:",
    ]
    for item in order["items"]:
        lines.append(f"  - {item['name']} x{item['quantity']} @ {item['price']}")
    msg.set_content("\n".join(lines))

    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)
        logger.info(f"Order email sent: order_id={order['order_id']}")
    except Exception as e:
        logger.error(f"Order email failed: order_id={order['order_id']} - {e}")
