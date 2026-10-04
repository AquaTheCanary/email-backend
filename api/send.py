from http.server import BaseHTTPRequestHandler
import json
import os
import random
import smtplib
from email.message import EmailMessage

class handler(BaseHTTPRequestHandler):

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps({"status": "Backend API is running!"}).encode('utf-8'))

    def do_POST(self):
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
        except Exception:
            data = {}

        user_email = data.get('email')
        
        if not user_email or '@' not in user_email:
            res_body = json.dumps({"success": False, "error": "Invalid email address."}).encode('utf-8')
        else:
            app_password = os.environ.get("GMAIL_APP_PASSWORD")
            if not app_password:
                res_body = json.dumps({"success": False, "error": "Server error: Missing GMAIL_APP_PASSWORD in Vercel environment variables."}).encode('utf-8')
            else:
                verification_code = str(random.randint(100000, 999999))
                sender_email = "aquathecanary@gmail.com"

                msg = EmailMessage()
                msg['Subject'] = 'Your Setup Verification Code'
                msg['From'] = sender_email
                msg['To'] = user_email
                msg.set_content(
                    f"Hello,\n\n"
                    f"Welcome to the platform!\n\n"
                    f"To verify your email, please enter the code below:\n{verification_code}\n\n"
                    f"Thank you for registering!\n\n"
                    f"Kind regards,\nArchie Sneddon"
                )

                try:
                    with smtplib.SMTP_SSL('smtp.gmail.com', 465) as smtp:
                        smtp.login(sender_email, app_password)
                        smtp.send_message(msg)
                    
                    res_body = json.dumps({
                        "success": True,
                        "message": "Email sent successfully!",
                        "code": verification_code
                    }).encode('utf-8')
                except Exception as e:
                    res_body = json.dumps({"success": False, "error": f"SMTP Error: {str(e)}"}).encode('utf-8')

        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        self.wfile.write(res_body)
