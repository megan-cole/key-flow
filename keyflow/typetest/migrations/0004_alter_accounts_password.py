# Generated by Django 5.1.1 on 2024-09-23 15:22

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('typetest', '0003_accounts_alter_statistics_username'),
    ]

    operations = [
        migrations.AlterField(
            model_name='accounts',
            name='password',
            field=models.CharField(max_length=256),
        ),
    ]
