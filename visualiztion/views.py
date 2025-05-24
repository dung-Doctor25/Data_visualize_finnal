from django.shortcuts import render
from django.contrib import messages
import pandas as pd
from .models import Job, Benefits, Skills, Responsibility
from django.http import HttpResponseRedirect

def main(request):
    return render(request, 'main.html')

def upload_jobs(request):
    if request.method == 'POST':
        try:
            # Lấy file upload
            job_file = request.FILES['job_descriptions']
            job_df = pd.read_csv(job_file)

            # Xử lý Jobs
            for _, row in job_df.iterrows():
                Job.objects.get_or_create(
                    Job_Id=row['Job Id'],
                    defaults={
                        'Experience': row.get('Experience', ''),
                        'Qualifications': row.get('Qualifications', ''),
                        'Salary_Range': row.get('Salary Range', ''),
                        'location': row.get('location', ''),
                        'Country': row.get('Country', ''),
                        'latitude': row.get('latitude', None),
                        'longitude': row.get('longitude', None),
                        'Work_Type': row.get('Work Type', ''),
                        'Company_Size': row.get('Company Size', ''),
                        'Job_Posting_Date': pd.to_datetime(row.get('Job Posting Date', None), errors='coerce'),
                        'Preference': row.get('Preference', ''),
                        'Job_Title': row.get('Job Title', ''),
                        'Role': row.get('Role', ''),
                        'Company': row.get('Company', ''),
                        'industry': row.get('industry', ''),
                        'simplified_role': row.get('simplified_role', ''),
                        'city': row.get('city', ''),
                        'Min_Exp': row.get('Min_Exp', None),
                        'Max_Exp': row.get('Max_Exp', None),
                        'Min_Salary': row.get('Min_Salary', None),
                        'Max_Salary': row.get('Max_Salary', None),
                        'Sector': row.get('Sector', ''),
                        'Responsibility_List': row.get('Responsibility_List', ''),
                        'year': row.get('year', None),
                        'month': row.get('month', None),
                    }
                )

            messages.success(request, "ETL cho Job Descriptions hoàn tất!")
            return HttpResponseRedirect(request.path)

        except Exception as e:
            messages.error(request, f"Lỗi khi xử lý file Job Descriptions: {str(e)}")
            return HttpResponseRedirect(request.path)

    return render(request, 'upload.html')

def upload_benefits(request):
    if request.method == 'POST':
        try:
            # Lấy file upload
            benefit_file = request.FILES['benefits']
            benefit_df = pd.read_csv(benefit_file)

            # Xử lý Benefits
            for _, row in benefit_df.iterrows():
                try:
                    job = Job.objects.get(Job_Id=row['Job Id'])
                    Benefits.objects.get_or_create(
                        Job=job,
                        Benefits=row.get('Benefits', ''),
                        benefit=row.get('benefit', '')
                    )
                except Job.DoesNotExist:
                    messages.warning(request, f"Không tìm thấy Job cho benefit: {row['Job Id']}")

            messages.success(request, "ETL cho Benefits hoàn tất!")
            return HttpResponseRedirect(request.path)

        except Exception as e:
            messages.error(request, f"Lỗi khi xử lý file Benefits: {str(e)}")
            return HttpResponseRedirect(request.path)

    return render(request, 'upload.html')

def upload_skills(request):
    if request.method == 'POST':
        try:
            # Lấy file upload
            skill_file = request.FILES['skills']
            skill_df = pd.read_csv(skill_file)

            # Xử lý Skills
            for _, row in skill_df.iterrows():
                try:
                    job = Job.objects.get(Job_Id=row['Job Id'])
                    Skills.objects.get_or_create(
                        Job=job,
                        skills=row.get('skills', '')
                    )
                except Job.DoesNotExist:
                    messages.warning(request, f"Không tìm thấy Job cho skill: {row['Job Id']}")

            messages.success(request, "ETL cho Skills hoàn tất!")
            return HttpResponseRedirect(request.path)

        except Exception as e:
            messages.error(request, f"Lỗi khi xử lý file Skills: {str(e)}")
            return HttpResponseRedirect(request.path)

    return render(request, 'upload.html')

def upload_responsibilities(request):
    if request.method == 'POST':
        try:
            responsibility_file = request.FILES['responsibilities']
            responsibility_df = pd.read_csv(responsibility_file)

            responsibilities_to_create = []
            existing_pairs = set(Responsibility.objects.values_list('Jobid', 'responsibility'))

            for _, row in responsibility_df.iterrows():
                job_id = row['Job Id']
                responsibility_val = row.get('responsibility', '')
                if (job_id, responsibility_val) not in existing_pairs:
                    responsibilities_to_create.append(Responsibility(
                        Jobid=job_id,
                        responsibility=responsibility_val
                    ))

            if responsibilities_to_create:
                Responsibility.objects.bulk_create(responsibilities_to_create, ignore_conflicts=True)

            messages.success(request, "ETL cho Responsibilities hoàn tất!")
            return HttpResponseRedirect(request.path)

        except Exception as e:
            messages.error(request, f"Lỗi khi xử lý file Responsibilities: {str(e)}")
            return HttpResponseRedirect(request.path)

    return render(request, 'upload.html')

