import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import styles from "../styles/HomeScreen.styles";

export default function CheckCow() {
  const [cowTag, setCowTag] = useState("");
  const [cowDetails, setCowDetails] = useState(null);

  const mockCowData = {
    "12345": [
      { breed: "Holstein", country: "Netherlands", age: "5 years" },
      { breed: "Jersey", country: "Netherlands", age: "2 years" },
    ],
    "67890": [
      { breed: "Jersey", country: "USA", age: "3 years" },
      { breed: "Angus", country: "Canada", age: "4 years" },
    ],
    "54321": [
      { breed: "Charolais", country: "France", age: "6 years" },
    ],
  };

  const handleSearch = () => {
    const details = mockCowData[cowTag];
    if (details) {
      setCowDetails(details);
    } else {
      setCowDetails([{ error: "Cow not found" }]);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.header}>Manual Cow Search</Text>
          <Text style={styles.subheader}>
            Enter a cow tag to retrieve details
          </Text>
        </View>

        <TextInput
          style={loc_styles.input}
          placeholder="Enter Cow Tag"
          value={cowTag}
          onChangeText={setCowTag}
          placeholderTextColor="#888"
        />
        <TouchableOpacity style={loc_styles.button} onPress={handleSearch}>
          <Text style={loc_styles.buttonText}>🔍 Search</Text>
        </TouchableOpacity>

        {cowDetails && (
          <View style={loc_styles.detailsContainer}>
            {cowDetails[0]?.error ? (
              <Text style={loc_styles.error}>{cowDetails[0].error}</Text>
            ) : (
              cowDetails.map((cow, index) => (
                <View key={index} style={loc_styles.cowDetailCard}>
                  <Text style={loc_styles.detail}>🐮 Breed: {cow.breed}</Text>
                  <Text style={loc_styles.detail}>🌍 Country: {cow.country}</Text>
                  <Text style={loc_styles.detail}>📅 Age: {cow.age}</Text>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const loc_styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF3E3",
    padding: 20,
  },
  scrollContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 50,
  },
  headerContainer: {
    marginBottom: 30,
    alignItems: "center",
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
  },
  subheader: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginTop: 5,
  },
  input: {
    marginTop:20,
    height: 50,
    width: "85%",
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#28a745",
    borderRadius: 10,
    // paddingVertical: 15,
    // paddingHorizontal: 20,
    alignItems: "center",
    justifyContent:"center",
    width: "80%",
    height:40
  },
  buttonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
  detailsContainer: {
    marginTop: 30,
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    width: "90%",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  cowDetailCard: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#b8b8b8",
    borderRadius: 8,
    width: "100%",
  },
  detail: {
    fontSize: 18,
    color: "#333",
    marginBottom: 5,
  },
  error: {
    fontSize: 18,
    color: "#dc3545",
    fontWeight: "bold",
  },
});
