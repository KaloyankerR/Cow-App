import { useState } from "react";
import { View, Text, TouchableOpacity, TextInput, Alert } from "react-native";
import styles from "../app/styles/CowDetailCard.styles";

export default function CowDetailCardScan({ cow, clicked}) {
  let isVid = false

  const checkCowInfo = (cow) => {
    // console.log(cow)
    if(cow.Tag == undefined)
      {
        // console.log("OI, its undefined which means this information is from a video")
        let tag = cow.Detections[0].Tag
        // console.log(`OK, tag is: ${tag}`)
        isVid = true;
      }
      else {
        // console.log("OK, this is the normal format (for images)")
        // console.log(`info ${cow.Tag}`)
      }
  }



  const [isReporting, setIsReporting] = useState(false);
  const [reportText, setReportText] = useState("");
  const [cardBorderColor, setCardBorderColor] = useState("#ccc");
  
  
  
  checkCowInfo(cow);

  return (
    <TouchableOpacity  onPress={clicked}>
      <View style={[styles.card, { borderColor: cardBorderColor, borderWidth: 3 }]} >
        <Text style={styles.detail}>🏷️ Tag: {isVid ? cow.Detections[0].Tag : cow.Tag}</Text>
        <Text style={styles.detail}>🌍 Country: {isVid ? cow.Detections[0].Country : cow.Country}</Text>
      </View>
    </TouchableOpacity>
  );
}