import json
from django.core.serializers.json import DjangoJSONEncoder
# View cho dashboard

def classify_degree(qualification):
    bachelors = {"B.Com", "B.Tech", "BA", "BBA", "BCA"}
    masters = {"M.Com", "M.Tech", "MBA", "MCA"}

    if qualification in bachelors:
        return "Bachelor's Degree"
    elif qualification in masters:
        return "Master's Degree"
    elif qualification == "PhD":
        return "Doctorate"
    else:
        return "Other"
def job_dashboard(request):
    # Lấy tất cả dữ liệu từ bảng Job
    jobs = Job.objects.all().values(
        'Job_Id', 'Experience', 'Qualifications', 'Salary_Range', 'location',
        'Country', 'latitude', 'longitude', 'Work_Type', 'Company_Size',
        'Job_Posting_Date', 'Preference', 'Job_Title', 'Role', 'Company',
        'industry', 'simplified_role', 'city', 'Min_Exp', 'Max_Exp',
        'Min_Salary', 'Max_Salary', 'Sector', 'Responsibility_List',
        'year', 'month'
    )

    # Chuyển dữ liệu thành danh sách và thêm các trường mới
    job_data = []
    for job in jobs:
        # Tính trung bình lương
        min_salary = float(job['Min_Salary']) if job['Min_Salary'] is not None else 0
        max_salary = float(job['Max_Salary']) if job['Max_Salary'] is not None else 0
        avg_salary = (min_salary + max_salary) / 2 if (min_salary + max_salary) > 0 else 0

        # Tính trung bình kinh nghiệm
        min_exp = int(job['Min_Exp']) if job['Min_Exp'] is not None else 0
        max_exp = int(job['Max_Exp']) if job['Max_Exp'] is not None else 0
        avg_exp = (min_exp + max_exp) / 2 if (min_exp + max_exp) > 0 else 0

        # Phân loại Qualifications
        group_quality = classify_degree(job['Qualifications'] or '')

        job_data.append({
            'Job Id': job['Job_Id'],
            'Experience': job['Experience'] or '',
            'Qualifications': job['Qualifications'] or '',
            'Salary Range': job['Salary_Range'] or '',
            'location': job['location'] or '',
            'Country': job['Country'] or '',
            'latitude': float(job['latitude']) if job['latitude'] is not None else 0,
            'longitude': float(job['longitude']) if job['longitude'] is not None else 0,
            'Work Type': job['Work_Type'] or '',
            'Company Size': job['Company_Size'] or '',
            'Job Posting Date': job['Job_Posting_Date'].strftime('%Y-%m-%d') if job['Job_Posting_Date'] else '',
            'Preference': job['Preference'] or '',
            'Job Title': job['Job_Title'] or '',
            'Role': job['Role'] or '',
            'Company': job['Company'] or '',
            'industry': job['industry'] or '',
            'simplified_role': job['simplified_role'] or '',
            'city': job['city'] or '',
            'City': job['city'] or '',  # Gộp City và city để tương thích
            'Min_Exp': min_exp,
            'Max_Exp': max_exp,
            'Min_Salary': min_salary,
            'Max_Salary': max_salary,
            'Sector': job['Sector'] or '',
            'Responsibility_List': job['Responsibility_List'] or '',
            'year': int(job['year']) if job['year'] is not None else 0,
            'month': int(job['month']) if job['month'] is not None else 0,
            'avg_salary': avg_salary,
            'avg_exp': avg_exp,
            'group_quality': group_quality
        })

    # Chuyển thành JSON
    job_data_json = json.dumps(job_data, cls=DjangoJSONEncoder)

    return render(request, 'visualize.html', {'job_data': job_data_json})

