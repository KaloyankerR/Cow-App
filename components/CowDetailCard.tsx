import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput, Alert } from "react-native";
import styles from "../app/styles/CowDetailCard.styles";

export default function CowDetailCard({ cow }) {
  const [isReporting, setIsReporting] = useState(false);
  const [reportText, setReportText] = useState("");
  const [cardBorderColor, setCardBorderColor] = useState("#ccc");

  const handleReportSubmit = () => {
    Alert.alert("Mismatch Reported", `Thank you for your feedback: ${reportText}`);
    setIsReporting(false);
    setReportText("");
    setCardBorderColor("#D32F2F");
  };

  const handleConfirm = () => {
    Alert.alert("Confirmed", `Thank you for confirming this cow's information!`);
    setCardBorderColor("#388E3C");
  };

  return (
    <View style={[styles.card, { borderColor: cardBorderColor, borderWidth: 3 }]}>
      <Text style={styles.detail}>🐮 Tag: {cow.tag}</Text>
      <Text style={styles.detail}>📅 Age: {cow.age}</Text>
      <Text style={styles.detail}>🌍 Country: {cow.country}</Text>
      <Text style={styles.detail}>🐄 Breed: {cow.breed}</Text>

      {isReporting ? (
        <View style={styles.reportContainer}>
          <TextInput
            style={styles.input}
            placeholder="Describe the mismatch..."
            value={reportText}
            onChangeText={setReportText}
            multiline
          />
          <TouchableOpacity style={styles.submitButton} onPress={handleReportSubmit}>
            <Text style={styles.submitButtonText}>Submit Report</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
            <Text style={styles.confirmButtonText}>Confirm Identification</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.reportButton}
            onPress={() => setIsReporting(true)}
          >
            <Text style={styles.reportButtonText}>Report Mismatch</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
