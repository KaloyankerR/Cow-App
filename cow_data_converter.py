import pandas as pd
import json
import os

file_path = 'CowInfo.xlsx'
image_directory = '/fastapi-backend/saved_images'
output_json_path = 'cow_data.json'

cow_data = pd.ExcelFile(file_path)
logo_sheet_data = cow_data.parse("Logo")
cleaned_data = logo_sheet_data.dropna(how='all').dropna(axis=1, how='all')

column_names = cleaned_data.iloc[0]
processed_data = cleaned_data[1:]
processed_data.columns = column_names

json_objects = []

for _, row in processed_data.iterrows():
    cow_info = {str(column): row[column] for column in processed_data.columns}
    tag = str(row["Veld02_V"]).strip()
    image_path = os.path.join(image_directory, f"{tag}.jpg")
    if os.path.exists(image_path):
        cow_info["imagePath"] = image_path
    else:
        cow_info["imagePath"] = os.path.join(image_directory, "default.jpg")
    json_objects.append(cow_info)

with open(output_json_path, 'w') as file:
    json.dump(json_objects, file, indent=4, default=str)

print(f"JSON file with image paths saved to {output_json_path}")
