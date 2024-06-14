from .jwt import decode_jwt_token
from .models import *
from rest_framework.exceptions import AuthenticationFailed
import jwt

def authenticate(request):
    token = request.META.get('HTTP_AUTHORIZATION', '')
    payload = decode_jwt_token(token)

    if isinstance(payload, dict):
        try:
            if payload['role'] == "admin":
                user = payload['user']
                userObj = Administrator.objects.get(email=user)
                if userObj:
                    return userObj
                else:
                    return "Authentication Failed"
            else:
                user = payload['user']
                userObj = Voters.objects.get(voterId=user)
                if userObj:
                    return userObj
                else:
                    return "Authentication Failed"
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed("Token has expired.")
        except jwt.InvalidTokenError:
            raise AuthenticationFailed("Token verification failed.")
        except (KeyError, IndexError) as e:
            raise AuthenticationFailed("Role not found in the token payload.")
    else:
        raise AuthenticationFailed("Authorization header not found.")   
       