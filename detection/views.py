from django.http import JsonResponse
import tensorflow as tf
from tensorflow.keras.models import load_model
from django.views.decorators.csrf import csrf_exempt
from PIL import Image
import numpy as np


from django.shortcuts import render

def index(request):
    return render(request, 'index.html')


# Load the pre-trained model (ensure the model path is correct)
model = load_model('detection/models/face_mask_detector.h5')

@csrf_exempt
def predict(request):
    if request.method == 'POST' and request.FILES.get('file'):
        uploaded_file = request.FILES['file']
        
        # Process the uploaded file (example code)
        img = Image.open(uploaded_file)
        img = img.resize((128, 128))  # Resize image as needed
        img = img.convert('RGB')     # Ensure image is in RGB format
        img_array = np.array(img)    # Convert PIL image to numpy array
        img_array = img_array / 255  # Normalize pixel values (if needed)
        
        # Perform prediction with your TensorFlow/Keras model
        prediction = model.predict(np.expand_dims(img_array, axis=0))
        mask_detected = prediction[0][1] > 0.5  # Example logic, adjust as per your model output
        
        # Return JSON response
        response_data = {
            'result': 'mask' if mask_detected else 'no_mask'
        }
        return JsonResponse(response_data)
    else:
        return JsonResponse({'error': 'Invalid request'}, status=400)