import base64
from fastapi import FastAPI, File, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from roboflow import Roboflow
from pydantic import BaseModel
import cv2
import numpy as np
import os
import shutil
import io
from PIL import Image, ExifTags
import glob
import pandas as pd
import urllib
import urllib.request
from paddleocr import PaddleOCR
from Levenshtein import distance as levenshtein_distance
import re
import datetime
import json
from typing import List, Dict, Tuple
from fastapi.staticfiles import StaticFiles
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.mount("/images", StaticFiles(directory="saved_images"), name="images")
# Roboflow setup
rf2 = Roboflow(api_key="IxBbH3p5wJVfT83GdUsz")
project2 = rf2.workspace().project("cow-hair-colors")
model_hair = project2.version(1).model

#rf = Roboflow(api_key="qX0aQQBnqLywhVFmlU4C")
rf = Roboflow(api_key="s4CoCObGq01fLML1N0Ej")
#project = rf.workspace().project("cows-gyup1")
project = rf.workspace().project("cow-video-detection-l7zod")
model = project.version(2).model
ocr = PaddleOCR(use_angle_cls=True, lang='en',use_gpu = False)
verification_df = None

def track_and_process_video(video_path: str):
    try:
        # Initialize tracker - using modern OpenCV tracking API
        tracker = cv2.TrackerKCF.create()  # or you can use cv2.TrackerCSRT.create()
        tracking_active = False
        current_bbox = None
        
        cap = cv2.VideoCapture(video_path)
        all_detections = []  # Store all detection logs
        all_labeled_frames = []  # Store all labeled frames
        frame_count = 0
    except Exception as e:
                print(f"error in the Initialize tracker segment: {str(e)}")
    
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
            
        should_process = False
        
        if tracking_active:
            success, bbox = tracker.update(frame)
            if success:
                # Check if tracked object moved significantly
                if current_bbox is None or has_significant_movement(bbox, current_bbox):
                    should_process = True
                    current_bbox = bbox
            else:
                tracking_active = False
                should_process = True
        else:
            should_process = True
        
        if should_process:
            try:
                # Save frame temporarily
                temp_frame_path = f'temp_frame_{frame_count}.jpg'
                cv2.imwrite(temp_frame_path, frame)
                
                # Process frame using existing scanImage
                result = scanImage(temp_frame_path)
                
                if result["message"]:  # If detections were found
                    # Store detection results
                    all_detections.append({
                        'frame_number': frame_count,
                        'detections': result["message"]
                    })
                    
                    # Store labeled frame
                    all_labeled_frames.append({
                        'frame_number': frame_count,
                        'labeled_image': result["labeled_image"]
                    })
                    
                    # Initialize tracking if not active
                    if not tracking_active:
                        # Assuming your process_image_with_cows_and_tags returns bounding boxes
                        cows, _ = process_image_with_cows_and_tags(temp_frame_path)
                        if cows:
                            tracker = cv2.TrackerKCF.create()  # Create new tracker instance
                            tracker.init(frame, cows[0])
                            tracking_active = True
                            current_bbox = cows[0]
                
            except Exception as e:
                print(f"Error processing frame {frame_count}: {str(e)}")
                
        frame_count += 1
    
    cap.release()
    return all_detections, all_labeled_frames

def has_significant_movement(bbox1, bbox2, threshold=30):
    """Check if there's significant movement between two bounding boxes"""
    center1 = (bbox1[0] + bbox1[2]/2, bbox1[1] + bbox1[3]/2)
    center2 = (bbox2[0] + bbox2[2]/2, bbox2[1] + bbox2[3]/2)
    distance = np.sqrt((center1[0] - center2[0])**2 + (center1[1] - center2[1])**2)
    return distance > threshold

