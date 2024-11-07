import axios from "axios";

const BASE_URL = " http://145.93.61.13:8000";

export const uploadImage = async (imageUri: any): Promise<string> => {
  const formData = new FormData();
  formData.append("file", {
    cont: imageUri,
  } as any); // Compatibility workaround for TypeScript and FormData

  try {
    console.log(imageUri);
    const response = await axios.post(`${BASE_URL}/upload/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    // Check if the expected data is present
    if (response.data && response.data.message) {
      return response.data.message;
    } else {
      throw new Error("Unexpected server response structure.");
    }
  } catch (error: any) {
    console.log(imageUri);
    console.error("Error uploading image:", error.message || error);
    throw new Error("Failed to upload image. Please try again later.");
  }
};
