import base64
from fastapi import FastAPI, File, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from roboflow import Roboflow
from pydantic import BaseModel
import cv2
import numpy as np
import os
import shutil
import io
from PIL import Image
import glob
import pandas as pd
import urllib
from paddleocr import PaddleOCR
from Levenshtein import distance as levenshtein_distance
import re

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Roboflow setup
rf = Roboflow(api_key="qX0aQQBnqLywhVFmlU4C")
#rf = Roboflow(api_key="s4CoCObGq01fLML1N0Ej")
project = rf.workspace().project("cows-gyup1")
#project = rf.workspace().project("cow-video-detection-l7zod")
model = project.version(2).model

rf2 = Roboflow(api_key="IxBbH3p5wJVfT83GdUsz")
project2 = rf2.workspace().project("cow-hair-colors")
model_hair = project2.version(1).model



def save_or_update_cow(work_number, image, confidence, save_directory="saved_images"):
    if confidence < 0.85:
        print(f"Confidence {confidence:.2f} is below threshold. Skipping save for {work_number}.")
        return

    # Ensure the save directory exists
    os.makedirs(save_directory, exist_ok=True)

    # Determine the save path
    save_path = os.path.join(save_directory, f"{work_number}.jpg")

    # Handle case where image is a path
    if isinstance(image, str):
        if not os.path.isfile(image):
            print(f"Provided image path does not exist: {image}")
            return
        # Copy the image to the save path
        shutil.copy(image, save_path)
    elif isinstance(image, Image.Image):
        # Save the PIL Image object to the save path
        image.save(save_path)
    else:
        print("Invalid image format. Provide a file path or a PIL Image object.")
        return

    print(f"Image saved/updated successfully: {save_path}")
    
# Country codes mapping
COUNTRY_CODES = {
    'IE': ['1E', '11', 'FE', 'IE'],
    'DE': ['OE', 'DE', 'DB'],
    'CZ': ['CZ', 'GZ', 'TZ'],
    'NL': ['NL', 'ML', 'PL'],
    'BE': ['BE', '8E', '88'],
    'DK': ['OK', 'DK', 'D7', 'D2', 'DX']
}

def validate_country_code(detected_code):
    match = re.match(r'^([A-Za-z]{2})(\d+)', detected_code)
    
    if match:
        potential_code = match.group(1)
        remaining_code = match.group(2)
        potential_code = potential_code.upper()
        
        for official_code, variations in COUNTRY_CODES.items():
            if potential_code == official_code or potential_code in variations:
                return official_code, remaining_code
                
    return None, detected_code

def preprocess_image(img):

    img_gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    img_resized = cv2.resize(img_gray, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)
    
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    ctrs_img = clahe.apply(img_resized)
    
    _, binary_img = cv2.threshold(ctrs_img, 160, 255, cv2.THRESH_BINARY)
    
    kernel = np.ones((2, 2), np.uint8)
    processed_img = cv2.morphologyEx(binary_img, cv2.MORPH_CLOSE, kernel)
    
    dilated_img = cv2.dilate(processed_img, kernel, iterations=1)
    
    return dilated_img

def extract_text_from_image(processed_img):
    ocr = PaddleOCR(use_angle_cls=True, lang='en',use_gpu = False)
    results = ocr.ocr(processed_img, cls=False)
    
    detected_texts = []
    # Check if results is None or empty
    if results and results[0]:  # Add null check
        for (bbox, (text, confidence)) in results[0]:
            clean_text = text.replace(" ", "")
            if clean_text:
                detected_texts.append(clean_text)
    
    return detected_texts, confidence

