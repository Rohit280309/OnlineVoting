import base64
from django.shortcuts import get_object_or_404, redirect
from . models import *
from . serializer import *
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import generics, mixins
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import status
from PIL import Image
import cv2
from cv2 import cvtColor, COLOR_BGR2RGB
from face_recognition import *
import numpy as np
import random
from .send_Email import sendEmail
from django.contrib.auth.hashers import check_password
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
import string
from django.core.files.base import ContentFile
from .permissions import *
from .jwt import *
from .authentication import authenticate


voterId = ""

class CustomRefreshToken(RefreshToken):
    def set_custom_claim(self, claim_name, claim_value):
        self.payload[claim_name] = claim_value
      

class Homeview(APIView):
    def post(self, request):
        try:
            queryDict = request.data
            vtrId = queryDict['voterId']
            voter = Voters.objects.get(voterId=vtrId)
            global voterId
            voterId = vtrId
            if voter:
                return Response("Voter Found",status=status.HTTP_200_OK)
            
        except Voters.DoesNotExist:
            return Response("Voter Not Found",status=status.HTTP_200_OK)

##############   View for handling face recognition #######################
class ImageView(APIView):

    parser_classes = (MultiPartParser, FormParser)

    def get_voter_details(self, voter_id):
        try:
            voter = Voters.objects.get(voterId=voter_id)
            voter_image = voter.voterImage

            # Do whatever you want with the retrieved details
            return voter_image
        except Voters.DoesNotExist:
            # Handle the case when voterId does not exist in the database
            return Response("Voter Does not Exist",status=status.HTTP_404_NOT_FOUND)

    def compare(self, oldImg, newImg):

        try:
            oldImage = Image.open(oldImg)
            oldImgMat = np.array(oldImage)
            rgb_img = cvtColor(oldImgMat, COLOR_BGR2RGB)
            img_encoding = face_encodings(rgb_img)[0]

            if len(img_encoding) == 0:
                print("Error: No face detected in the old image.")
                return

            newImageArray = np.frombuffer(newImg, dtype=np.uint8)

            # Check if the newImageArray is not empty
            if newImageArray.size == 0:
                print("Error: The image data is empty.")
                return

            newImageMat = cv2.imdecode(newImageArray, cv2.IMREAD_COLOR)

            # Check if the decoding was successful and newImageMat is not None
            if newImageMat is None:
                print("Error: Unable to decode the image.")
                return

            rgb_img2 = cv2.cvtColor(newImageMat, cv2.COLOR_BGR2RGB)
            img_encoding2 = face_encodings(rgb_img2)[0]

            if len(img_encoding2) == 0:
                print("Error: No face detected in the new image.")
                return

            result = compare_faces([img_encoding], img_encoding2, tolerance=0.6)
            
            if result[0]==False:
                output = {"Status" : "Image Not Matched"}
                return output
            elif result[0]==True:
                output = {"Status" : "Image Matched"}
                return output
        
        except Exception as e:
            print(f"An error occurred: {e}")
        return None  

    def post(self, request, *args, **kwargs):
        try:
            authUser = authenticate(request)
            if authUser:
                if 'image' in request.FILES:
                    uploadedImage = request.FILES["image"].read()
                    
                    voterImage = authUser.voterImage
                    output = self.compare(voterImage.path, uploadedImage)
                    return Response(output,status=status.HTTP_200_OK)
                else:
                    return Response({"Status": "Image not found"},status=status.HTTP_404_NOT_FOUND)
            else:
                return Response({"Status":"Token not valid"}, status=status.HTTP_400_BAD_REQUEST)
    
        except Exception as e:
            return Response({"error": str(e)},status=status.HTTP_200_OK)

