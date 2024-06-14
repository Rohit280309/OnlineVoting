from rest_framework import serializers
from voting.models import *
from django.contrib.auth.hashers import make_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
import base64
from django.core.files.base import ContentFile

class AdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = Administrator
        fields = "__all__"

    def create(self, validated_data):
        email = validated_data.get('email')
        if Administrator.objects.filter(email=email).exists():
            raise serializers.ValidationError("Email already exists")
        password = validated_data.pop('password', None)
        image_data = validated_data.pop("image")
        instance = self.Meta.model(**validated_data)
        if password is not None:
            instance.password = make_password(password)
        instance.image.save(image_data.name, image_data, save=True)
        return instance
    
class AdminLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()


class VoterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Voters
        fields = "__all__"

    def create(self, validated_data):
        email = validated_data.get("voterEmail")
        if Voters.objects.filter(voterEmail=email).exists():
            raise serializers.ValidationError("Email already exists")
        password = validated_data.pop('voterPassword', None)
        image_data = validated_data.pop('voterImage')
        instance = Voters.objects.create(**validated_data)
        if password is not None:
            instance.voterPassword = make_password(password)
        instance.voterImage.save(image_data.name, image_data, save=True)

        return instance

class ElectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Election
        fields = "__all__"

    def create(self, validated_data):
        password = validated_data.pop("password", None)
        image_data = validated_data.pop("image")
        candidates = validated_data.pop("candidates")

        instance = Election.objects.create(**validated_data)
        instance.candidates.set(candidates)
        
        if password is not None:
            instance.password = make_password(password)
        instance.image.save(image_data.name, image_data, save=True)

        return instance
    

class VoterLoginSerializer(serializers.Serializer):
    id = serializers.CharField()
    email = serializers.EmailField()
    password = serializers.CharField()

class ElectionUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Election
        fields = '__all__'

        def update(self, validated_data):
            image_data = validated_data.pop("image")
            candidates = validated_data.pop("candidates")
            voters = validated_data.pop("voters")
            electionId = validated_data.pop("electionId")
            
            instance = Election.objects.get(electionId=electionId)
            instance.candidates.set(candidates)
            instance.voters.set(voters)
            instance.image.save(image_data.name, image_data, save=True)

            return instance

class ElectionDelete(serializers.ModelSerializer):
    class Meta:
        model = Election
        fields = '__all__'

class CandidatesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Candidates
        fields = "__all__"

    def create(self, validated_data):
        image_data = validated_data.pop('sign')
        instance = Candidates.objects.create(**validated_data)
        instance.sign.save(image_data.name, image_data, save=True)
        return instance
    
class CandidatesDelete(serializers.ModelSerializer):
    class Meta:
        model = Candidates
        fields = '__all__'
    
class ViewCandidates(serializers.ModelSerializer):
    class Meta:
        model = Candidates
        fields = ['name', 'party']

class ImageSerializer(serializers.Serializer):
    image = serializers.ImageField()

