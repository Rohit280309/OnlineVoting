import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def sendEmail(voterEmail, msg, purpose):

    if purpose == "otp":
        # Email configuration
        sender_email = "kumbharrohit2803@gmail.com"
        receiver_email = voterEmail
        subject = "OTP"
        message = f"Your OTP for online voting is {msg}"

        # Create a MIMEText object for the email content
        msg = MIMEMultipart()
        msg['From'] = sender_email
        msg['To'] = receiver_email
        msg['Subject'] = subject
        msg.attach(MIMEText(message, 'plain'))

        # Connect to the SMTP server
        smtp_server = "smtp.gmail.com"
        smtp_port = 587
        smtp_username = "kumbharrohit2803@gmail.com"
        smtp_password = "oyfzianlmuptagsy"

        # Create an SMTP session
        try:
            server = smtplib.SMTP(smtp_server, smtp_port)
            server.starttls()
            server.login(smtp_username, smtp_password)
            
            # Send the email
            server.sendmail(sender_email, receiver_email, msg.as_string())
            return "OTP sent"
        except Exception as e:
            return ("Error sending email:", e)
        finally:
            # Close the SMTP session
            server.quit()
    
    elif purpose=="id":
        sender_email = "kumbharrohit2803@gmail.com"
        receiver_email = voterEmail
        subject = "User Id"
        message = f"Your Voter Id for online voting is {msg}"

        # Create a MIMEText object for the email content
        msg = MIMEMultipart()
        msg['From'] = sender_email
        msg['To'] = receiver_email
        msg['Subject'] = subject
        msg.attach(MIMEText(message, 'plain'))

        # Connect to the SMTP server
        smtp_server = "smtp.gmail.com"
        smtp_port = 587
        smtp_username = "kumbharrohit2803@gmail.com"
        smtp_password = "oyfzianlmuptagsy"

        # Create an SMTP session
        try:
            server = smtplib.SMTP(smtp_server, smtp_port)
            server.starttls()
            server.login(smtp_username, smtp_password)
            
            # Send the email
            server.sendmail(sender_email, receiver_email, msg.as_string())
            return "Id sent"
        except Exception as e:
            return ("Error sending email:", e)
        finally:
            # Close the SMTP session
            server.quit()
    
    elif purpose=="link":
        sender_email = "kumbharrohit2803@gmail.com"
        receiver_email = voterEmail
        subject = "Verification Link"
        message = f"Your Verification link is {msg}"

        # Create a MIMEText object for the email content
        msg = MIMEMultipart()
        msg['From'] = sender_email
        msg['To'] = receiver_email
        msg['Subject'] = subject
        msg.attach(MIMEText(message, 'plain'))

        # Connect to the SMTP server
        smtp_server = "smtp.gmail.com"
        smtp_port = 587
        smtp_username = "kumbharrohit2803@gmail.com"
        smtp_password = "oyfzianlmuptagsy"

        # Create an SMTP session
        try:
            server = smtplib.SMTP(smtp_server, smtp_port)
            server.starttls()
            server.login(smtp_username, smtp_password)
            
            # Send the email
            server.sendmail(sender_email, receiver_email, msg.as_string())
            return "Link sent"
        except Exception as e:
            return ("Error sending email:", e)
        finally:
            # Close the SMTP session
            server.quit()