# tasks.py
from celery import shared_task
from time import sleep
from django.utils import timezone
from datetime import timedelta
from .models import *

@shared_task
def delete_unverified_voters(**kwargs):
    sleep(5)
    now = timezone.now()
    voters = Voters.objects.filter(verified=False)
    for voter in voters:
        time_difference = now - voter.createdAt
        if time_difference > timedelta(minutes=5):
            voter.delete()

@shared_task
def delete_unverified_admin(**kwargs):
    sleep(5)
    now = timezone.now()
    admins = Administrator.objects.filter(verified=False)
    for admin in admins:
        time_difference = now - admin.createdAt
        if time_difference > timedelta(minutes=5):
            admin.delete()
