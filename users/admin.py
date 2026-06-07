from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    # Specify the fields to display in the user list in the admin
    list_display = ('email', 'first_name', 'phone', 'is_active', 'email_verified', 'is_staff', 'date_joined')
    
    # Add filters to the sidebar
    list_filter = ('is_active', 'email_verified', 'is_staff', 'is_superuser')
    
    # Fields to search by
    search_fields = ('email', 'first_name', 'phone')
    
    # Ordering of the list
    ordering = ('-date_joined',)
    
    # Fields to display when editing a user
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('first_name', 'phone')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
        ('Verification', {'fields': ('email_verified',)}),
    )
    
    # Fields to display when creating a user
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'phone', 'password', 'is_active'),
        }),
    )

    # Required for custom User model without username
    filter_horizontal = ('groups', 'user_permissions',)
