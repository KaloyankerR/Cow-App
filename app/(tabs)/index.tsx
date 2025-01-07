import {
  Image,
  StyleSheet,
  Platform,
  View,
  Button,
  PermissionsAndroid,
  Text,
  TouchableOpacity,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as ImagePicker from "expo-image-picker";
import { HelloWave } from "@/components/HelloWave";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useState } from "react";
import { uploadImage, uploadImage2, uploadImageString } from "@/api/imageSend";
import ImagePickerReact from "react-native-image-picker";
import styles from "../styles/HomeScreen.styles";
import { ScrollView } from "react-native-gesture-handler";

export default function HomeScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [text, setText] = useState<string | null>(
    "🐮 Moo-tastic! Image Uploaded! Detecting breed and tag information..."
  );

  const convertToFile = async (
    uri: string,
    filename: string
  ): Promise<File> => {
    console.log("----------");
    console.log(uri);
    console.log("No");
    const response = await fetch(uri);
    console.log("Yes");
    console.log(response);
    const blob = await response.blob();
    console.log(blob);

    // Create and return a File object
    return new File([blob], filename, {
      type: blob.type,
    });
  };
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"], // Choose only images
      base64: true,
    });

    if (!result.canceled) {
      setText(
        "🐮 Moo-tastic! Image Uploaded! Detecting breed and tag information..."
      );
      setImage("data:image/jpeg;base64," + result.assets[0].base64);
      //console.log("file");
      //const file = await convertToFile(
      //  "data:image/jpeg;base64," + result.assets[0].base64,
      //  "selected-image.jpg"
      //);
      //await uploadImage(file);
      console.log("Imagw");
      console.log(result.assets[0].base64);
      const response = await uploadImageString(
        "data:image/jpeg;base64," + result.assets[0].base64
      );
      setImage("data:image/jpeg;base64," + response.data.labeled_image);
      setText(response.data.message);
      console.log(response.data.message);
    }
  };

  const handleChoosePhoto = async () => {
    const options = {
      noData: true,
    };
    let res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
    });
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
        <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
          <Text style={styles.buttonText}>🐄 Upload Cow Image</Text>
        </TouchableOpacity>

        {image && <Image source={{ uri: image }} style={styles.image} />}
        {image && <Text style={styles.imageText}>{text}</Text>}
      </ScrollView>
    </View>
  );
}
