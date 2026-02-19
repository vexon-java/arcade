from django.shortcuts import render

def angry_birds(request):
    return render(request, 'app/birds.html')
