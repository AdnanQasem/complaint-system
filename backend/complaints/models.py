import uuid
from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

class Complaint(models.Model):
    class SeverityChoice(models.IntegerChoices):
        LOW = 1, 'Low'
        NORMAL = 2, 'Normal'
        IMPORTANT = 3, 'Important'
        URGENT = 4, 'Urgent'
        CRITICAL = 5, 'Critical'

    class StatusChoice(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
        RESOLVED = 'RESOLVED', 'Resolved'
        CLOSED = 'CLOSED', 'Closed'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    complaint_number = models.CharField(max_length=20, unique=True)
    complainant_name = models.CharField(max_length=100)
    complainant_id_number = models.CharField(max_length=20)
    complainant_phone = models.CharField(max_length=20)
    region = models.CharField(max_length=100)
    camp_name = models.CharField(max_length=100, blank=True, null=True)
    case_number = models.CharField(max_length=100, blank=True, null=True)
    original_text = models.TextField()
    
    # AI Processed Fields
    ai_summary = models.TextField(blank=True, null=True)
    ai_category = models.CharField(max_length=100, blank=True, null=True)
    ai_severity = models.IntegerField(choices=SeverityChoice.choices, default=SeverityChoice.NORMAL)
    
    status = models.CharField(max_length=20, choices=StatusChoice.choices, default=StatusChoice.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.complaint_number} - {self.complainant_name}"

class ComplaintAction(models.Model):
    complaint = models.ForeignKey(Complaint, on_delete=models.CASCADE, related_name='timeline')
    action_title = models.CharField(max_length=200)
    action_description = models.TextField()
    action_date = models.DateTimeField(auto_now_add=True)
    performed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"{self.action_date.strftime('%Y-%m-%d %H:%M')} - {self.action_title}"

class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications', null=True, blank=True)
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    for_admin_only = models.BooleanField(default=False)

    def __str__(self):
        return self.title
    
class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    bio = models.TextField(max_length=500, blank=True)

    def __str__(self):
        return f"Profile of {self.user.username}"

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.get_or_create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    if not hasattr(instance, 'profile'):
        UserProfile.objects.create(user=instance)
    instance.profile.save()
