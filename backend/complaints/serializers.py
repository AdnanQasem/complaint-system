from rest_framework import serializers
from .models import Complaint, ComplaintAction, Notification, UserProfile
from django.contrib.auth.models import User

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['avatar', 'bio']

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(choices=['admin', 'researcher'], write_only=True)
    profile = UserProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['username', 'password', 'first_name', 'last_name', 'role', 'profile']

    def create(self, validated_data):
        role = validated_data.pop('role')
        user = User(**validated_data)
        user.set_password(validated_data['password'] if 'password' in validated_data else '')
        if role == 'admin':
            user.is_staff = True
        user.save()
        return user

class ComplaintActionSerializer(serializers.ModelSerializer):
    performed_by_name = serializers.CharField(source='performed_by.get_full_name', read_only=True)
    class Meta:
        model = ComplaintAction
        fields = '__all__'

class ComplaintSerializer(serializers.ModelSerializer):
    timeline = ComplaintActionSerializer(many=True, read_only=True)

    class Meta:
        model = Complaint
        fields = '__all__'
        # We keep status/AI fields read-only for the general serializer, 
        # but the ViewSet can override or we handle them in perform_create/update.
        read_only_fields = ('complaint_number', 'ai_summary', 'ai_category', 'ai_severity', 'status')

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