class GetUser(APIView):
    def get(self, request):
        authUser = authenticate(request)
        if authUser:
            role = get_user_role(request)
            if role == "admin":
                with authUser.image.open('rb') as image_file:
                    image_data = image_file.read()     
                
                image_base64 = base64.b64encode(image_data).decode('utf-8')

                details = {
                    "name": authUser.name,
                    "role": "Administrator",
                    "image": image_base64
                }

                return Response(details, status=status.HTTP_200_OK)
            elif role == "voter":
                with authUser.voterImage.open('rb') as image_file:
                    image_data = image_file.read()     
                
                image_base64 = base64.b64encode(image_data).decode('utf-8')

                details = {
                    "name": authUser.voterName,
                    "role": "voter",
                    "image": image_base64
                }

                return Response(details, status=status.HTTP_200_OK)
        else:
            return Response({"message":"Token not valid"}, status=status.HTTP_400_BAD_REQUEST)
        

############################################## Create / Get Elections ############################################
class ElectionDetails(APIView):

    def get(self, request):
        authUser = authenticate(request)
        if authUser:
            role = get_user_role(request)
            if role == "voter":
                try:
                    # voterId = request.data.get("voterId")
                    # voter = Voters.objects.get(voterId=voterId)
                    elections = authUser.eligible_voters.all()
                    output =[]
                    for election in elections:
                        with election.image.open('rb') as image_file:
                            image_data = image_file.read()
                                
                        image_base64 = base64.b64encode(image_data).decode('utf-8')
                        electionDetails = {
                            "electionId": election.electionId,
                            "Title": election.title,
                            "StartDate": election.startDate,
                            "EndDate": election.endDate,
                            "admin": str(election.admin),
                            "image": image_base64
                        }
                        output.append(electionDetails)
                    # output = [{"Title": election.title} for election in elections]
                    return Response(output,status=status.HTTP_200_OK)
                except Election.DoesNotExist:
                    # Handle the case when voterId does not exist in the database
                    return Response("No Elections",status=status.HTTP_404_NOT_FOUND)
            else:
                return Response({"message":"Please login as Voter"}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({"message":"Token not valid"}, status=status.HTTP_400_BAD_REQUEST)

#################   View to create a Election  ###################
class CreateElection(APIView):
    def get(self, request):

        authUser = authenticate(request)
        if authUser:
            role = get_user_role(request)
            if role == "admin":
                try:
                    candidates = Candidates.objects.filter(admin=authUser)
                    serializer = CandidatesSerializer(candidates, many=True)

                    return Response(serializer.data)
                except Candidates.DoesNotExist:
                    return Response("No Candidates",status=status.HTTP_404_NOT_FOUND)
            else:
                return Response({"message":"Please login as Admin"}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({"message":"Token not valid"}, status=status.HTTP_400_BAD_REQUEST)

    def get_id(self):
        id = ''.join(random.choices(string.digits, k=10))
        return id

    def post(self, request):

        authUser = authenticate(request)
        if authUser:
            role = get_user_role(request)
            if role == "admin":
                queryDict = request.data
                data = request.data
                
                id = self.get_id()

                while Election.objects.filter(electionId=id).exists():
                    id = self.get_id()

                data["admin"] = authUser.pk
                image_data = queryDict.get("image")
                format, imgstr = image_data.split(';base64,') 
                ext = format.split('/')[-1]
                image_data = ContentFile(base64.b64decode(imgstr), name=f"election_{id}.{ext}")
                data["image"] = image_data

                data["electionId"] = id
                serializer = ElectionSerializer(data=data)

                if serializer.is_valid(raise_exception=True):
                    serializer.save()

                return Response({"message": "Election created"}, status=status.HTTP_200_OK)
            else:
                return Response({"message": "Please Login as Admin"}, status=status.HTTP_401_UNAUTHORIZED)
            
class EditElection(generics.RetrieveUpdateAPIView):
    queryset = Election.objects.all()
    serializer_class = ElectionSerializer
    def put(self, request, *args, **kwargs):
        authUser = authenticate(request)
        if authUser:
            role = get_user_role(request)
            if role == "admin":
               
                instance = self.get_object()

                # Validate and update specific fields with the request data
                serializer = self.get_serializer(instance, data=request.data, partial=True)
                serializer.is_valid(raise_exception=True)
                serializer.save()
                return Response({"message": "Election updated"}, status=status.HTTP_200_OK)
            else:
                return Response({"message": "Please Login as Admin"}, status=status.HTTP_401_UNAUTHORIZED)

class DeleteElection(mixins.DestroyModelMixin, generics.GenericAPIView):

    queryset = Election.objects.all()
    serializer_class = ElectionDelete
    def delete(self, request, *args, **kwargs):
        authUser = authenticate(request)
        if authUser:
            role = get_user_role(request)
            if role == "admin":
                self.destroy(request, *args, **kwargs)
                return Response({"message": "Eleciton deleted successfully."}, status=status.HTTP_200_OK)
            else:
                return Response({"message": "Please Login as Admin"}, status=status.HTTP_401_UNAUTHORIZED)
        else:
            return Response({"message": "Please Login as Admin"}, status=status.HTTP_401_UNAUTHORIZED)

class AddVoter(APIView):
    def post(self, request):
        authUser = authenticate(request)
        if authUser:
            try:
                electionId = request.data.get("electionId")
                password = request.data.get("password")
                print(electionId)
                election = Election.objects.get(electionId=electionId)

                if check_password(password, election.password):
                    election.voters.add(authUser)
                    return Response({"message": "Voter Added"}, status=status.HTTP_200_OK)
                else:
                    return Response({"message": "Incorrect Password"}, status=status.HTTP_401_UNAUTHORIZED)
            except Election.DoesNotExist:
                return Response({"message": "Election does not exist"}, status=status.HTTP_404_NOT_FOUND)

class GetElectionCount(APIView):
    def get(self, request):
        authUser = authenticate(request)
        if authUser:
            role = get_user_role(request)
            if role == "admin":
                elections = Election.objects.filter(admin=authUser)
                print(elections)
                count = 0
                for _ in elections:
                    count += 1
                return Response({"message": count}, status=status.HTTP_200_OK)
            else:
                return Response({"message": "Please login as admin"}, status=status.HTTP_401_UNAUTHORIZED)
        else:
            return Response({"message": "Please login"}, status=status.HTTP_401_UNAUTHORIZED)        

##################### View to calculate votes ######################
class CalculateVotes(APIView):
    def post(self, request):
        authUser = authenticate(request)
        if authUser:
            electionId = request.data.get("electionId")
            election = Election.objects.get(electionId=electionId)
            votes = Vote.objects.filter(election=election)
            candidates = election.candidates.all()
            results = {}
            for candidate in candidates:
                results[candidate.name] = 0
            for vote in votes:
                candidate = vote.candidate.name
                results[candidate] = results.get(candidate, 0) + 1

            return Response({"message": results}, status=status.HTTP_200_OK)
        else:
            return Response({"message": "Please login with valid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

class AdminElectionsVote(APIView):
    def get(self, request):
        authUser = authenticate(request)
        if authUser:
            role = get_user_role(request)
            if role == "admin":
                elections = Election.objects.filter(admin=authUser)
                finalOutput = {}
                output = []
                electionsName = []
                electionsIds = []
                for election in elections:
                    votes = Vote.objects.filter(election=election)
                    candidates = election.candidates.all()
                    results = {}
                    electionsName.append(election.title)
                    electionsIds.append(election.electionId)
                    for candidate in candidates:
                        results[candidate.name] = 0
                    
                    for vote in votes:
                        candidate = vote.candidate.name
                        results[candidate] = results.get(candidate, 0) + 1
                    
                    # output.append(electionsName)
                    output.append(results)

                finalOutput["results"] = output
                finalOutput["electionnames"] = electionsName
                finalOutput["electionids"] = electionsIds
                    
                return Response({"message": finalOutput}, status=status.HTTP_200_OK)
            else:
                return Response({"message": "Please login as admin"}, status=status.HTTP_401_UNAUTHORIZED)
        else:
            return Response({"message": "Please login as admin"}, status=status.HTTP_401_UNAUTHORIZED)

class GetAllVotes(APIView):
    def get(self, request):
        authUser = authenticate(request)
        if authUser:
            role = get_user_role(request)
            if role == "admin":
                votes = Vote.objects.all()
                output = []
                for vote in votes:
                    if vote.election.admin == authUser:
                        voteInfo = {
                            "Id": vote.pk,
                            "Election": vote.election.title,
                            "Candidate": vote.candidate.name,
                            "Timestamp": vote.timestamp
                        }
                        output.append(voteInfo)

                return Response({"message": output}, status=status.HTTP_200_OK)
            else:
                return Response({"message": "Please login as admin"}, status=status.HTTP_401_UNAUTHORIZED)
        else:
            return Response({"message": "Please login"}, status=status.HTTP_401_UNAUTHORIZED)

################################################# OTP views ######################################################

class GenerateVoterOtp(APIView):
    def post(self, request):
        voterId = request.data.get("voterId")   
        voter = Voters.objects.get(voterId = voterId)
        voterProfile, created = VoterOTP.objects.get_or_create(voter=voter)
        voterEmail = voter.voterEmail
        if not created:
            if voterProfile.otp_expires_at < timezone.now():
                voterProfile.otp = str(random.randint(100000, 999999))
                voterProfile.otp_created_at = timezone.now()
                voterProfile.otp_expires_at = timezone.now() + timedelta(minutes=2)
                voterProfile.save()
                emailstatus = sendEmail(voterEmail, voterProfile.otp, "otp")
                return Response(emailstatus, status=status.HTTP_200_OK)
            return Response({'message': 'Previous OTP is still valid'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'message': 'User does not exist'}, status=status.HTTP_404_NOT_FOUND)

class GenerateAdminOtp(APIView):
    def post(self, request):
        adminEmail = request.data.get("adminId")
        admin = Administrator.objects.get(email=adminEmail)
        adminProfile, created = AdminOTP.objects.get_or_create(administrator=admin)
        if not created:
            if adminProfile.otp_expires_at < timezone.now():
                adminProfile.otp = str(random.randint(100000, 999999))
                adminProfile.otp_created_at = timezone.now()
                adminProfile.otp_expires_at = timezone.now() + timedelta(minutes=2)
                adminProfile.save()
                emailstatus = sendEmail(adminEmail, adminProfile.otp, "otp")
                return Response(emailstatus, status=status.HTTP_200_OK)
            return Response({'message': 'Previous OTP is still valid'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'message': 'User does not exist'}, status=status.HTTP_404_NOT_FOUND)
    
class VerifyVoterOtp(APIView):
    def post(self, request):
        voterId = request.data.get("voterId")
        enteredOtp = request.data.get("otp")
        voterid = Voters.objects.get(voterId=voterId)
        try:
            voterOtp = VoterOTP.objects.get(voter=voterid, otp=enteredOtp)
            if voterOtp.otp_expires_at >= timezone.now():
                    refresh = CustomRefreshToken.for_user(voterid)
                    refresh.set_custom_claim('role', 'voter')
                    refresh.set_custom_claim('user', voterId)
                    
                    token = str(refresh.access_token)
                    
                    return Response({"access": token, "refresh":str(refresh)}, status=status.HTTP_200_OK)
            return Response({'message': 'User OTP has expired'}, status=status.HTTP_400_BAD_REQUEST)
        except VoterOTP.DoesNotExist:
            return Response({'message': 'Invalid User OTP'}, status=status.HTTP_400_BAD_REQUEST)

class VerifyAdminOtp(APIView):
    def post(self, request):
        adminEmail = request.data.get("adminId")
        enteredOtp = request.data.get("otp")
        adminId = Administrator.objects.get(email=adminEmail)
        try:
            adminOtp = AdminOTP.objects.get(administrator=adminId, otp=enteredOtp)
            if adminOtp.otp_expires_at >= timezone.now():
                    refresh = CustomRefreshToken.for_user(adminId)
                    refresh.set_custom_claim('role', 'admin')
                    refresh.set_custom_claim('user', adminEmail)
                    # refresh = RefreshToken.for_user(adminId)
                    token = str(refresh.access_token)
                    # token = create_jwt_token(adminId.pk, 'admin')
                    return Response({"access": token, "refresh": str(refresh)}, status=status.HTTP_200_OK)
            return Response({'message': 'User OTP has expired'}, status=status.HTTP_400_BAD_REQUEST)
        except AdminOTP.DoesNotExist:
            return Response({'message': 'Invalid User OTP'}, status=status.HTTP_400_BAD_REQUEST)

############################################# Voting view ########################################################

###################  View to add votes  #############################
class Voteview(APIView):
    def post(self, request):
        authUser = authenticate(request)
        if authUser:
            role = get_user_role(request)
            if role == "voter":
                try:
                    candidate_id = request.data.get("candidateId")
                    election_id = request.data.get("electionId")
                    candidate = Candidates.objects.get(pk=candidate_id)
                    election = Election.objects.get(electionId=election_id)
                    isVoted = election.votedVoter.filter(pk=authUser.pk)
                    print(isVoted)
                    if not isVoted:
                        election.votedVoter.add(authUser)
                        Vote.objects.create(candidate=candidate, election=election)
                        return Response({"message": "Vote recorded successfully"}, status=status.HTTP_201_CREATED)
                    else:
                        return Response({"message": "Already Voted"}, status=status.HTTP_200_OK)
                except Candidates.DoesNotExist:
                    return Response({"message": "Candidate does not exist"}, status=status.HTTP_404_NOT_FOUND)
                except Election.DoesNotExist:
                    return Response({"message": "Election does not exist"}, status=status.HTTP_404_NOT_FOUND)
                except AttributeError as e:
                    return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)
                except Exception as e:
                    return Response({"message": e}, status=status.HTTP_400_BAD_REQUEST)

class CheckVoted(APIView):
    def post(self, request):
        authUser = authenticate(request)
        if authUser:
            role = get_user_role(request)
            if role == "voter":
                try:
                    election_id = request.data.get("electionId")
                    election = Election.objects.get(electionId=election_id)
                    isVoted = election.votedVoter.filter(pk=authUser.pk)
                    if isVoted:
                        return Response({"message": "Voted"}, status=status.HTTP_200_OK)
                    else:
                        return Response({"message": "Not Voted"}, status=status.HTTP_200_OK)
                except Election.DoesNotExist:
                    return Response({"message": "Election does not exist"}, status=status.HTTP_404_NOT_FOUND)
                except AttributeError as e:
                    return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)
                except Exception as e:
                    return Response({"message": e}, status=status.HTTP_400_BAD_REQUEST)
                

############################################ Administrator Views's ##############################################
class CreateAdmin(APIView):
    def post(self, request):
        data = request.data
        image_data = data["image"]
        imgName = data["name"]
        format, imgstr = image_data.split(';base64,') 
        ext = format.split('/')[-1]
        image_data = ContentFile(base64.b64decode(imgstr), name=f"{imgName}.{ext}")
        data["image"] = image_data
        serializer = AdminSerializer(data=data)

        if serializer.is_valid(raise_exception=True):
            serializer.save()
            email = request.data["email"]
            admin = Administrator.objects.get(email=email)
            refresh = CustomRefreshToken.for_user(admin)
            refresh.set_custom_claim('user', email)
            token = str(refresh.access_token)
            verificationLink = f"http://localhost:8000/api/createadmin?token={token}"

            emailstatus = sendEmail(email, verificationLink, "link")
            
            if emailstatus == "Link sent":
                return Response({"message":"Link sent"}, status=status.HTTP_201_CREATED)
            else:
                return Response({"message":"Error sending otp"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        else:
            return Response({"message":"Email Already exist"}, status=status.HTTP_400_BAD_REQUEST)
        
    def get(self, request):
        try:
            token = request.GET.get('token', None)
            payload = jwt.decode(token, settings.SIMPLE_JWT["SIGNING_KEY"], algorithms=['HS256'])
            if isinstance(payload, dict):
                user = payload["user"]
                admin = Administrator.objects.get(email=user)
                admin.verified = True
                admin.save()

                adminOtp = AdminOTP.objects.create(administrator=admin)
                adminOtp.save()
                return redirect("http://localhost:3000")
        except jwt.ExpiredSignatureError:
    
            return Response({"message": "Token Expired"}, status=status.HTTP_400_BAD_REQUEST)
        except jwt.InvalidTokenError:
            
            return Response({"message": "Token Invalid"}, status=status.HTTP_400_BAD_REQUEST)
        
class LoginAdmin(APIView):
    def post(self, request):
        serializer = AdminLoginSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']

            try:
                admin = Administrator.objects.get(email=email)
                if check_password(password, admin.password):
                    return Response({"message": "Login Successful"}, status=status.HTTP_200_OK)
                else:
                    return Response({"message": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
            except Administrator.DoesNotExist:
                return Response({"message": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
            
class AdminElections(APIView):
    def get(self, request):
        authUser = authenticate(request)
        if authUser:
            role = get_user_role(request)
            if role == "admin":
                try:
                    elections = Election.objects.filter(admin=authUser)
                    
                    output =[]
                    for election in elections:
                        voters = list(election.voters.values('id', 'voterId'))
                        candidates = list(election.candidates.values('id', 'name', 'party'))
                        with election.image.open('rb') as image_file:
                            image_data = image_file.read()
                                
                        image_base64 = base64.b64encode(image_data).decode('utf-8')
                        electionDetails = {
                            "Title": election.title,
                            "StartDate": election.startDate,
                            "EndDate": election.endDate,
                            "admin": str(election.admin),
                            "electionId": election.electionId,
                            "id": election.pk,
                            "voters": voters,
                            "candidates": candidates,
                            "image": image_base64
                        }
                        output.append(electionDetails)

                    return Response(output,status=status.HTTP_200_OK)
                except Election.DoesNotExist:
                    # Handle the case when voterId does not exist in the database
                    return Response("No Elections",status=status.HTTP_404_NOT_FOUND)
            else:
                return Response({"message":"Please login as Voter"}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({"message":"Token not valid"}, status=status.HTTP_400_BAD_REQUEST)

############################################# Create / Login Voter ##############################################

class CreateVoter(APIView):
    def getNewId(self):
        random_letters = ''.join(random.choices(string.ascii_uppercase, k=3))
        random_digits = ''.join(random.choices(string.digits, k=7))
        random_string = random_letters + random_digits
        return random_string
    
    def post(self, request):

        if "signup" in request.data:
            data = request.data
            id = self.getNewId()
            
            while Voters.objects.filter(voterId=id).exists():
                id = self.getNewId()

            data["voterId"] = id
            
            image_data = data["voterImage"]
            format, imgstr = image_data.split(';base64,') 
            ext = format.split('/')[-1]
            image_data = ContentFile(base64.b64decode(imgstr), name=f"voter_{id}.{ext}")
            data["voterImage"] = image_data
            voterEmail = data["voterEmail"]
            data["verified"] = False
            serializer = VoterSerializer(data=data)

            if serializer.is_valid(raise_exception=True):
                serializer.save()
                voterid = Voters.objects.get(voterId=id)
                refresh = CustomRefreshToken.for_user(voterid)
                refresh.set_custom_claim('user', id)
                token = str(refresh.access_token)
                verificationLink = f"http://localhost:8000/api/createvoter?token={token}"

                emailstatus = sendEmail(voterEmail, verificationLink, "link")
                
                if emailstatus == "Link sent":
                    return Response({"message":"Otp sent"}, status=status.HTTP_201_CREATED)
                else:
                    return Response({"message":"Error sending otp"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR) 
            else:
                return Response({"message":"Email Already exist"}, status=status.HTTP_400_BAD_REQUEST)
    

    def get(self, request):
        try:
            token = request.GET.get('token', None)
            payload = jwt.decode(token, settings.SIMPLE_JWT["SIGNING_KEY"], algorithms=['HS256'])
            if isinstance(payload, dict):
                user = payload["user"]
                
                voter = Voters.objects.get(voterId=user)
                
                voter.verified = True
                voter.save()

                voterOtp = VoterOTP.objects.create(voter=voter)
                voterOtp.save()
                emailstatus = sendEmail(voter.voterEmail, voter.voterId, "id")
                
                if emailstatus == "Id sent":
                    return redirect("http://localhost:3000")
                else:
                    return Response({"message":"Error sending otp"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except jwt.ExpiredSignatureError:
    
            return Response({"message": "Token Expired"}, status=status.HTTP_400_BAD_REQUEST)
        except jwt.InvalidTokenError:
            
            return Response({"message": "Token Invalid"}, status=status.HTTP_400_BAD_REQUEST)
        
class LoginVoter(APIView):
    def post(self, request):
        serializer = VoterLoginSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            id = serializer.validated_data['id']
            password = serializer.validated_data['password']

            try:
                voter = Voters.objects.get(voterId=id)
                if check_password(password, voter.voterPassword):
                    if(voter.verified):
                        return Response({"message": "Login Successful"}, status=status.HTTP_200_OK)
                    else:
                        return Response({"message": "Your E-Mail is not Verified"}, status=status.HTTP_401_UNAUTHORIZED)
                else:
                    return Response({"message": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
            except Voters.DoesNotExist:
                return Response({"message": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
            
############################################ Candidates View's ####################################################

class AddCandidates(APIView):
    
    def post(self, request):
        authUser = authenticate(request)
        if authUser:
            role = get_user_role(request)
            if role == "admin":
                data = request.data
                name = data['name']
                image_data = data['sign']   
                format, imgstr = image_data.split(';base64,') 
                ext = format.split('/')[-1]
                image_data = ContentFile(base64.b64decode(imgstr), name=f"candidate_{name}.{ext}")
                data["sign"] = image_data
                data["admin"] = authUser.pk
                serializer = CandidatesSerializer(data=data)

                if serializer.is_valid(raise_exception=True):
                    serializer.save()
                    return Response({"message":"Candidate Added"}, status=status.HTTP_201_CREATED)
                else:
                    return Response({"message":"Internal Server Error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            else:
                return Response({"message":"Please login as Admin"}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({"message":"Token not valid"}, status=status.HTTP_400_BAD_REQUEST)

class Getcandidates(APIView):

    def get(self, request):
        authUser = authenticate(request)
        if authUser:
            role = get_user_role(request)
            if role == "admin":
                candidates = Candidates.objects.filter(admin=authUser)
                count = 0
                for _ in candidates:
                    count += 1
                
                return Response({"message": count}, status=status.HTTP_200_OK)
            else:
                return Response({"message": "Please login as Admin"}, status=status.HTTP_401_UNAUTHORIZED)
        else:
            return Response({"message": "Please login"}, status=status.HTTP_400_BAD_REQUEST)

    def post(self, request):
        authUser = authenticate(request)
        if authUser:
            role = get_user_role(request)
            if role == "voter":
                try:
                    queryDict = request.data
                    electionId = queryDict.get("electionId")
                    title = queryDict.get("title")
                    adminEmail = queryDict.get("admin")
                    admin = Administrator.objects.get(email=adminEmail)
                    elections = Election.objects.filter(electionId=electionId, title=title, admin=admin)
                    if elections:
                        for election in elections:
                            if authUser in election.voters.all():
                                candidates = election.candidates.all()
                            # candidates = Candidates.objects.filter(election=title)
                            output = []
                            for candidate in candidates:
                                newCandidate = Candidates.objects.get(pk=candidate.pk)
                                with newCandidate.sign.open('rb') as image_file:
                                    image_data = image_file.read()
                                
                                # Convert the image data to base64
                                image_base64 = base64.b64encode(image_data).decode('utf-8')

                                candidateDetails = {
                                    "candidateId": newCandidate.pk,
                                    "Name": newCandidate.name,
                                    "Party": newCandidate.party,
                                    "Sign": image_base64
                                }
                                output.append(candidateDetails)
                            return Response(output, status=status.HTTP_200_OK)
                except Exception as e:
                    return Response(str(e), status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            else:
                return Response({"message":"Please login as Voter"}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({"message":"Token not valid"}, status=status.HTTP_400_BAD_REQUEST)

class GetCandaditeDetails(APIView):
    def get(self, request):
        try:
            authUser = authenticate(request)
            if authUser:
                role = get_user_role(request)
                if role == "admin":
                    candidates = Candidates.objects.filter(admin=authUser)
                    if candidates:
                        output = []
                        for candidate in candidates:
                            with candidate.sign.open("rb") as image_file:
                                image_data = image_file.read()
                            image_base64 = base64.b64encode(image_data).decode('utf-8')

                            candidateDetails = {
                                "id": candidate.pk,
                                "name": candidate.name,
                                "party": candidate.party,
                                "Sign": image_base64
                            }
                            output.append(candidateDetails)
                        return Response(output, status=status.HTTP_200_OK)
                    else:
                        return Response({"message": "No candidates added"}, status=status.HTTP_200_OK)
                else:
                    return Response({"message":"Please login as Voter"}, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({"message":"Token not valid"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(str(e), status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class UpdateCandidates(generics.RetrieveUpdateAPIView):
    queryset = Candidates.objects.all()
    serializer_class = CandidatesSerializer
    def put(self, request, *args, **kwargs):
        authUser = authenticate(request)
        if authUser:
            role = get_user_role(request)
            if role == "admin":
               
                instance = self.get_object()
                data = request.data
                name = data['name']
                image_data = data['sign']   
                format, imgstr = image_data.split(';base64,') 
                ext = format.split('/')[-1]
                image_data = ContentFile(base64.b64decode(imgstr), name=f"candidate_{name}.{ext}")
                data["sign"] = image_data
                # Validate and update specific fields with the request data
                serializer = self.get_serializer(instance, data=data, partial=True)
                serializer.is_valid(raise_exception=True)
                serializer.save()
                candidates = Candidates.objects.filter(admin=authUser, pk=data["id"])
                if candidates:
                    # print(candidate)
                    for candidate in candidates:
                        with candidate.sign.open("rb") as image_file:
                            image_data = image_file.read()
                        image_base64 = base64.b64encode(image_data).decode('utf-8')

                    candidateDetails = {
                        "id": candidate.pk,
                        "name": candidate.name,
                        "party": candidate.party,
                        "Sign": image_base64
                    }
                return Response({"message": candidateDetails}, status=status.HTTP_200_OK)
            else:
                return Response({"message": "Please Login as Admin"}, status=status.HTTP_401_UNAUTHORIZED)

class DeleteCandidates(mixins.DestroyModelMixin, generics.GenericAPIView):

    queryset = Candidates.objects.all()
    serializer_class = CandidatesDelete
    def delete(self, request, *args, **kwargs):
        authUser = authenticate(request)
        if authUser:
            role = get_user_role(request)
            if role == "admin":
                self.destroy(request, *args, **kwargs)
                return Response({"message": "Record deleted successfully."}, status=status.HTTP_200_OK)
            else:
                return Response({"message": "Please Login as Admin"}, status=status.HTTP_401_UNAUTHORIZED)
        else:
            return Response({"message": "Please Login as Admin"}, status=status.HTTP_401_UNAUTHORIZED)