def resize_image(input_path,output_path ,max_width, max_height):
    with Image.open(input_path) as img:
        # Normalize EXIF orientation
        try:
            for orientation in ExifTags.TAGS.keys():
                if ExifTags.TAGS[orientation] == "Orientation":
                    break
            exif = img._getexif()
            if exif is not None:
                orientation_value = exif.get(orientation, None)
                if orientation_value == 3:  # Rotated 180 degrees
                    img = img.rotate(180, expand=True)
                elif orientation_value == 6:  # Rotated 270 degrees counter-clockwise
                    img = img.rotate(270, expand=True)
                elif orientation_value == 8:  # Rotated 90 degrees counter-clockwise
                    img = img.rotate(90, expand=True)
        except Exception as e:
            print(f"Warning: Could not process EXIF orientation due to {e}")

        # Get corrected dimensions
        width, height = img.size
    

        # Determine the orientation and appropriate scaling factor
        if width > height:  # Landscape orientation
            max_width=2048
            scaling_factor = min(max_width / width, max_height / height)
        else:  # Portrait orientation
            max_height = 2048
            scaling_factor = min(max_height / height, max_width / width)

        # Calculate new dimensions while preserving aspect ratio
        new_width = int(width * scaling_factor)
        new_height = int(height * scaling_factor)

        # Resize the image
        img = img.resize((new_width, new_height), Image.LANCZOS)
        img.save(output_path)
        return output_path

def save_or_update_cow(work_number, cow_image_bytes, confidence, save_directory="saved_images"):
    if confidence < 0.85:
        print(f"Confidence {confidence:.2f} is below threshold. Skipping save for {work_number}.")
        return

    # Ensure the save directory exists
    os.makedirs(save_directory, exist_ok=True)

    # Determine the save path
    save_path = os.path.join(save_directory, f"{work_number}.jpg")

    try:
        # Save the image bytes directly to file
        with open(save_path, "wb") as f:
            f.write(cow_image_bytes)
        print(f"Image saved/updated successfully: {save_path}")
    except Exception as e:
        print(f"Error saving image for {work_number}: {str(e)}")
        return
    
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
    results = ocr.ocr(processed_img, cls=False)
    
    detected_texts = []
    # Check if results is None or empty
    if results and results[0]:  # Add null check
        for (bbox, (text, confidence)) in results[0]:
            clean_text = text.replace(" ", "")
            if clean_text:
                detected_texts.append(clean_text)

    return detected_texts, confidence

def find_closest_matches(img_bytes, cow_bytes, levenshtein_threshold=2, excel_path="Data/CowInfo.xlsx"):

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
                    
                    closest_distance = min(levenshtein_distance(full_tag, num) for num in veld4_matches)
                    closest_matches = [
                        num for num in veld4_matches
                        if levenshtein_distance(full_tag, num) == closest_distance
                    ]
                    print(closest_distance)
                    leve = 5
                    if closest_distance <= leve:
                        verification_results.append({
                        'match_type': 'levenshtein',
                        'original_text': text,
                        'closest_matches': closest_matches,
                        'distance': closest_distance
                        })
    
    for work_number in work_numbers:
        veld3_matches = verification_df[verification_df['Veld3'].str.contains(work_number, na=False)]
        if not veld3_matches.empty:
            verification_results.append({
                'match_type': 'work_number',
                'matched_value': work_number
            })
            save_or_update_cow(work_number, cow_bytes, confidence)
    
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
        prediction_result = model.predict(image_name, confidence=50, overlap=30)
        
        all_cords = prediction_result.json()

        prediction_result.save(f"labeled_images/prediction.jpg")
        
        # Read the input image
        image = cv2.imread(image_name)
        if image is None:
            return "Error: Could not read input image"

        # Separate detections into cows and tags
        cows = [obj for obj in all_cords["predictions"] if obj['class'] == "cow"]
        tags = [obj for obj in all_cords["predictions"] if obj['class'] == "0"]

        cropped_cows = []
        matched_pairs = []  # Will store tuples of (tag_image, matched_cow_image)

        # Crop all cow images first
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
                # Store the cropped image with the cow object for matching later
                cow['cropped_image'] = roi

        # Match tags to cows and create pairs
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

                tag_roi = image[roi_y:roi_y + roi_height, roi_x:roi_x + roi_width]
                if tag_roi is not None and tag_roi.size > 0:
                    # Create tuple of (tag_image, matched_cow_image)
                    matched_pairs.append((tag_roi, matched_cow['cropped_image']))

        return cropped_cows, matched_pairs

    except Exception as e:
        return f"Error: {str(e)}"


