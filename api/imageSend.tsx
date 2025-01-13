import axios, { AxiosResponse } from "axios";
import ip_config from "../config";

const BASE_URL = ip_config.API_BASE_URL;
export const uploadVideoString = async (
  value: string
): Promise<AxiosResponse> => {
  try {
    const response = await axios.post(`${BASE_URL}/uploadVideoString/`, {
      headers: { "Content-Type": "text/plain" },
      data: {
        value: value,
      },
    });
    // Check if the expected data is present
    if (response.data) {
      return response;
    } else {
      throw new Error("Unexpected server response structure.");
    }
  } catch (error: any) {
    //console.log(imageUri);
    console.error(error);
    throw new Error("Failed to upload image. Please try again later.");
  }
};
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

export const uploadImageString = async (
  value: string
): Promise<AxiosResponse> => {
  try {
    // console.log("Here");
    // console.log("Here2");
    // console.log(value);
    const response = await axios.post(`${BASE_URL}/uploadString/`, {
      headers: { "Content-Type": "text/plain" },
      data: {
        value: value,
      },
    });
    // console.log("Here3");
    // Check if the expected data is present
    if (response.data) {
      return response;
    } else {
      throw new Error("Unexpected server response structure.");
    }
  } catch (error: any) {
    //console.log(imageUri);
    console.error(error);
    throw new Error("Failed to upload image. Please try again later.");
  }
};

export const uploadImage2 = async (file: FormData): Promise<string> => {
  try {
    // console.log("Here");
    const response = await axios.post(`${BASE_URL}/upload/`, file, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    // console.log("Here2");
    // Check if the expected data is present
    if (response.data && response.data.message) {
      return response.data.message;
    } else {
      throw new Error("Unexpected server response structure.");
    }
  } catch (error: any) {
    console.error("Error uploading image:", error || error);
    throw new Error("Failed to upload image. Please try again later.");
  }
};
