from django.urls import path
from . import views

urlpatterns = [
    path('upload/jobs/', views.upload_jobs, name='upload_jobs'),
    path('upload/benefits/', views.upload_benefits, name='upload_benefits'),
    path('upload/skills/', views.upload_skills, name='upload_skills'),
    path('upload/responsibilities/', views.upload_responsibilities, name='upload_responsibilities'),
    path('dashboard/', views.job_dashboard, name='job_dashboard'),
    path('candidate-dashboard/', views.candidate_dashboard, name='candidate_dashboard'),    
    path('job-quality-analysis/', views.job_quality_analysis, name='job_quality_analysis'),
    path('', views.main, name='main'),
]