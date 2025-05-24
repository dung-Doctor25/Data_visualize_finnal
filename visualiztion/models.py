from django.db import models

class Job(models.Model):
    Job_Id = models.CharField(max_length=100, primary_key=True)
    Experience = models.CharField(max_length=50, blank=True, null=True)
    Qualifications = models.TextField(blank=True, null=True)
    Salary_Range = models.CharField(max_length=100, blank=True, null=True)
    location = models.CharField(max_length=200, blank=True, null=True)
    Country = models.CharField(max_length=100, blank=True, null=True)
    latitude = models.FloatField(blank=True, null=True)
    longitude = models.FloatField(blank=True, null=True)
    Work_Type = models.CharField(max_length=50, blank=True, null=True)
    Company_Size = models.CharField(max_length=50, blank=True, null=True)
    Job_Posting_Date = models.DateField(blank=True, null=True)
    Preference = models.CharField(max_length=50, blank=True, null=True)
    Job_Title = models.CharField(max_length=200, blank=True, null=True)
    Role = models.CharField(max_length=200, blank=True, null=True)
    Company = models.CharField(max_length=200, blank=True, null=True)
    industry = models.CharField(max_length=200, blank=True, null=True)
    simplified_role = models.CharField(max_length=200, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    Min_Exp = models.IntegerField(blank=True, null=True)
    Max_Exp = models.IntegerField(blank=True, null=True)
    Min_Salary = models.FloatField(blank=True, null=True)
    Max_Salary = models.FloatField(blank=True, null=True)
    Sector = models.CharField(max_length=200, blank=True, null=True)
    Responsibility_List = models.TextField(blank=True, null=True)
    year = models.IntegerField(blank=True, null=True)
    month = models.IntegerField(blank=True, null=True)

    def __str__(self):
        return f"{self.Job_Title} - {self.Company}"

class Benefits(models.Model):
    Job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='benefits', to_field='Job_Id')
    Benefits = models.TextField(blank=True, null=True)
    benefit = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Benefits for {self.Job.Job_Id}"

class Skills(models.Model):
    Job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='skills', to_field='Job_Id')
    skills = models.TextField()

    def __str__(self):
        return f"Skills for {self.Job.Job_Id}"

class Responsibility(models.Model):
    Jobid = models.CharField(max_length=100,null=True, blank=True)
    responsibility = models.TextField()

    def __str__(self):
        return f"Responsibility for {self.Jobid}"