from fastapi import FastAPI, File, UploadFile
from roboflow import Roboflow
import cv2
import numpy as np
import os

app = FastAPI()

rf = Roboflow(api_key="qX0aQQBnqLywhVFmlU4C")
project = rf.workspace().project("cows-gyup1")
model = project.version(2).model

os.makedirs("cropped", exist_ok=True)

@app.post("/upload/")
async def upload_image(file: UploadFile = File(...)):
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    temp_image_name = "temp_image.jpg"
    cv2.imwrite(temp_image_name, image)

    allCords = model.predict(temp_image_name, confidence=50, overlap=30).json()
    model.predict(temp_image_name, confidence=50, overlap=30).save("prediction2.jpg")

    index = 1
    for coordinates in allCords["predictions"]:
        roi_x = int(coordinates['x'] - coordinates['width'] / 2)
        roi_y = int(coordinates['y'] - coordinates['height'] / 2)
        roi_width = int(coordinates['width'])
        roi_height = int(coordinates['height'])

        roi = image[roi_y:roi_y + roi_height, roi_x:roi_x + roi_width]
        cropped_image_name = f"cropped/cropped{index}.jpg"
        cv2.imwrite(cropped_image_name, roi)
        index += 1

    os.remove(temp_image_name)

    return {"message": "Image processed successfully", "cropped_images_count": index - 1}
