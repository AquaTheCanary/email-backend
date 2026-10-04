import os
import random
import smtplib
from email.message import EmailMessage
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

SENDER_EMAIL = "aquathecanary@gmail.com"

@app.route('/api/send', methods=['GET', 'POST', 'OPTIONS'])
@app.route('/', methods=['GET', 'POST', 'OPTIONS'])
def send_email():
    if request.method == 'OPTIONS':
        return jsonify({"status": "ok"}), 200

    if request.method == 'GET':
        return jsonify({"status": "Vercel Python Backend is running."}), 200

    data = request.json or {}
    user_email = data.get('email')
    
    if not user_email or '@' not in user_email:
        return jsonify({"success": False, "error": "Invalid email address."}), 400

    app_password = os.environ.get("GMAIL_APP_PASSWORD")
    if not app_password:
        return jsonify({"success": False, "error": "Server configuration error: Missing GMAIL_APP_PASSWORD in Vercel environment variables."}), 500

    verification_code = str(random.randint(100000, 999999))

    msg = EmailMessage()
    msg['Subject'] = 'Your Setup Verification Code'
    msg['From'] = SENDER_EMAIL
    msg['To'] = user_email
    msg.set_content(
        f"Hello,\n\n"
        f"Welcome to the platform!\n\n"
        f"To verify your email, please enter the code below:\n{verification_code}\n\n"
        f"Thank you for registering and enjoy the platform!\n\n\n"
        f"Kind regards,\nArchie Sneddon"
    )

    try:
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp:
            smtp.login(SENDER_EMAIL, app_password)
            smtp.send_message(msg)
        
        return jsonify({
            "success": True,
            "message": "Email sent successfully!",
            "code": verification_code
        })
    except Exception as e:
        return jsonify({"success": False, "error": f"SMTP Error: {str(e)}"}), 500
