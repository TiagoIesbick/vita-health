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
        self.SERVER_ENV = getenv('SERVER_ENV')
        self.BASE_DIR = Path(__file__).parent


    def _load_translations(self) -> dict:
        translations_path = self.BASE_DIR / "templates" / "translations.json"
        with translations_path.open("r", encoding="utf-8") as file:
            return json.load(file)


    def _load_email_template(self, template_name: str, placeholders: dict) -> str:
        template_path = self.BASE_DIR / "templates" / template_name
        with template_path.open("r", encoding="utf-8") as file:
            html_content = file.read()

        for key, value in placeholders.items():
            html_content = html_content.replace(f"{{{{{key}}}}}", value)

        return html_content


    def _get_localized_email_content(self, lang: str, firstName: str, token: str) -> dict:
        translations = self._load_translations()
        lang_data = translations.get(lang, translations["en-us"])
        BASE_URL_CLIENT = (
            "https://vita-health.fr.to"
            if self.SERVER_ENV == "production"
            else "http://localhost:3000"
        )
        reset_link = f'{BASE_URL_CLIENT}/password-reset-confirm?token={token}'

        placeholders = {
            "button": lang_data['passwordReset']['button'],
            "name": firstName,
            "noMessage": lang_data['passwordReset']['noMessage'],
            "greeting": lang_data['greeting'].replace("{{name}}", firstName),
            "message": lang_data['passwordReset']['message'],
            "signature": lang_data['signature'],
            "reset_link": reset_link,
            "image_link": "https://vita-health.fr.to/static/media/logo-vita-no-bg.24089dd1c17004d30191.png"
        }

        return placeholders


    def send_email_password_reset(self, lang: str, firstName: str, email: str, token: str):
        placeholders = self._get_localized_email_content(lang, firstName, token)
        email_content = self._load_email_template("passwordResetEmail.html", placeholders)

        msg = MIMEMultipart()

        msg["From"] = self.EMAIL_SENDER
        msg["To"] = email
        msg["Subject"] = "Styled Email with Signature"

        msg.attach(MIMEText(email_content, "html"))

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