def candidate_dashboard(request):
    # Lấy dữ liệu từ bảng Job
    jobs = Job.objects.all().values(
        'Job_Id', 'Qualifications', 'industry', 'city',
        'Min_Salary', 'Max_Salary', 'Min_Exp', 'Max_Exp','simplified_role',
        'Preference'
    )

    # Lấy dữ liệu từ bảng Skills
    skills = Skills.objects.all().values('Job__Job_Id', 'skills')

    # Xử lý dữ liệu Job
    job_data = []
    for job in jobs:
        min_salary = float(job['Min_Salary']) if job['Min_Salary'] is not None else 0
        max_salary = float(job['Max_Salary']) if job['Max_Salary'] is not None else 0
        avg_salary = (min_salary + max_salary) / 2 if (min_salary + max_salary) > 0 else 0

        min_exp = int(job['Min_Exp']) if job['Min_Exp'] is not None else 0
        max_exp = int(job['Max_Exp']) if job['Max_Exp'] is not None else 0
        avg_exp = (min_exp + max_exp) / 2 if (min_exp + max_exp) > 0 else 0

        group_quality = classify_degree(job['Qualifications'] or '')

        job_data.append({
            'Job Id': job['Job_Id'],
            'Qualifications': job['Qualifications'] or '',
            'industry': job['industry'] or '',
            'simplified_role': job['simplified_role'] or '',
            'city': job['city'] or '',
            'Min_Salary': min_salary,
            'Max_Salary': max_salary,
            'Min_Exp': min_exp,
            'Max_Exp': max_exp,
            'avg_salary': avg_salary,
            'avg_exp': avg_exp,
            'group_quality': group_quality,
            'gender': job['Preference'] or '',
        })

    # Xử lý dữ liệu Skills
    skills_data = []
    for skill in skills:
        skills_data.append({
            'Job Id': skill['Job__Job_Id'],
            'skills': skill['skills'] or ''
        })

    # Kết hợp dữ liệu
    candidate_data = {
        'jobs': job_data,
        'skills': skills_data
    }

    candidate_data_json = json.dumps(candidate_data, cls=DjangoJSONEncoder)
    return render(request, 'candidate_dashboard.html', {'candidate_data': candidate_data_json})


from django.db.models import Count
from collections import defaultdict
def job_quality_analysis(request):
    jobs = Job.objects.all().values(
        'Job_Id', 'Qualifications', 'industry', 'city',
        'Min_Salary', 'Max_Salary', 'Min_Exp', 'Max_Exp',
        'simplified_role', 'Company', 'Job_Posting_Date',
        'month', 'year'
    )
    skills = Skills.objects.all().values('Job__Job_Id', 'skills')
    benefits = Benefits.objects.all().values('Job__Job_Id', 'benefit')
    
    # Tạo từ điển benefits cho lookup
    benefit_dict = {b['Job__Job_Id']: b['benefit'] for b in benefits if b['benefit']}
    
    job_data = []
    for job in jobs:
        min_salary = float(job['Min_Salary']) if job['Min_Salary'] is not None else 0
        max_salary = float(job['Max_Salary']) if job['Max_Salary'] is not None else 0
        avg_salary = (min_salary + max_salary) / 2 if (min_salary + max_salary) > 0 else 0
        min_exp = int(job['Min_Exp']) if job['Min_Exp'] is not None else 0
        max_exp = int(job['Max_Exp']) if job['Max_Exp'] is not None else 0
        avg_exp = (min_exp + max_exp) / 2 if (min_exp + max_exp) > 0 else 0
        group_quality = classify_degree(job['Qualifications'] or '')
        quarter = (job['month'] - 1) // 3 + 1 if job['month'] else 0
        job_data.append({
            'Job Id': job['Job_Id'],
            'Qualifications': job['Qualifications'] or '',
            'industry': job['industry'] or '',
            'simplified_role': job['simplified_role'] or '',
            'city': job['city'] or '',
            'Min_Salary': min_salary,
            'Max_Salary': max_salary,
            'Min_Exp': min_exp,
            'Max_Exp': max_exp,
            'avg_salary': avg_salary,
            'avg_exp': avg_exp,
            'group_quality': group_quality,
            'company_name': job['Company'] or '',
            'post_date': job['Job_Posting_Date'],
            'quarter': quarter,
            'year': job['year'],
            'benefit': benefit_dict.get(job['Job_Id'], '')
        })
    skills_data = []
    for skill in skills:
        skills_data.append({
            'Job Id': skill['Job__Job_Id'],
            'skills': skill['skills'] or ''
        })
    benefits_data = [
        {'Job Id': b['Job__Job_Id'], 'benefit': b['benefit'] or ''}
        for b in benefits
    ]
    import time

    start_time = time.time()
    responsibilities = Responsibility.objects.all().values('Jobid', 'responsibility')
    responsibilities_data = []
    for resp in responsibilities:
        responsibilities_data.append({
            'Job Id': resp['Jobid'],
            'responsibility': resp['responsibility'] or ''
        })

    end_time = time.time()
    elapsed_time = end_time - start_time

    print(f"⏱ Query mất {elapsed_time:.4f} giây")
    candidate_data = {
        'jobs': job_data,
        'skills': skills_data,
        'benefits': benefits_data,
        'responsibilities': responsibilities_data,
    }
    candidate_data_json = json.dumps(candidate_data, cls=DjangoJSONEncoder)
    return render(request, 'job_quality_analysis.html', {'candidate_data': candidate_data_json})