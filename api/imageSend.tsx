import axios from "axios";

const BASE_URL = " http://145.93.61.13:8000";

export const uploadImage = async (file: File): Promise<string> => {
  const formData2 = new FormData();
  formData2.append("file", file); // Compatibility workaround for TypeScript and FormData
  console.log(JSON.stringify(file));
  try {
    console.log("Here");
    console.log(formData2);
    const response = await axios.post(`${BASE_URL}/upload/`, formData2, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    console.log("Here2");
    // Check if the expected data is present
    if (response.data && response.data.message) {
      return response.data.message;
    } else {
      throw new Error("Unexpected server response structure.");
    }
  } catch (error: any) {
    //console.log(imageUri);
    console.error("Error uploading image:", error || error);
    throw new Error("Failed to upload image. Please try again later.");
  }
};

export const uploadImage2 = async (uri: string): Promise<string> => {
  const formData2 = new FormData();
  formData2.append("file", {
    uri: uri,
    name: "test.jpg",
    type: "image/jpeg",
  }); // Compatibility workaround for TypeScript and FormData
  try {
    console.log("Here");
    console.log(formData2);
    const response = await axios.post(`${BASE_URL}/upload/`, formData2, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    console.log("Here2");
    // Check if the expected data is present
    if (response.data && response.data.message) {
      return response.data.message;
    } else {
      throw new Error("Unexpected server response structure.");
    }
  } catch (error: any) {
    //console.log(imageUri);
    console.error("Error uploading image:", error || error);
    throw new Error("Failed to upload image. Please try again later.");
  }
};
