import axios from "axios";

export const uploadImage = async (
  uri: string,
  fileName: string
): Promise<void> => {
  const apiUrl = "https://yourapi.com/upload";

  // Convert the image URI to a blob or file
  const formData = new FormData();
  formData.append("file", {
    uri,
    name: fileName,
    type: "image/jpg", // or the MIME type of the selected image
  } as any); // `as any` is used here because TypeScript's FormData types don't recognize the `uri` key

  try {
    const response = await axios.post(apiUrl, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    console.log("Image uploaded:", response.data);
  } catch (error) {
    console.error("Upload failed:", error);
  }
};
