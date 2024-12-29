import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from "react-native";

export default function CowDetailCard({ cow }) {
  const [isReporting, setIsReporting] = useState(false);
  const [reportText, setReportText] = useState("");

  const handleReportSubmit = () => {
    Alert.alert("Mismatch Reported", `Thank you for your feedback: ${reportText}`);
    setIsReporting(false);
    setReportText(""); // Clear the input after submission
  };

  return (
    <View style={styles.card}>
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
        <TouchableOpacity
          style={styles.reportButton}
          onPress={() => setIsReporting(true)}
        >
          <Text style={styles.reportButtonText}>Report Mismatch</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  detail: {
    fontSize: 16,
    marginBottom: 8,
    color: "#333",
  },
  reportButton: {
    backgroundColor: "#f44336",
    padding: 10,
    borderRadius: 4,
    marginTop: 8,
  },
  reportButtonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  reportContainer: {
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 10,
    marginBottom: 8,
    backgroundColor: "#f9f9f9",
  },
  submitButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 4,
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
});
