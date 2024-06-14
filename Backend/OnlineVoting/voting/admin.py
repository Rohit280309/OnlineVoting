from django.contrib import admin
from voting.models import *

# Register your models here.

class CandidatesAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'party')

# class ElectionAdmin(admin.ModelAdmin):
#     list_display = ('id', 'title', 'admin', 'eligibleVoter', 'startDate', 'endDate')

class VotesAdmin(admin.ModelAdmin):
    readonly_fields = ('timestamp', 'election', 'candidate')
    list_display = ('id', 'election', 'candidate', 'timestamp')


admin.site.register(Candidates, CandidatesAdmin)
admin.site.register(Voters)
admin.site.register(Election)
admin.site.register(Vote, VotesAdmin)
admin.site.register(Administrator)
admin.site.register(VoterOTP)
admin.site.register(AdminOTP)
