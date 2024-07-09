from unittest import loader
from django.http import HttpResponse
from django.shortcuts import render, loader


# Create your views here.

def detection(request):
    template = loader.get_template('index.html')
    return HttpResponse(template.render())
