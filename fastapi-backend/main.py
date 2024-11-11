import base64
from binascii import a2b_base64
import glob
from Levenshtein import distance as levenshtein_distance
import pandas as pd
from typing import Dict
import easyocr
from fastapi import FastAPI, File, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from rich import _console
from roboflow import Roboflow
from pydantic import BaseModel
import urllib.request
import cv2
import numpy as np
import os

import urllib

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace "*" with specific domains for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
rf = Roboflow(api_key="qX0aQQBnqLywhVFmlU4C")
project = rf.workspace().project("cows-gyup1")
model = project.version(2).model

rf2 = Roboflow(api_key="IxBbH3p5wJVfT83GdUsz")
project2 = rf2.workspace().project("cow-hair-colors")
model_hair = project2.version(1).model

reader = easyocr.Reader(['en'])
def preprocess_image(img_path):
        """Preprocess the image to enhance OCR readability."""
        img = cv2.imread(img_path, cv2.IMREAD_GRAYSCALE)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
        ctrs_img = clahe.apply(img)
        _, binary_img = cv2.threshold(ctrs_img, 150, 255, cv2.THRESH_BINARY)
        kernel = np.ones((2,2), np.uint8)
        processed_img = cv2.morphologyEx(binary_img, cv2.MORPH_CLOSE, kernel)

        
        return img

def extract_text_from_image(processed_img):
        """Extract text from the processed image using OCR."""
        result = reader.readtext(processed_img, detail=1)
        detected_texts = []

        for (bbox, text, confidence) in result:
            (t_left, t_right, b_right, b_l) = bbox
            cv2.polylines(processed_img, [np.array([t_left, t_right, b_right, b_l], np.int32)], isClosed=True, color=(0,255,0), thickness=2)
            
            # Clean up text (remove spaces and any special characters)
            clean_text = text.replace(" ", "")
            detected_texts.append(clean_text)

        
        return detected_texts

def find_closest_matches(log,img_path, levenshtein_threshold=2, excel_path="Data/CowInfo.xlsx"):
        """Preprocess the image, extract text, and find closest matches in the database."""
        
        # Load Excel sheet with verification data
        verification_df = pd.read_excel(excel_path).iloc[:, 8:]
        verification_df = verification_df.dropna(axis=0, thresh=len(verification_df.columns) * 0.5)
        verification_df.columns = [f"Veld{i+1}" if i > 0 else 'LopendTotaal_V' for i in range(len(verification_df.columns))]

        # Remove unnecessary values
        values_to_remove = [
            'LopendTotaal_V', 'Veld02_V', 'Veld03_V', 'Veld04_V', 'Veld05_V', 
            'Veld06_V', 'Veld07_V', 'Veld08_V', 'Veld09_V', 'Veld10_V', 
            'Veld11_V', 'Veld12_V', 'Veld13_V', 'Veld14_V', 'Veld15_V'
        ]
        verification_df = verification_df[~verification_df.isin(values_to_remove).any(axis=1)]

        # Focus only on "Veld2" column for searching
        valid_numbers = verification_df["Veld2"].dropna().astype(str).values.flatten()

        # Preprocess image and extract text
        processed_img = preprocess_image(img_path)
        detected_texts = extract_text_from_image(processed_img)

        results = {}

        # Process each detected text
        for detected_text in detected_texts:
            print(f"Detected text: '{detected_text}'")

            # Check for exact match
            if detected_text in valid_numbers:
                print(f"Exact match found for '{detected_text}'")
                log.append(f"Exact match found for '{detected_text}'")
                results[detected_text] = [detected_text]  # Return exact match as only result
            else:
                # Calculate closest match using Levenshtein distance
                closest_distance = min(levenshtein_distance(detected_text, num) for num in valid_numbers)
                closest_matches = [num for num in valid_numbers if levenshtein_distance(detected_text, num) == closest_distance]
                
                # Check if closest match is within the threshold
                if closest_distance <= levenshtein_threshold:
                    if len(closest_matches) == 1 and closest_matches[0] == detected_text:
                        print(f"Single close match found for '{detected_text}': {closest_matches[0]} with distance {closest_distance}")
                        log.append('\n' + f"Single close match found for '{detected_text}': {closest_matches[0]} with distance {closest_distance}")
                        results[detected_text] = closest_matches
                    else:
                        print(f"Multiple matches found for '{detected_text}': {closest_matches} with distance {closest_distance}")
                        log.append(f"Multiple matches found for '{detected_text}': {closest_matches} with distance {closest_distance}")
                        results[detected_text] = closest_matches
                else:
                    print(f"No close match found for '{detected_text}' (closest was '{closest_matches[0]}' with distance {closest_distance})")

        return results


