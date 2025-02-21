import json
from smtplib import SMTP, SMTPException
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
        """
        Load and customize an email template with provided placeholders.

        This method reads an HTML email template file and replaces placeholder
        values with the provided content.

        Parameters:
        template_name (str): The name of the template file to be loaded.
        placeholders (dict): A dictionary of key-value pairs where keys are
                             placeholders in the template and values are the
                             content to replace them with.

        Returns:
        str: The customized HTML content of the email template with all
             placeholders replaced by their corresponding values.
        """
        template_path = self.BASE_DIR / "templates" / template_name
        with template_path.open("r", encoding="utf-8") as file:
            html_content = file.read()

        for key, value in placeholders.items():
            html_content = html_content.replace(f"{{{{{key}}}}}", value)

        return html_content


    def _get_localized_email_content(self, lang: str, firstName: str, token: str) -> dict:
        """
        Prepares localized content for a password reset email.

        This method loads translations, determines the appropriate base URL,
        and constructs a dictionary of placeholders for the email template.

        Parameters:
        lang (str): The language code for the email content (e.g., 'en-us', 'pt-br').
        firstName (str): The first name of the email recipient.
        token (str): The unique token for the password reset process.

        Returns:
        dict: A dictionary containing placeholders for the email template,
              including localized text, personalized greetings, and the reset link.
        """
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
            "signatureFooter": lang_data['signatureFooter'],
            "reset_link": reset_link,
            "image_link": "https://vita-health.fr.to/static/media/logo-vita-no-bg.24089dd1c17004d30191.png"
        }

        return placeholders


    def send_email_password_reset(self, lang: str, firstName: str, email: str, token: str) -> dict:
        """
        Sends a password reset email to the specified email address.

        Parameters:
        lang (str): The language code for the email content.
        firstName (str): The first name of the recipient.
        email (str): The email address to send the password reset email to.
        token (str): The unique token for password reset confirmation.

        Returns:
        dict: A dictionary containing the status of the password reset email.
              If the email is sent successfully, it returns {'resetConfirmation': 'requestResetConfirmation'}.
              If an error occurs during the email sending process, it returns {'resetError': 'requestResetError'}.
        """
        placeholders = self._get_localized_email_content(lang, firstName, token)
        email_content = self._load_email_template("passwordResetEmail.html", placeholders)

        msg = MIMEMultipart()

        msg["From"] = f'Vita <{self.EMAIL_SENDER}>'
        msg["To"] = email
        msg["Subject"] =  'Redefinir Senha' if lang == 'pt-br' else 'Reset Password'

        msg.attach(MIMEText(email_content, "html"))

        try:
            with SMTP(self.SMTP_SERVER, self.SMTP_PORT) as server:
                server.starttls()
                server.login(self.EMAIL_SENDER, self.APP_PASSWORD)
                server.sendmail(self.EMAIL_SENDER, email, msg.as_string())
            return {'resetConfirmation': 'requestResetConfirmation'}
        except SMTPException as e:
            print("Error:", str(e))
            return { 'resetError': 'requestResetError'}