def scanImage(image_name):
    log = []

    cowData = []

    print("Starting scan process")

    try:
        max_width = 1536
        max_height = 1536
        output_path = 'resized_img.jpg'
        image_name = resize_image(image_name,output_path, max_width, max_height)
        cows, cropped_and_cows = process_image_with_cows_and_tags(image_name)
        # Process each matched pair (tag_image, cow_image)
        for idx, (tag_image, cow_image) in enumerate(cropped_and_cows, 1):
            try:
                # Convert tag image to in-memory format
                _, tag_buffer = cv2.imencode('.jpg', tag_image)
                tag_image_bytes = np.frombuffer(tag_buffer, dtype=np.uint8)
                
                # Convert cow image to in-memory format
                _, cow_buffer = cv2.imencode('.jpg', cow_image)
                cow_image_bytes = np.frombuffer(cow_buffer, dtype=np.uint8)
                
                # Pass both tag and cow image data to processing function
                detected_texts, results = find_closest_matches(tag_image_bytes, cow_image_bytes)
                for result in results:
                    fCow = {}
                    foundCow = {
                        "detectedFrame":"N/A",
                        "Detections": [fCow]
                    }

                    
                    

                    if result['match_type'] == 'error':
                        log.append(f"Error processing tag-cow pair {idx}: {result['message']}")
                    elif result['match_type'] == 'warning':
                        log.append(f"Warning for tag-cow pair {idx}: {result['message']}")
                    elif result['match_type'] == 'full_tag':
                        fCow["Tag"] = result['matched_value']
                        log.append(f"Found full tag match: {result['matched_value']}")
                    elif result['match_type'] == 'work_number':
                        fCow["Tag"] = result['matched_value']
                        log.append(f"Found work number match: {result['matched_value']}")
                        
                    elif result['match_type'] == 'levenshtein':
                        matches_str = ', '.join(result['closest_matches'])
                        fCow["Tag"] = matches_str
                        log.append(f"Found similar matches for '{result['original_text']}': {matches_str} (distance: {result['distance']})")

                    tag = fCow.get('Tag')
                    cowImg= f'./saved_images/{tag}.jpg' 
                    hair_detection(image_name=cowImg, foundCow=fCow)
                if tag != None:
                    cowData.append(foundCow)

            except Exception as e:
                log.append(f"Error processing tag-cow pair {idx}: {str(e)}")

                continue

        

    except Exception as e:
        log.append(f"Critical error in image processing: {str(e)}")


    print(cowData)

    cowData.append(foundCow)
    print("\n".join(log))
    print(cowData)

    return cowData

def hair_detection(image_name, foundCow):
    # Should change this so it gets a part of the cow. Not the whole image just a specific cow.
    # Process hair color
        cowTag = foundCow.get('Tag')
        
        print(f'Received Tag: {cowTag}')
        print(image_name)

        if cowTag == None:
            print("Ignoring non detected tag")
            return
        else: 
            try:
                result = model_hair.predict(image_name, confidence=50, overlap=30).json()
                if result["predictions"]:
                    label = ""
                    confidence = 0

                    for prediction in result["predictions"]:
                        label = prediction['class']
                        confidence = prediction['confidence']
                        # print(f'Color detected: {label} - Confidence: {confidence}')
                        #log.append(f"Detected Hair Color: {label} with Confidence: {confidence:.2f}")         
                        

                    label = label.capitalize()
                    foundCow["Color"] = label #
                    foundCow["Color_Confidence"] =  confidence 
                    foundCow["IMG_URL"] = image_name
                    print(foundCow)
                    getDataFromExcel(foundCow=foundCow)

                else:
                    print("\n\n\nNo hair color detected")                                    
                    foundCow["Color"] = "N/A"
                    foundCow["Color_Confidence"] = 0
                    foundCow["IMG_URL"] = ""
    	
            except Exception as e:
                foundCow["Color"] = "N/A"
                foundCow["Color_Confidence"] = 0
                foundCow["IMG_URL"] = ""
                foundCow["Country"] = "N/A"
                foundCow["Company"] = "N/A"
                foundCow["Birthdate"] = "N/A"
                foundCow["Fulltag"] = "N/A"
                print(f'Error in hair detection: {str(e)}')
                


