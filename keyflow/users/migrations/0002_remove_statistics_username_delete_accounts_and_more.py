# Generated by Django 5.1.1 on 2024-09-15 20:36

from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("users", "0001_initial"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="statistics",
            name="username",
        ),
        migrations.DeleteModel(
            name="Accounts",
        ),
        migrations.DeleteModel(
            name="Statistics",
        ),
    ]
