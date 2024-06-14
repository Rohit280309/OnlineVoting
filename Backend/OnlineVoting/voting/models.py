from django.db import models
from datetime import datetime, timedelta

# Create your models here.

class Administrator(models.Model):
    name = models.CharField(max_length=20, default="-")
    email = models.EmailField()
    password = models.CharField(max_length=200)
    image = models.ImageField(upload_to="admin_profile", blank=True)
    role = models.CharField(max_length=10, default="admin")
    verified = models.BooleanField(default=False)
    createdAt = models.DateTimeField(auto_now_add=True)
    def __str__(self) -> str:
        return f"{self.email}"

class Voters(models.Model):
    voterId = models.CharField(max_length=10)
    voterName = models.CharField(max_length=20)
    voterImage = models.ImageField(upload_to='voterImage')
    voterEmail = models.EmailField()
    voterPassword = models.CharField(max_length=200)
    role = models.CharField(max_length=10, default="voter")
    verified = models.BooleanField(default=False)
    createdAt = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"{self.voterId}"

class Candidates(models.Model):
    name = models.CharField(max_length=20)
    party = models.CharField(max_length=20)
    sign = models.ImageField(upload_to="sign")
    admin = models.ForeignKey(Administrator, on_delete=models.CASCADE)

class Election(models.Model):
    electionId = models.CharField(max_length=10)
    password = models.CharField(max_length=200)
    title = models.CharField(max_length=20)
    image = models.ImageField(upload_to="electionImage")
    admin = models.ForeignKey(Administrator, on_delete=models.CASCADE)
    voters = models.ManyToManyField(Voters, related_name='eligible_voters', blank=True)
    votedVoter = models.ManyToManyField(Voters, related_name='voted_voters', blank=True)
    candidates = models.ManyToManyField(Candidates, related_name='eligible_candidates')
    startDate = models.DateTimeField()
    endDate = models.DateTimeField()

class Vote(models.Model):
    # voter = models.ForeignKey(Voters, on_delete=models.CASCADE)
    election = models.ForeignKey(Election, on_delete=models.CASCADE)
    candidate = models.ForeignKey(Candidates, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)

class VoterOTP(models.Model):
    voter = models.OneToOneField(Voters, on_delete=models.CASCADE)
    otp = models.CharField(max_length=6)
    otp_created_at = models.DateTimeField(auto_now_add=True)
    otp_expires_at = models.DateTimeField(default=datetime.now() + timedelta(minutes=1))

class AdminOTP(models.Model):
    administrator = models.OneToOneField(Administrator, on_delete=models.CASCADE)
    otp = models.CharField(max_length=6)
    otp_created_at = models.DateTimeField(auto_now_add=True)
    otp_expires_at = models.DateTimeField(default=datetime.now() + timedelta(minutes=1))

class FaceImage(models.Model):
    voter = models.ForeignKey(Voters, on_delete=models.CASCADE)
    image = models.ImageField(upload_to='faces/')