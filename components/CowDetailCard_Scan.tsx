import { useState } from "react";
import { View, Text, TouchableOpacity, TextInput, Alert } from "react-native";
import styles from "../app/styles/CowDetailCard.styles";

export default function CowDetailCardScan({ cow, clicked}) {
  const [isReporting, setIsReporting] = useState(false);
  const [reportText, setReportText] = useState("");
  const [cardBorderColor, setCardBorderColor] = useState("#ccc");

  // const handleReportSubmit = () => {
  //   Alert.alert("Mismatch Reported", `Thank you for your feedback: ${reportText}`);
  //   setIsReporting(false);
  //   setReportText("");
  //   setCardBorderColor("#D32F2F");
  // };

  // const handleConfirm = () => {
  //   Alert.alert("Confirmed", `Thank you for confirming this cow's information!`);
  //   setCardBorderColor("#388E3C");
  // };

  return (
    <TouchableOpacity  onPress={clicked}>
      <View style={[styles.card, { borderColor: cardBorderColor, borderWidth: 3 }]} >
        <Text style={styles.detail}>🏷️ Tag: {cow.Tag}</Text>
        <Text style={styles.detail}>🌍 Country: {cow.Country}</Text>
        {/* <Text style={styles.detail}>🐄 Breed: {cow.breed}</Text> */}
      </View>
    </TouchableOpacity>
  );
}