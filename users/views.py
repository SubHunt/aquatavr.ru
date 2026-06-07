from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.contrib.auth.tokens import default_token_generator
from django.conf import settings
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django_ratelimit.decorators import ratelimit
from django.utils.decorators import method_decorator
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from .serializers import UserSerializer, RegisterSerializer
from .models import User

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

    @method_decorator(ratelimit(key='ip', rate='5/h', method='POST', block=True))
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == status.HTTP_201_CREATED:
            user = User.objects.get(email=response.data['email'])
            self.send_verification_email(user)
        return response

    def send_verification_email(self, user):
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        verify_url = f"{settings.FRONTEND_URL}/verify-email?uid={uid}&token={token}"
        
        subject = 'Подтверждение регистрации на Aquatavr'
        message = f'Здравствуйте, {user.first_name}!\n\nДля подтверждения регистрации, пожалуйста, перейдите по ссылке:\n{verify_url}'
        
        if settings.EMAIL_BACKEND == 'django.core.mail.backends.console.EmailBackend':
            # Direct print to console for easier debugging on Windows
            print("\n" + "="*50)
            print(f"SUBJECT: {subject}")
            print(f"TO: {user.email}")
            print(f"VERIFICATION URL: {verify_url}")
            print("="*50 + "\n")
        else:
            send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email])

class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            raise InvalidToken(e.args[0])
        except Exception as e:
            # Check if user exists but is inactive
            email = request.data.get('email')
            user = User.objects.filter(email=email).first()
            if user and not user.is_active:
                return Response(
                    {"detail": "Аккаунт не активирован. Мы отправили ссылку для активации на ваш email. Пожалуйста, проверьте почту."},
                    status=status.HTTP_401_UNAUTHORIZED
                )
            return Response(
                {"detail": "Неверный email или пароль."},
                status=status.HTTP_401_UNAUTHORIZED
            )

        return Response(serializer.validated_data, status=status.HTTP_200_OK)

class VerifyEmailView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        uidb64 = request.data.get('uid')
        token = request.data.get('token')
        
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        if user is not None and default_token_generator.check_token(user, token):
            user.is_active = True
            user.email_verified = True
            user.save()
            return Response({'detail': 'Email успешно подтвержден.'}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Неверная ссылка подтверждения.'}, status=status.HTTP_400_BAD_REQUEST)

class UserMeView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
