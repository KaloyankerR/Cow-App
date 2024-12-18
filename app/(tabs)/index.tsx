import {
  Image,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { uploadImageString } from "@/api/imageSend";
import styles from "../styles/HomeScreen.styles";
import { ScrollView } from "react-native-gesture-handler";

export default function HomeScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [text, setText] = useState<string | null>(
    "🐮 Moo-tastic! Image Uploaded! Detecting breed and tag information..."
  );
  const [cowDetails, setCowDetails] = useState([]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
    });

    if (!result.canceled) {
      setText(
        "🐮 Moo-tastic! Image Uploaded! Detecting breed and tag information..."
      );
      setImage("data:image/jpeg;base64," + result.assets[0].base64);

      const response = {
        data: {
          labeled_image: "data:image/jpeg;base64," + result.assets[0].base64,
          message: "Detection successful!",
          detected_cows: [
            { tag: "12345", breed: "Holstein", age: "5 years", country: "Netherlands" },
            { tag: "67890", breed: "Jersey", age: "3 years", country: "USA" },
          ],
        },
      };

      setImage(response.data.labeled_image);
      setCowDetails(response.data.detected_cows); 
      setText(response.data.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Cow Identifier for</Text>
        <Text style={styles.header}>DAP Thewi</Text>
        <Text style={styles.subheader}>
          Upload an image to identify your cow by tag and color breed
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Button's */}
        <View style={styles.buttonContainer}>
          
          <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
            <Text style={styles.buttonText}>📷 Upload Image</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
            <Text style={styles.buttonText}>🎥 Upload Video</Text>
          </TouchableOpacity>
        </View>
        


        {image && <Image source={{ uri: image }} style={styles.image} />}
        {image && <Text style={styles.imageText}>{text}</Text>}

        {cowDetails.length > 0 && (
          <View style={styles.detailsContainer}>
            <Text style={styles.detailsTitle}>Detected Cows:</Text>
            {cowDetails.map((cow, index) => (
              <View key={index} style={styles.cowDetailBox}>
                <Text style={styles.detail}>🐮 Tag: {cow.tag}</Text>
                <Text style={styles.detail}>📅 Age: {cow.age}</Text>
                <Text style={styles.detail}>🌍 Country: {cow.country}</Text>
                <Text style={styles.detail}>🐄 Breed: {cow.breed}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const localStyles = StyleSheet.create({
  detailsContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#f8f8f8",
    borderRadius: 10,
    width: "100%",
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  cowDetailBox: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  detail: {
    fontSize: 16,
    marginVertical: 2,
  },
});
