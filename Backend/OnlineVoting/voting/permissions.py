import jwt
from django.conf import settings
from rest_framework.exceptions import AuthenticationFailed

def get_user_role(request):
    auth_header = request.META.get('HTTP_AUTHORIZATION', '')
    if auth_header:
        try:

            decoded_payload = jwt.decode(auth_header, settings.SIMPLE_JWT["SIGNING_KEY"], algorithms=['HS256'])
            role = decoded_payload['role']
            
            return role

        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed("Token has expired.")
        except jwt.InvalidTokenError:
            raise AuthenticationFailed("Token verification failed.")
        except (KeyError, IndexError) as e:
            raise AuthenticationFailed("Role not found in the token payload.")
    else:
        raise AuthenticationFailed("Authorization header not found.")

    
