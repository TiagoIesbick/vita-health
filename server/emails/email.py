import json
from smtplib import SMTP
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from os import getenv
from pathlib import Path


class SendEmail():
    def __init__(self):
        self.SMTP_SERVER = getenv('SMTP_SERVER')
        self.SMTP_PORT = getenv('SMTP_PORT')
        self.EMAIL_SENDER = getenv('EMAIL_SENDER')
        self.APP_PASSWORD = getenv('APP_PASSWORD')
        self.BASE_DIR = Path(__file__).parent


    def load_translations(self):
        translations_path = self.BASE_DIR / "templates" / "translations.json"
        with translations_path.open("r", encoding="utf-8") as file:
            return json.load(file)


    def load_email_template(self, template_name, placeholders):
        template_path = self.BASE_DIR / "templates" / template_name
        with template_path.open("r", encoding="utf-8") as file:
            html_content = file.read()

        for key, value in placeholders.items():
            html_content = html_content.replace(f"{{{{{key}}}}}", value)

        return html_content


    def get_localized_email_content(self, lang, user_name):
        translations = self.load_translations()
        lang_data = translations.get(lang, translations["en-us"])

        placeholders = {
            "name": user_name,
            "greeting": lang_data["greeting"].replace("{{name}}", user_name),
            "message": lang_data["message"],
            "signature": lang_data["signature"]
        }

        return placeholders


    def send_email_password_reset(self, lang, firstName, email):
        placeholders = self.get_localized_email_content(lang, firstName)
        email_content = self.load_email_template("passwordReset.html", placeholders)
        msg = MIMEMultipart()
        msg["From"] = self.EMAIL_SENDER
        msg["To"] = email
        msg["Subject"] = "Styled Email with Signature"

        # Attach HTML Content
        msg.attach(MIMEText(email_content, "html"))

        # Send Email
        try:
            server = SMTP(self.SMTP_SERVER, self.SMTP_PORT)
            server.starttls()
            server.login(self.EMAIL_SENDER, self.APP_PASSWORD)
            server.sendmail(self.EMAIL_SENDER, email, msg.as_string())
            server.quit()
            print("Email sent successfully!")
        except Exception as e:
            print("Error:", str(e))
        return email_content
