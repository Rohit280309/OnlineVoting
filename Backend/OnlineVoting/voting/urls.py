from django.contrib import admin
from django.urls import path, include
from voting.views import *
from django.conf.urls.static import static
from OnlineVoting import settings
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('api/verify-user', Homeview.as_view(), name="user"),
    path('api/get-election', ElectionDetails.as_view(), name="election"),
    path('api/elections/<int:pk>', EditElection.as_view(), name='election-detail'),
    path('api/deleteelection/<int:pk>', DeleteElection.as_view(), name='delete-election'),
    path('api/getElectionCount', GetElectionCount.as_view(), name="get-election"),
    path('api/get-adminelection', AdminElections.as_view(), name="admin-election"),
    path('api/upload-image', ImageView.as_view(), name='upload-image'),
    path('api/get-candidates', Getcandidates.as_view(), name='get-candidates'),
    path('api/getcount', Getcandidates.as_view(), name='get-candidates-count'),
    path('api/sendvoterotp', GenerateVoterOtp.as_view(), name="otp-generate-voter"),
    path('api/sendadminotp', GenerateAdminOtp.as_view(), name="otp-generate-admin"),
    path('api/verifyvoterotp', VerifyVoterOtp.as_view(), name="verify-otp-voter"),
    path('api/verifyadminotp', VerifyAdminOtp.as_view(), name="verify-otp-admin"),
    path('api/createadmin', CreateAdmin.as_view(), name="create-admin"),
    path('api/loginadmin', LoginAdmin.as_view(), name="login-admin"),
    path('api/createelection', CreateElection.as_view(), name="create-election"),
    path('api/createvoter', CreateVoter.as_view(), name="create-voter"),
    path('api/loginvoter', LoginVoter.as_view(), name="login-voter"),
    path('api/addcandidates', AddCandidates.as_view(), name="add-candidates"),
    path('api/updatecandidates/<int:pk>', UpdateCandidates.as_view(), name="update-candidates"),
    path('api/deletecandidates/<int:pk>', DeleteCandidates.as_view(), name="delete-candidates"),
    path('api/getcandidatedetails', GetCandaditeDetails.as_view(), name="get-candidates"),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/addvoter', AddVoter.as_view(), name='add_voter'),
    path('api/results', CalculateVotes.as_view(), name="results"),
    path('api/getallvotes', GetAllVotes.as_view(), name="votes"),
    path('api/adminresults', AdminElectionsVote.as_view(), name="admin-results"),
    path('api/getuser', GetUser.as_view(), name="getusers"),
    path('api/checkvoted', CheckVoted.as_view(), name="checkvoted"),
    path('api/vote', Voteview.as_view(), name="vote")
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)