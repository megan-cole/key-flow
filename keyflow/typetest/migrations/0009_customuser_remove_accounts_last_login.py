# Generated by Django 5.1.1 on 2024-10-09 23:56

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('typetest', '0008_accounts_last_login'),
    ]

    operations = [
        migrations.CreateModel(
            name='CustomUser',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('last_login', models.DateTimeField(blank=True, null=True, verbose_name='last login')),
                ('username', models.CharField(max_length=64)),
                ('firstName', models.CharField(max_length=32)),
                ('lastName', models.CharField(max_length=32)),
                ('password', models.CharField(max_length=256)),
                ('emailAddress', models.EmailField(max_length=64)),
                ('battlePass', models.BooleanField(default=False)),
                ('profilePicture', models.ImageField(blank=True, null=True, upload_to='images/')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.RemoveField(
            model_name='accounts',
            name='last_login',
        ),
    ]