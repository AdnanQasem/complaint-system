from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ComplaintViewSet, get_user_profile, register_user, update_profile, NotificationViewSet, list_users, delete_user

router = DefaultRouter()
router.register(r'complaints', ComplaintViewSet, basename='complaint')
router.register(r'notifications', NotificationViewSet, basename='notification')

urlpatterns = [
    path('auth/me/', get_user_profile, name='user_profile'),
    path('auth/update-profile/', update_profile, name='update_profile'),
    path('register/', register_user, name='register_user'),
    path('users/', list_users, name='list_users'),
    path('users/<int:user_id>/', delete_user, name='delete_user'),
    path('', include(router.urls)),
]
