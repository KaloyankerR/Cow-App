import {
  Image,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Platform
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
import CowDetailCardScan from "@/components/CowDetailCard_Scan";
import ImageSlider from "@/components/ImageSliderComponent";


export default function HomeScreen() {

  const [image, setImage] = useState<string | null>(null);
  const [text, setText] = useState<string | null>(
    "🐮 Moo-tastic! Image Uploaded! Detecting breed and tag information..."
  );

  const [cowDetails, setCowDetails] = useState([]);
  const [isPopUpVis, setPopUpVis] = useState(false);
  const [cowDataPU, setCowDataPU] = useState({})


  // New stuff
  const [getIsVid, setIsVid] = useState(false);
  const [getVidFrames, setVidFrames] = useState([]);


  const togglePopup = () => {
    setPopUpVis(!isPopUpVis)
  };

  const passInformationToPopUp = (cow: {}) => {
    setCowDataPU(cow);
    togglePopup();
  }

  const checkCowInfo = (cow) => {

    cow.forEach((item) => {
      // First we check if this is a video response or a img response..
      if(item.Tag == undefined)
      {
        // OK, so its a vid, now we're looping the info
        setIsVid(true)
        setVidFrames((prevItems) => [...prevItems, item]);
      }
      else
      {
        setIsVid(false)
      }
    })

    
  }

  
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    let response;

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images", "videos"],
      base64: true,
    });

    if (!result.canceled) {
      setText("🐮 Moo-tastic! Image Uploaded! Detecting breed and tag information...");
      setImage("data:image/jpeg;base64," + result.assets[0].base64);
      setCowDetails([])
      setVidFrames([])
      setIsVid(false)
      
      if (result.assets[0].type === "image") {
        response = await uploadImageString(
          "data:image/jpeg;base64," + result.assets[0].base64
        );
      } else {
        let base64;

        if (Platform.OS === 'web') {
          // Web handling
          const response = await fetch(result.assets[0].uri);
          const blob = await response.blob();
          base64 = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(',')[1]);
            reader.readAsDataURL(blob);
          });
        } else {
          // Mobile handling
          base64 = await FileSystem.readAsStringAsync(
            result.assets[0].uri,
            {
              encoding: "base64",
            }
          );
        }

        response = await uploadVideoString("data:video/mp4;base64," + base64);
      }

      setImage("data:image/jpeg;base64," + response.data.labeled_image);
      setCowDetails(response.data.cow_data)
      checkCowInfo(response.data.cow_data)
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
        
        {getIsVid ? 
        (
          getVidFrames.length > 0 && <ImageSlider imgs={getVidFrames} passInformationToPopUp={passInformationToPopUp}/>
        ) 
        : 
        (
          image && <Image source={{ uri: image }} style={styles.image} resizeMode="contain"/>
        )}
        


        {getIsVid ? (
          <View>
            {/* {console.log(cowDetails)} */}
            {/* Going to keep this empty for now */}
          </View>
        ) 
        : 
        (
          <View>
            {cowDetails.length > 0 ? (
              <View style={styles.detailsContainer}>
                {/* <Text style={styles.detailsTitle}>Detected Cows:</Text> */}
                <View style={styles.detectedCowsContainer}>
                  {cowDetails.map((cow, index) => (
                    <CowDetailCardScan key={index} cow={cow} clicked={() => passInformationToPopUp(cow)}/>
                  ))}
                </View>
                
              </View>
            )
            :(
              // <View style={styles.failedContainer}>
              //   <Text style={styles.failedText}>Failed to detect cow(s)</Text>
              // </View>
              <View></View>
            )
          }
          </View>
        )}




        <View style={styles.buttonContainer}>

          <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
            <Text style={styles.buttonText}>📷 Upload</Text>
          </TouchableOpacity>
        </View>

        {/* {image && <Text style={styles.imageText}>{text}</Text>} */}

        
      </ScrollView>
    </View>
  );
}
