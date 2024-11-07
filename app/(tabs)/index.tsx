import { Image, StyleSheet, Platform, View, Button } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { HelloWave } from "@/components/HelloWave";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useState } from "react";
import { uploadImage } from "@/api/imageSend";

export default function HomeScreen() {
  const [image, setImage] = useState<string | null>(null);

  const convertToFile = async (
    uri: string,
    filename: string
  ): Promise<File> => {
    const response = await fetch(uri);
    const blob = await response.blob();

    // Create and return a File object
    return new File([blob], filename, {
      type: blob.type,
    });
  };
  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // Choose only images
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      const file = await convertToFile(
        result.assets[0].uri,
        "selected-image.jpg"
      );
      console.log("Send file");
      console.log(file);
      await uploadImage(file);
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          style={styles.reactLogo}
        />
      }
    >
      <View style={styles.container}>
        <Button title="Select Image" onPress={pickImage} />
        {image && <Image source={{ uri: image }} style={styles.image} />}
      </View>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: 400,
    height: 200,
  },
});
