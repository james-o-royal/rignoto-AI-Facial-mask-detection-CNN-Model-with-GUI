
document.addEventListener('DOMContentLoaded', () => {
    const scanLink = document.getElementById('scan-link');
    const uploadModal = document.getElementById('uploadModal');
    const closeModal = document.getElementsByClassName('close')[0];
    const uploadImageBtn = document.getElementById('uploadImage');
    const captureImageBtn = document.getElementById('captureImage');
    const fileInput = document.getElementById('fileInput');
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const takePhotoBtn = document.getElementById('takePhoto');
    const uploadedImage = document.getElementById('uploaded-image');
    const detectionImage = document.getElementById('detection-image');
    const detectionTitle = document.getElementById('detection-title');
    const detectionMessage = document.getElementById('detection-message');
    const detectionResult = document.getElementById('detection-result');
    const imageContainer = document.getElementById('image-container');

    scanLink.onclick = () => {
        uploadModal.style.display = 'block';
    };

    closeModal.onclick = () => {
        uploadModal.style.display = 'none';
    };

    window.onclick = (event) => {
        if (event.target === uploadModal) {
            uploadModal.style.display = 'none';
        }
    };

    uploadImageBtn.onclick = () => {
        fileInput.click();
    };

    fileInput.onchange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                uploadedImage.src = e.target.result;
                imageContainer.style.display = 'block';
                detectionResult.style.display = 'none';
                uploadModal.style.display = 'none';
                // Send the image to the server for prediction
                sendImageToServer(file);
            };
            reader.readAsDataURL(file);
        }
    };

    captureImageBtn.onclick = () => {
        video.style.display = 'block';
        takePhotoBtn.style.display = 'block';
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
                video.srcObject = stream;
                video.play();
            });
        }
    };

    takePhotoBtn.onclick = () => {
        const context = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/png');
        uploadedImage.src = imageData;
        imageContainer.style.display = 'block';
        detectionResult.style.display = 'none';
        uploadModal.style.display = 'none';
        // Convert the canvas data to a blob and send it to the server
        canvas.toBlob((blob) => {
            sendImageToServer(blob);
        });
        video.pause();
        video.srcObject.getTracks()[0].stop();
    };

    function sendImageToServer(image) {
        const formData = new FormData();
        formData.append('file', image);

        // Get CSRF token from cookies
        const csrftoken = getCookie('csrftoken');

        fetch('/predict/', {
            method: 'POST',
            body: formData,
            headers: {
                'X-CSRFToken': csrftoken // Ensure 'csrftoken' matches your CSRF cookie name
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                updateDetectionResult(data.result === 'mask');
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }


    function updateDetectionResult(maskDetected) {
        if (maskDetected) {
            detectionImage.src = staticImageUrl + "detected-check.svg";
            detectionTitle.textContent = 'Face Mask Detected';
            detectionMessage.textContent = 'Your face has been verified successfully by our AI, now below is your entrance access code, Enjoy!';
        } else {
            detectionImage.src = staticImageUrl + "detected-not.svg"; // Add an appropriate image for no mask detected
            detectionTitle.textContent = 'No Face Mask Detected';
            detectionMessage.textContent = 'Please put on a face mask and verify again to get the entrance access code.';
        }
        detectionResult.style.display = 'block';
    }


    // Function to get CSRF token from cookies
    function getCookie(name) {
        const cookieValue = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
        return cookieValue ? cookieValue.pop() : '';
    }

});
