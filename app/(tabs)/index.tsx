import {
  Image,
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { ScrollView } from "react-native-gesture-handler";
import CowDetailCard from "../../components/CowDetailCard";
import styles from "../styles/HomeScreen.styles";

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

  const pickVid = async () => {
    // Placeholder for video upload functionality
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
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
            <Text style={styles.buttonText}>📷 Upload Image</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.uploadButton} onPress={pickVid}>
            <Text style={styles.buttonText} disabled={true}>
              🎥 Upload Video
            </Text>
          </TouchableOpacity>
        </View>

        {image && <Image source={{ uri: image }} style={styles.image} />}
        {image && <Text style={styles.imageText}>{text}</Text>}

        {cowDetails.length > 0 && (
          <View style={styles.detailsContainer}>
            <Text style={styles.detailsTitle}>Detected Cows:</Text>
            {cowDetails.map((cow, index) => (
              <CowDetailCard key={index} cow={cow} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
