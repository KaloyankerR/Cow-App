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
import { uploadImage, uploadImage2, uploadImageString } from "@/api/imageSend";
import ImagePickerReact from "react-native-image-picker";
import styles from "../styles/HomeScreen.styles";
import { ScrollView } from "react-native-gesture-handler";
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
      // console.log(result.assets[0].base64);
      const response = await uploadImageString(
        "data:image/jpeg;base64," + result.assets[0].base64
      );
      setImage("data:image/jpeg;base64," + response.data.labeled_image);
      setText(response.data.message);
      setCowDetails(response.data)
      // Quick debug to see what the responses are!
      console.log("Information we got back!");
      console.log(response.data)
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
        <Popup visible={isPopUpVis} onClose={togglePopup} cowData={cowDataPU}/>


        {image && <Image source={{ uri: image }} style={styles.image} />}

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