def getDataFromExcel(foundCow):
    # Reads and cleans excel (again)
    # Then checks if there is a matching row. 
    # Then returns this information to the front end!

    excel_path="Data/CowInfo.xlsx"
    excelData = pd.read_excel(excel_path)
    
    excelData = excelData.iloc[:, 8:]
    columns_to_rename = {
        "Unnamed: 8":"Number",
        "Unnamed: 9":"Worknumber",
        "Unnamed: 10":"Full number",
        "Unnamed: 11":"Full code",
        "Unnamed: 12":"ID",
        "Unnamed: 13":"ID",
        "Unnamed: 14":"Country",
        "Unnamed: 15":"Date",
        "Unnamed: 16":"Company",
        "Unnamed: 17":"Unknown_0",
        "Unnamed: 18":"Unknown_1",
        "Unnamed: 19":"Color",
        "Unnamed: 20":"Date_2",
    }

    excelData = excelData.rename(columns=columns_to_rename)
    
    columns_to_drop = ['Unnamed: 21', "Unnamed: 22", "Date_2", "Unknown_1", "Unknown_0"]
    excelData = excelData.drop(columns=columns_to_drop)

    excelData = excelData[excelData['Number'] != 'LopendTotaal_V']
    
    excelData = excelData.dropna()


    excelData['Worknumber'] = pd.to_numeric(excelData['Worknumber'], errors='coerce')
    excelData['Color'] = excelData['Color'].astype(str)
    
    cTag = foundCow.get('Tag')
    cColor = foundCow.get('Color')
    print(f'Tag we got: {cTag} and color {cColor}')


    foundCowTagInExcel = excelData[excelData['Worknumber'] == int(cTag)]
    foundCowTagInExcel = foundCowTagInExcel[foundCowTagInExcel['Color'] == cColor]
    
    if foundCowTagInExcel.empty == False:
        print("\n\nDope, we found a row. Lets set the info now.")
        print("\n\n")

        row_dict = foundCowTagInExcel.iloc[0].to_dict()
        datetime_obj = pd.to_datetime(row_dict.get('Date'))
        
        print(datetime_obj)
        
        
        foundCow["Country"] = row_dict.get('Country')
        foundCow["Company"] = row_dict.get('Company')
        foundCow["Birthdate"] = datetime_obj
        foundCow["Fulltag"] = row_dict.get('Full code')

        print(foundCow)
        print('\n\n\n')
    else:
        print("\n\nWe couldnt not find anything so far")
        foundCow["Country"] = "N/A"
        foundCow["Company"] = "N/A"
        foundCow["Birthdate"] = "N/A"
        foundCow["Fulltag"] = "N/A"
        pass




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
    cowInfo = [
        log, encoded_string
    ]

    return {"cow_data": log}

def get_unique_frames(video_path: str, threshold=45):
    cap = cv2.VideoCapture(video_path)
    unique_frames = []
    prev_frame = None
    frame_count = 0
    
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
            
        # Convert to grayscale for faster processing
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        if prev_frame is None:
            # Always process first frame
            unique_frames.append((frame_count, frame))
            prev_frame = gray
        else:
            # Calculate difference between current and previous frame
            diff = cv2.absdiff(prev_frame, gray)
            mean_diff = np.mean(diff)
            
            # If significant change detected
            if mean_diff > threshold:
                unique_frames.append((frame_count, frame))
                prev_frame = gray
        
        frame_count += 1
    
    cap.release()
    return unique_frames

    

@app.post("/uploadVideoString/")
async def upload_video_string(request: Request):
    try:
        print("Start processing video")
        body = await request.body()
        data = body.decode("utf-8")
        video_url = data[58:-3]  # Extract the video URL
        
        # Download and save the video
        response = urllib.request.urlopen(video_url)
        with open('video.mp4', 'wb') as f:
            f.write(response.file.read())
        
        # Get unique frames from the video
        unique_frames = get_unique_frames('video.mp4')
        print(f"Unique frames extracted: {len(unique_frames)}")
        
        all_detections = []

        # Process each unique frame
        for frame_number, frame in unique_frames:
            temp_frame_path = f'detected_frame_{frame_number}.jpg'
            cv2.imwrite(temp_frame_path, frame)  # Save frame
            
            try:
                # Process the frame with scanImage
                result_json = scanImage(temp_frame_path)
                
                # Include only frames with valid detections
                if result_json:
                    all_detections.append({
                        'detectedFrame': temp_frame_path,
                        'Detections': result_json
                    })
                else:
                    print(f"Frame {frame_number}: No valid detections")  # Debugging
            
            except Exception as e:
                
                continue

        # Return JSON response with detections and frame path
        
        return {"cow_data": all_detections}
    
    except Exception as e:
        
        return {"error": str(e)}
