import {
  Image,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as ImagePicker from "expo-image-picker";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { useState } from "react";
import { uploadImage, uploadImage2, uploadImageString,uploadVideoString } from "@/api/imageSend";
import ImagePickerReact from "react-native-image-picker";
import styles from "../styles/HomeScreen.styles";
import { ScrollView } from "react-native-gesture-handler";
import * as FileSystem from 'expo-file-system';
import Popup from '@/components/Popup_CowInfo/CowPU';
import CowDetailCard from "@/components/CowDetailCard";

export default function HomeScreen() {

  const [image, setImage] = useState<string | null>(null);
  const [text, setText] = useState<string | null>(
    "🐮 Moo-tastic! Image Uploaded! Detecting breed and tag information..."
  );

  const [cowDetails, setCowDetails] = useState([]);
  const [isPopUpVis, setPopUpVis] = useState(false);
  const [cowDataPU, setCowDataPU] = useState({})

  const togglePopup = () => {
    setPopUpVis(!isPopUpVis)
    console.log(`Ok, pressed; state = ${isPopUpVis}`)
  };

  const passInformationToPopUp = (cow: {}) => {
    setCowDataPU(cow);
    togglePopup();
  }

  const pickImage = async () => {

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    let response;
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"], // Choose only images
      base64: true,
    });

    if (!result.canceled) {
      setCowDetails([])

      setText(
        "🐮 Moo-tastic! Image Uploaded! Detecting breed and tag information..."
      );
      setImage("data:image/jpeg;base64," + result.assets[0].base64);

      if (result.assets[0].type == "image") {
        response = await uploadImageString(
          "data:image/jpeg;base64," + result.assets[0].base64
        );
      } else {
        if (
          !result.assets[0].uri ||
          !result.assets[0].fileName ||
          !result.assets[0].type
        ) {
          throw new Error("Invalid video file. Missing required properties.");
        }

        const base64 = await FileSystem.readAsStringAsync(
          result.assets[0].uri,
          {
            encoding: "base64",
          }
        );

        response = await uploadVideoString("data:video/mp4;base64," + base64);
      }

      setImage("data:image/jpeg;base64," + response.data.labeled_image);
      setCowDetails(response.data.cow_data)
      setText(response.data.message);
    }
  };

  return (
    <View style={styles.container}>

      <View style={styles.headerContainer}>
        <Text style={styles.header}>Cow Identifier for</Text>
        <Text style={styles.header}>DAP Thewi</Text>
        <Text style={styles.subheader}>Upload an image to identify your cow by tag and color breed</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>

        {/* pop up! */}
        <Popup visible={isPopUpVis} onClose={togglePopup} cowData={cowDataPU} imgURL={cowDataPU.IMG_URL}/>


        {image && <Image source={{ uri: image }} style={styles.image} resizeMode="contain"/>}

        {cowDetails.length > 0 && (
          <View style={styles.detailsContainer}>
            {/* <Text style={styles.detailsTitle}>Detected Cows:</Text> */}
            <View style={styles.detectedCowsContainer}>
              {cowDetails.map((cow, index) => (
                <CowDetailCard key={index} cow={cow} clicked={() => passInformationToPopUp(cow)}/>
              ))}
            </View>
            
          </View>
        )}



        <View style={styles.buttonContainer}>

          <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
            <Text style={styles.buttonText}>📷 Upload Image</Text>
          </TouchableOpacity>
        </View>

        {/* {image && <Text style={styles.imageText}>{text}</Text>} */}

        
      </ScrollView>
    </View>
  );
}
