# celery.py
from __future__ import absolute_import, unicode_literals
import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'OnlineVoting.settings')

app = Celery('OnlineVoting')

app.config_from_object('django.conf:settings', namespace='CELERY')

# Explicitly set the task serializer to 'json'
app.conf.task_serializer = 'json'
app.conf.accept_content = ['json']
app.conf.result_serializer = 'json'

# Auto-discover tasks in all installed apps
app.autodiscover_tasks()
