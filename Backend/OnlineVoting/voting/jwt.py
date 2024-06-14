import jwt
from datetime import timedelta
from django.utils import timezone
from django.conf import settings

SECRET_KEY = settings.SIMPLE_JWT['SIGNING_KEY'] 

def create_jwt_token(user_id, role):
    payload = {
        'user_id': user_id,
        'exp': timezone.now() + timedelta(days=1),
        'role': role
    }
    return jwt.encode(payload, SECRET_KEY, algorithm='HS256')

def decode_jwt_token(token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        # Handle expired token
        return 'Signature has expired.'
    except jwt.InvalidTokenError:
        # Handle invalid token
        return 'Invalid token.'