def find_closest_matches(img_bytes, levenshtein_threshold=2, excel_path="Data/CowInfo.xlsx"):

    verification_results = []
    
    # Check if verification data exists
    if not os.path.exists(excel_path):
        return [], [{'match_type': 'error', 'message': f'Excel file not found: {excel_path}'}]
    
    # Read and preprocess verification data
    verification_df = pd.read_excel(excel_path).iloc[:, 8:]
    verification_df = verification_df.dropna(axis=0, thresh=len(verification_df.columns) * 0.5)
    verification_df.columns = [f"Veld{i+1}" if i > 0 else 'LopendTotaal_V' for i in range(len(verification_df.columns))]
    
    values_to_remove = [
        'LopendTotaal_V', 'Veld02', 'Veld03', 'Veld04', 'Veld05',
        'Veld06', 'Veld07', 'Veld08', 'Veld09', 'Veld10',
        'Veld11', 'Veld12', 'Veld13', 'Veld14', 'Veld15'
    ]
    verification_df = verification_df[~verification_df.isin(values_to_remove).any(axis=1)]
    try:
        nparr = np.frombuffer(img_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            return [], [{'match_type': 'error', 'message': 'Failed to decode image bytes'}]
    except Exception as e:
        return [], [{'match_type': 'error', 'message': f'Failed to convert image bytes: {str(e)}'}]
    try:
        processed_img = preprocess_image(img)
    except Exception as e:
        return [], [{'match_type': 'error', 'message': f'Image preprocessing failed: {str(e)}'}]
    
    try:
        detected_texts, confidence = extract_text_from_image(processed_img)  # Ensure `extract_text_from_image` works with images
    except Exception as e:
        return [], [{'match_type': 'error', 'message': f'OCR processing failed: {str(e)}'}]
    
    # If no text was detected, return early
    if not detected_texts:
        return [], [{'match_type': 'warning', 'message': 'No text detected in image'}]
    
    country_codes = []
    unique_codes = []
    work_numbers = []
    
    for text in detected_texts:
        validated_code, unique_code = validate_country_code(text)
        if validated_code:
            country_codes.append(validated_code)
        if unique_code:
            unique_codes.append(unique_code)
        if text.isdigit() and 4 <= len(text) <= 6:
            work_numbers.append(text)
    
    if country_codes and work_numbers and unique_codes:
        for country_code in country_codes:
            for unique_code in unique_codes:
                for work_number in work_numbers:
                    full_tag = f"{country_code}0{unique_code}{work_number}"
                    veld4_matches = verification_df[verification_df['Veld4'] == full_tag]
                    if veld4_matches.empty:
                        full_tag = f"{country_code}{unique_code}{work_number}"
                        veld4_matches = verification_df[verification_df['Veld4'] == full_tag]
                    if not veld4_matches.empty:
                        verification_results.append({
                            'match_type': 'full_tag',
                            'matched_value': full_tag
                        })
    
    for work_number in work_numbers:
        veld3_matches = verification_df[verification_df['Veld3'].str.contains(work_number, na=False)]
        if not veld3_matches.empty:
            verification_results.append({
                'match_type': 'work_number',
                'matched_value': work_number
            })
            save_or_update_cow(work_number, img, confidence)
    
    for text in detected_texts:
        if not any(result['matched_value'] == text for result in verification_results):
            valid_numbers = verification_df["Veld2"].dropna().astype(str).values.flatten()
            
            closest_distance = min(levenshtein_distance(text, num) for num in valid_numbers)
            closest_matches = [
                num for num in valid_numbers
                if levenshtein_distance(text, num) == closest_distance
            ]
            
            if closest_distance <= levenshtein_threshold:
                verification_results.append({
                    'match_type': 'levenshtein',
                    'original_text': text,
                    'closest_matches': closest_matches,
                    'distance': closest_distance
                })
    
    return detected_texts, verification_results
def process_image_with_cows_and_tags(image_name):
    try:
        # Check if input image exists
        if not os.path.exists(image_name):
            return "Error: Input image not found"

        # Detect objects (cows and tags)
        all_cords = model.predict(image_name, confidence=50, overlap=30).json()
        model.predict(image_name, confidence=50, overlap=30).save(f"labeled_images/prediction.jpg")

        # Read the input image
        image = cv2.imread(image_name)
        if image is None:
            return "Error: Could not read input image"

        # Separate detections into cows and tags
        cows = [obj for obj in all_cords["predictions"] if obj['class'] == "cow"]
        tags = [obj for obj in all_cords["predictions"] if obj['class'] == "0"]

        cropped_cows = []
        cropped_tags = []

        # Crop cow images
        for idx, cow in enumerate(cows, 1):
            roi_x = int(cow['x'] - cow['width'] / 2)
            roi_y = int(cow['y'] - cow['height'] / 2)
            roi_width = int(cow['width'])
            roi_height = int(cow['height'])

            # Add boundary checks
            roi_x = max(0, roi_x)
            roi_y = max(0, roi_y)
            roi_width = min(roi_width, image.shape[1] - roi_x)
            roi_height = min(roi_height, image.shape[0] - roi_y)

            roi = image[roi_y:roi_y + roi_height, roi_x:roi_x + roi_width]
            if roi is not None and roi.size > 0:
                cropped_cows.append(roi)

        # Match tags to cows based on overlap
        for tag in tags:
            tag_center_x = tag['x']
            tag_center_y = tag['y']
            matched_cow = None
            max_confidence = 0

            for cow in cows:
                # Check if the tag is within the bounds of the cow
                cow_x1 = cow['x'] - cow['width'] / 2
                cow_y1 = cow['y'] - cow['height'] / 2
                cow_x2 = cow['x'] + cow['width'] / 2
                cow_y2 = cow['y'] + cow['height'] / 2

                if cow_x1 <= tag_center_x <= cow_x2 and cow_y1 <= tag_center_y <= cow_y2:
                    if cow['confidence'] > max_confidence:
                        matched_cow = cow
                        max_confidence = cow['confidence']

            if matched_cow:
                # Crop the tag image
                roi_x = int(tag['x'] - tag['width'] / 2)
                roi_y = int(tag['y'] - tag['height'] / 2)
                roi_width = int(tag['width'])
                roi_height = int(tag['height'])

                # Add boundary checks
                roi_x = max(0, roi_x)
                roi_y = max(0, roi_y)
                roi_width = min(roi_width, image.shape[1] - roi_x)
                roi_height = min(roi_height, image.shape[0] - roi_y)

                roi = image[roi_y:roi_y + roi_height, roi_x:roi_x + roi_width]
                if roi is not None and roi.size > 0:
                    cropped_tags.append((roi, matched_cow['detection_id']))

        return cropped_cows, cropped_tags

    except Exception as e:
        return f"Error: {str(e)}"
def scanImage(image_name):
    log = []
    print("Started")

    try:
        # Check if input image exists
        if not os.path.exists(image_name):
            return "Error: Input image not found"

        # Detect tags
        allCords = model.predict(image_name, confidence=50, overlap=30).json()
        model.predict(image_name, confidence=50, overlap=30).save(f"labeled_images\prediction.jpg") 
        # Read the input image
        image = cv2.imread(image_name)
        if image is None:
            return "Error: Could not read input image"

        # Process each detection
        cropped_images = []
        for idx, cordinates in enumerate(allCords["predictions"], 1):
            try:
                roi_x = int(cordinates['x'] - cordinates['width'] / 2)
                roi_y = int(cordinates['y'] - cordinates['height'] / 2)
                roi_width = int(cordinates['width'])
                roi_height = int(cordinates['height'])

                # Add boundary checks
                roi_x = max(0, roi_x)
                roi_y = max(0, roi_y)
                roi_width = min(roi_width, image.shape[1] - roi_x)
                roi_height = min(roi_height, image.shape[0] - roi_y)

                roi = image[roi_y:roi_y+roi_height, roi_x:roi_x+roi_width]
                if roi is not None and roi.size > 0:
                    cropped_images.append(roi)
                else:
                    log.append(f"Warning: Empty ROI for detection {idx}")
            except Exception as e:
                log.append(f"Warning: Failed to process detection {idx}: {str(e)}")
                continue

        if not cropped_images:
            log.append("Warning: No valid cropped images found")

        # Process each cropped image
        for idx, cropped_image in enumerate(cropped_images, 1):
            try:
                # Convert cropped image to in-memory format if required by downstream functions
                _, buffer = cv2.imencode('.jpg', cropped_image)
                cropped_image_bytes = np.frombuffer(buffer, dtype=np.uint8)
                
                # Pass in-memory image data to OCR or other processing functions
                detected_texts, results = find_closest_matches(cropped_image_bytes)
                
                for result in results:
                    if result['match_type'] == 'error':
                        log.append(f"Error processing cropped image {idx}: {result['message']}")
                    elif result['match_type'] == 'warning':
                        log.append(f"Warning for cropped image {idx}: {result['message']}")
                    elif result['match_type'] == 'full_tag':
                        log.append(f"Found full tag match: {result['matched_value']}")
                    elif result['match_type'] == 'work_number':
                        log.append(f"Found work number match: {result['matched_value']}")
                    elif result['match_type'] == 'levenshtein':
                        matches_str = ', '.join(result['closest_matches'])
                        log.append(f"Found similar matches for '{result['original_text']}': {matches_str} (distance: {result['distance']})")
            except Exception as e:
                log.append(f"Error processing cropped image {idx}: {str(e)}")
                continue

        # Process hair color
        try:
            result = model_hair.predict(image_name, confidence=50, overlap=30).json()
            if result["predictions"]:
                for prediction in result["predictions"]:
                    label = prediction['class']
                    confidence = prediction['confidence']
                    log.append(f"Detected Hair Color: {label} with Confidence: {confidence:.2f}")
            else:
                log.append("No hair color detected")
        except Exception as e:
            log.append(f"Error in hair color detection: {str(e)}")

    except Exception as e:
        log.append(f"Critical error in image processing: {str(e)}")

    print("\n".join(log))
    return "\n".join(log)


# FastAPI endpoints
@app.post("/upload/")
async def upload_image(file: UploadFile = File(...)):
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    temp_image_name = "temp_image.jpg"
    cv2.imwrite(temp_image_name, image)
    
    log = scanImage(temp_image_name)
    os.remove(temp_image_name)
    
    return {"message": "Image processed successfully", "log": log}

class Item(BaseModel):
    value: str

@app.post("/uploadString/")
async def upload_imageString(request: Request):
    body = await request.body()
    data = body.decode("utf-8")
    image = data[58:-3]  # Remove prefix and suffix

    response = urllib.request.urlopen(image)
    with open('image2.jpg', 'wb') as f:
        f.write(response.file.read())

    log = scanImage("image2.jpg")

    # Get encoded labeled image
    with open("labeled_images/prediction.jpg", "rb") as image_file:
        encoded_string = base64.b64encode(image_file.read())

    # Cleanup
    for directory in ['labeled_images', 'cropped_images']:
        files = glob.glob(f'{directory}/*')
        for f in files:
            os.remove(f)
    os.remove("image2.jpg")

    return {"message": log, "labeled_image": encoded_string}

