import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Text } from 'react-native';
import ip_config from '@/config';
import CowDetailCardScan from './CowDetailCard_Scan';

const SERVER_URL = ip_config.API_BASE_URL; // Replace with your FastAPI server's URL
const getImageUri = (path: string) => `${SERVER_URL}/frames/${path}`;

const ImageSlider = ({imgs=[], passInformationToPopUp}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    // Will need to rename the variable below !! 
    const [images, setImages] = useState([]);
    const [imageUri, setImageUri] = useState([])
    const [detectedTag, setDetectedTags] = useState([])

    useEffect(() => {
        if(Array.isArray(imgs)){
            // console.log(imgs)

            imgs.forEach((item, indx) => {
                // console.log(item)
                // console.log(item.Detections)
                let framePath = item.detectedFrame;
                let editedFramePath = framePath.replace("./saved_frames/", "");
                setImageUri((prevItems) => [...prevItems, editedFramePath])
                setDetectedTags((prevItems) => [...prevItems, item.Detections])
            })
        }
    }, [imgs]);

    useEffect(() => {
        if(detectedTag.length > 0){
            // console.log(detectedTag)
            // console.log(detectedTag[0][0].Tag)
            // console.log(detectedTag[1][0].Tag)
        }

    }, [detectedTag])

    useEffect(() => {
        const tmpArray = imageUri.map((item, indx) => ({id: indx + 1, uri: item}))
        setImages(tmpArray)
    }, [imageUri])

    useEffect(() => {
        if (currentIndex >= images.length) {
            setCurrentIndex(0);
        }
    }, [images]);

  const handleNext = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <View style={styles.container}>
        {images.length > 0 && (
           <Image source={{ uri: getImageUri(images[currentIndex].uri) }} style={styles.image} />
        )}
      
        <View style={styles.navigation}>
            <TouchableOpacity style={styles.picSwitchBtn} onPress={handlePrev} disabled={currentIndex === 0}>
            <Text style={[styles.navText, currentIndex === 0 && styles.disabled]}>Prev</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.picSwitchBtn} onPress={handleNext} disabled={currentIndex === images.length - 1}>
            <Text style={[styles.navText, currentIndex === images.length - 1 && styles.disabled]}>Next</Text>
            </TouchableOpacity>
        </View>

        <View>
            {detectedTag.length > 0 && (
                // detectedTag[currentIndex].map((i, indx) => (
                //     <Text>{i}</Text>
                // ))
                <CowDetailCardScan key={0} cow={detectedTag[currentIndex][0]} clicked={() => passInformationToPopUp(detectedTag[currentIndex][0])}/>
                
                // <Text>{detectedTag[currentIndex][0].Tag}</Text>
            )}
        </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    alignItems: 'center',
    marginBottom: 15
  },
  image: {
    width: "50vw",
    maxWidth: "50vw",
    height: "55vh",
    maxHeight: "55vh",
    borderRadius: 20,
    marginTop: 40,
    borderWidth: 3,
    borderColor: "#8B4513",
    backgroundColor: "#FAEBD7",
    elevation: 5, // Add shadow for Android
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignSelf:"center",
    width: '60%',
    gap: 15,
    marginTop: 30,
  },
  navText: {
    fontSize: 18,
    color: '#007bff',
    fontWeight: 500
  },
  disabled: {
    color: '#ccc',
  },
  picSwitchBtn: {
    width: "25vw",
    height: "4vh",
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    
    borderRadius: 10,
    borderColor: "#e6e6e6",
    borderWidth: 1,
    // iOS
    shadowColor: "#000", 
    shadowOffset: {width: 0, height: 2}, 
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    // android
    elevation: 5,
    boxShadow: "0px, 8px, 12px, rgba(0,0,0, 0.25)"
}
});

export default ImageSlider;
