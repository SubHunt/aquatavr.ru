from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'phone', 'email_verified')
        read_only_fields = ('id', 'email_verified')

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    honeypot = serializers.CharField(required=False, allow_blank=True, write_only=True)

    class Meta:
        model = User
        fields = ('email', 'first_name', 'phone', 'password', 'honeypot')

    def validate(self, data):
        if data.get('honeypot'):
            raise serializers.ValidationError("Bot detected")
        return data

    def create(self, validated_data):
        validated_data.pop('honeypot', None)
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            phone=validated_data.get('phone', '')
        )
        return user
