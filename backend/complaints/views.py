# -*- coding: utf-8 -*-
from rest_framework import viewsets, status, permissions, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.conf import settings as django_settings
from django.contrib.auth.models import User
from .models import Complaint, ComplaintAction, Notification, UserProfile
from .serializers import (
    ComplaintSerializer, ComplaintActionSerializer,
    UserRegistrationSerializer, NotificationSerializer, UserProfileSerializer
)
import uuid
import datetime
import json

try:
    from openai import OpenAI
except ImportError:
    OpenAI = None

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register_user(request):
    data = request.data.copy()
    if 'role' in data and not (request.user.is_authenticated and request.user.is_staff):
        data['role'] = 'researcher'
    serializer = UserRegistrationSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "تم التسجيل بنجاح"}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([permissions.IsAdminUser])
def list_users(request):
    users = User.objects.all().order_by('-date_joined')
    data = [{
        'id': u.id,
        'username': u.username,
        'first_name': u.first_name,
        'last_name': u.last_name,
        'email': u.email,
        'role': 'admin' if u.is_staff else 'researcher',
        'date_joined': u.date_joined.strftime('%Y-%m-%d'),
    } for u in users]
    return Response(data)

@api_view(['DELETE'])
@permission_classes([permissions.IsAdminUser])
def delete_user(request, user_id):
    try:
        u = User.objects.get(pk=user_id)
        if u == request.user:
            return Response({'error': 'لا يمكنك حذف حسابك الخاص'}, status=400)
        u.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except User.DoesNotExist:
        return Response({'error': 'المستخدم غير موجود'}, status=404)

def get_profile_data(user, request):
    avatar_url = None
    if hasattr(user, 'profile') and user.profile.avatar:
        avatar_url = request.build_absolute_uri(user.profile.avatar.url)
    return {
        'id': user.id,
        'username': user.username,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'email': user.email,
        'role': 'admin' if user.is_staff else 'researcher',
        'avatar': avatar_url
    }

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_user_profile(request):
    return Response(get_profile_data(request.user, request))

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def update_profile(request):
    user = request.user
    profile, created = UserProfile.objects.get_or_create(user=user)
    user.first_name = request.data.get('first_name', user.first_name)
    user.last_name = request.data.get('last_name', user.last_name)
    user.email = request.data.get('email', user.email)
    user.save()
    if 'avatar' in request.FILES:
        profile.avatar = request.FILES['avatar']
    profile.save()
    return Response(get_profile_data(user, request))

class ComplaintViewSet(viewsets.ModelViewSet):
    queryset = Complaint.objects.all().order_by('-created_at')
    serializer_class = ComplaintSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['complaint_number', 'complainant_name', 'complainant_phone', 'ai_category']

    def _analyze_complaint(self, original_text):
        ai_severity = 2
        ai_category = "عام"
        ai_summary = f"ملخص تلقائي: {original_text[:50]}..."
        is_real_ai = False

        if OpenAI and hasattr(django_settings, 'GROQ_API_KEY') and django_settings.GROQ_API_KEY:
            try:
                client = OpenAI(api_key=django_settings.GROQ_API_KEY, base_url="https://api.groq.com/openai/v1")
                system_prompt = (
                    "أنت خبير تقييم مخاطر وحماية في مؤسسة إنسانية دولية (Humanitarian Protection Expert). "
                    "مهمتك هي تحليل 'نص الشكوى' واستخراج البيانات المحددة بدقة متناهية وفقاً للمعايير الإنسانية.\\n\\n"
                    "قواعد التقييم:\\n"
                    "1. التلخيص (summary): صغ ملخصاً مهنياً في سطر واحد يوضح صلب المشكلة.\\n"
                    "2. التصنيف (category): يجب أن تختار قيمة واحدة فقط من القائمة التالية: "
                    "(تحرش وانتهاكات، سرقة وفساد، نقص إمدادات المياه، نقص غذائي، أضرار البنية التحتية، رعاية صحية، عام).\\n"
                    "3. الخطورة (severity): قيم من 1 إلى 5.\\n\\n"
                    "أجب دائماً بصيغة JSON فقط: {\\\"summary\\\": string, \\\"category\\\": string, \\\"severity\\\": integer}"
                )
                messages = [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"نص الشكوى: {original_text}"}
                ]
                response = client.chat.completions.create(
                    model="llama-3.3-70b-versatile",
                    messages=messages,
                    response_format={"type": "json_object"},
                    temperature=0.1
                )
                data = json.loads(response.choices[0].message.content)
                ai_summary = data.get('summary', ai_summary)
                ai_category = data.get('category', ai_category)
                severity_val = data.get('severity', 2)
                ai_severity = severity_val if severity_val in [1, 2, 3, 4, 5] else 2
                is_real_ai = True
            except Exception as e:
                print(f"Groq Error: {e}")

        if not is_real_ai:
            if any(k in original_text for k in ["مياه", "عطش", "الري"]):
                ai_category, ai_severity = "نقص إمدادات المياه", 4
            elif any(k in original_text for k in ["غذاء", "جوع", "خبز"]):
                ai_category, ai_severity = "نقص غذائي", 4

        return ai_summary, ai_category, ai_severity

    def perform_create(self, serializer):
        complaint_no = f"CMP-{datetime.datetime.now().year}-{str(uuid.uuid4().int)[:4]}"
        original_text = serializer.validated_data.get('original_text', '')
        summary, category, severity = self._analyze_complaint(original_text)
        
        instance = serializer.save(
            complaint_number=complaint_no,
            ai_summary=summary,
            ai_category=category,
            ai_severity=severity,
            status=Complaint.StatusChoice.PENDING
        )
        
        ComplaintAction.objects.create(
            complaint=instance,
            action_title="تم إنشاء الشكوى وتحليلها",
            action_description=f"التحليل التلقائي: {category}, مستوى {severity}",
            performed_by=self.request.user if self.request.user.is_authenticated else None
        )
        if severity >= 4:
            Notification.objects.create(
                title=f"حالة عاجلة: {complaint_no}",
                message=f"شكوى جديدة تتطلب انتباه فوري في قطاع {category}.",
                for_admin_only=True
            )

    def perform_update(self, serializer):
        old_instance = self.get_object()
        new_text = serializer.validated_data.get('original_text')
        
        if new_text and new_text != old_instance.original_text:
            summary, category, severity = self._analyze_complaint(new_text)
            serializer.save(
                ai_summary=summary,
                ai_category=category,
                ai_severity=severity
            )
            ComplaintAction.objects.create(
                complaint=old_instance,
                action_title="تعديل الشكوى وإعادة التحليل",
                action_description=f"تحديث النص أدى لتغيير التحليل إلى: {category}, مستوى {severity}",
                performed_by=self.request.user
            )
        else:
            serializer.save()

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        complaint = self.get_object()
        new_status = request.data.get('status')
        if new_status in dict(Complaint.StatusChoice.choices):
            complaint.status = new_status
            complaint.save()
            ComplaintAction.objects.create(
                complaint=complaint,
                action_title=f"تغيير الحالة: {new_status}",
                action_description=request.data.get('note', ''),
                performed_by=request.user if request.user.is_authenticated else None
            )
            return Response({'status': 'Status updated'})
        return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)

class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    def get_queryset(self):
        return Notification.objects.filter(for_admin_only=True).order_by('-created_at')
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        self.get_queryset().update(is_read=True)
        return Response({'status': 'All notifications marked as read'})