def scanImage(image_name):
    #Location
    log = []
    print("Started")

    allCords = model.predict(image_name, confidence=50, overlap=30).json() #finds all tags and gives coordinates for all of them
    model.predict(image_name, confidence=50, overlap=30).save(f"labeled_images\prediction.jpg") #if you want to save the photo wiht labesl on it. 

    image = cv2.imread(image_name)

    index = 1
    for cordinates in allCords["predictions"] :
            roi_x = int(cordinates['x'] - cordinates['width'] / 2)
            roi_y = int(cordinates['y'] - cordinates['height'] / 2)
            roi_width = int(cordinates['width'])
            roi_height = int(cordinates['height'])


            roi = image[roi_y:roi_y+roi_height, roi_x:roi_x+roi_width] #crops image

            # Check if roi is empty before saving
            if roi is not None and roi.size > 0:
                cv2.imwrite(f"cropped_images\\cropped{index}.jpg", roi) # saves image
            else:
                print(f"Error: ROI is empty for index")

            #note that all the images that are saved have different sizes
            index = index + 1

    #Reading
    cropped_images = []

    excel_path = "Data/CowInfo.xlsx"

    verification_df = pd.read_excel(excel_path)

    verification_df = verification_df.iloc[:, 8:]
# Removes NaN values if the row contains >50% NaN values.
    thresh = len(verification_df.columns) * 0.5

    verification_df = verification_df.dropna(axis=0, thresh=thresh)

    # Renaming the column's 
    n_column_names = []
    for i in range(len(verification_df.columns)):
        n_column_names.append(f"Veld{i+1}")


    verification_df.columns = n_column_names
    # Making sure to remove the first column to the correct answer.
    verification_df = verification_df.rename(columns={'Veld1':'LopendTotaal_V'})

    values_to_remove = ['LopendTotaal_V', 'Veld02_V', 'Veld03_V', 'Veld04_V', 'Veld05_V', 'Veld06_V', 'Veld07_V', 'Veld08_V', 'Veld09_V', 'Veld10_V', 'Veld11_V', 'Veld12_V', 'Veld13_V', 'Veld14_V', 'Veld15_V']


    # Removing the values "LopendTotaal_V". This is placed throughout the excel to indicate a sort of seperation. We do not need this! So we're removing this!
    verification_df = verification_df[~verification_df.isin(values_to_remove).any(axis=1)]

    for filename in glob.glob('labeled_images/*'):
        cropped_images.append(filename)
    
    for image in cropped_images:
        img = cv2.imread(image, cv2.IMREAD_GRAYSCALE)
        result = reader.readtext(img, detail=1)

        detected_txt = []

        for (bbox, text, confidence) in result:
            (t_left, t_right, b_right, b_l) = bbox

            cv2.polylines(img, [np.array([t_left, t_right, b_right, b_l], np.int32)], isClosed=True, color=(0,255,0), thickness=2)
            # cv2.putText(img, text, (t_left[0], t_left[1]- 10), cv2.FONT_HERSHEY_SIMPLEX, 0.3, (0,255,0), 1)
            # Perhaps we should consider double checking values. 
            # Example: 0iz? shouldn't be an value which will be in the database. Especially '?'
            clr_txt = text.replace(" ", "")
            detected_txt.append(clr_txt)
    
    

    print(image)
    results = find_closest_matches(log,image)

    print("Results:", results)

    #Hair color
    img_path = 'labeled_images\\prediction.jpg'

    img = cv2.imread(img_path)

    label = ""
    if img is None:
        print("Error: Could not read the image.")
    else:
        # Perform prediction using the model
        result = model_hair.predict(img_path, confidence=50, overlap=30).json()

        if result["predictions"]:
            img_with_boxes = img.copy()  # Copy of the original image to draw all bounding boxes
            
            for prediction in result["predictions"]:
                # Extract prediction details
                label = prediction['class']
                confidence = prediction['confidence']
                x, y = int(prediction['x']), int(prediction['y'])
                width, height = int(prediction['width']), int(prediction['height'])
                
                # Print detected hair color and confidence for each prediction
                print(f"Detected Hair Color: {label} with Confidence: {confidence:.2f}")
                
                # Draw bounding box on the detected area
                cv2.rectangle(img_with_boxes, (x, y), (x + width, y + height), (0, 255, 0), 3)
                
                # Add detected color label and confidence
                label_text = f"{label} ({confidence * 100:.1f}%)"
                cv2.putText(img_with_boxes, label_text, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2, cv2.LINE_AA)
            

        else:
            print("No hair color detected.")

    for eartag, closest_matches in results.items():
    # Ensure eartag is a string for consistency
        eartag = str(eartag)
        
        # Check if the eartag matches any entry in the verification dataset
        matching_rows = verification_df[verification_df['Veld2'] == eartag]

        # If an exact match is found for the eartag
        if not matching_rows.empty:
            registered_hair_color = matching_rows.iloc[0]['Veld12']
            print(f"Eartag {eartag} found with registered hair color: {registered_hair_color}")
            
        else:
            print(f"Eartag {eartag} not found in the dataset.")

        # Now check the closest matches from the results dictionary
        for match in closest_matches:
            match = str(match)  # Ensure match is also a string
            
            # Check if the match exists in the verification dataset
            matching_row = verification_df[verification_df['Veld2'] == match]
            
            if not matching_row.empty:
                registered_hair_color = matching_row.iloc[0]['Veld12']
                print(f"Closest match {match} found with registered hair color: {registered_hair_color}")

                # Now check the detected color (assuming 'label' is the detected color in the image)
                if label.lower() == str(registered_hair_color).lower():
                    print(f"Detected hair color '{label}' matches the registered hair color for eartag {match}.")
                    log.append(f"Detected hair color '{label}' matches the registered hair color for eartag {match}.")
                    
                else:
                    print(f"Detected hair color '{label}' does not match the registered hair color for eartag {match}.")
                    log.append(f"Detected hair color '{label}' does not match the registered hair color for eartag {match}.")
                    
            else:
                print(f"Closest match {match} not found in the dataset.")
    print(log)
    complete_log = '\n'.join(log)
    return complete_log           



os.makedirs("cropped", exist_ok=True)

@app.post("/upload/")
async def upload_image(file: UploadFile = File(...)):
    print("Here")
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    temp_image_name = "temp_image.jpg"
    
    scanImage(temp_image_name)

    return {"message": "Image processed successfully", "cropped_images_count":"1"}

class Item(BaseModel):
    value: str


@app.post("/uploadString/")
async def upload_imageString(request: Request):
    
    body = await request.body()  # Raw bytes
    data = body.decode("utf-8")
    image = data[58:]
    image = image[:-3]

    response = urllib.request.urlopen(image)
    with open('image2.jpg', 'wb') as f:
        f.write(response.file.read())

    log = scanImage("image2.jpg")
    print("Succses")

    encoded_string = ""

    with open("labeled_images\\prediction.jpg", "rb") as image_file:
        encoded_string = base64.b64encode(image_file.read())

    files = glob.glob('/labeled_images/*')
    for f in files:
        os.remove(f)

    files2 = glob.glob('/cropped_images/*')
    for f in files2:
        os.remove(f)
    os.remove("image2.jpg")

    return {"message": log, "labeled_image": encoded_string}