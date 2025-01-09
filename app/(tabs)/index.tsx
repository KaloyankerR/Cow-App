import {
  Image,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { ScrollView } from "react-native-gesture-handler";
import CowDetailCard from "../../components/CowDetailCard";
import styles from "../styles/HomeScreen.styles";
import Popup from "@/components/Popup_CowInfo/CowPU";

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
      
      // Quick debug to see what the responses are!
      console.log("Information we got back!");
      console.log(response.data.message)
    }
  };

  const pickVid = async () => {
    // placeholder for video upload functionality
    togglePopup()
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
        <Popup visible={isPopUpVis} onClose={togglePopup} cowData={cowDataPU}/>



        <View style={styles.buttonContainer}>

          <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
            <Text style={styles.buttonText}>📷 Upload Image</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.uploadButton} onPress={pickVid}>
            <Text style={styles.buttonText} disabled={true}>
              (DEBUG) Opens Pop up
            </Text>
          </TouchableOpacity>
          
        </View>

        {image && <Image source={{ uri: image }} style={styles.image} />}
        {image && <Text style={styles.imageText}>{text}</Text>}

        {cowDetails.length > 0 && (
          <View style={styles.detailsContainer}>
            <Text style={styles.detailsTitle}>Detected Cows:</Text>
            <View style={styles.detectedCowsContainer}>
              {cowDetails.map((cow, index) => (
                <CowDetailCard key={index} cow={cow} clicked={() => passInformationToPopUp(cow)}/>
              ))}
            </View>
            
          </View>
        )}
      </ScrollView>
    </View>
  );
}
