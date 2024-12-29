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
import CowDetailCard from "../../components/CowDetailCard"; // Import the reusable component

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
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Manual Cow Search</Text>
        <Text style={styles.subheader}>
          Enter a cow tag to retrieve details
        </Text>
      </View>

      <View style={loc_styles.inputContainer}>
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
      </View>

      <ScrollView contentContainerStyle={loc_styles.scrollContainer}>
        {cowDetails && (
          <>
            {cowDetails[0]?.error ? (
              <Text style={loc_styles.error}>{cowDetails[0].error}</Text>
            ) : (
              cowDetails.map((cow, index) => (
                <CowDetailCard key={index} cow={cow} /> // Reuse the CowDetailCard component
              ))
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const loc_styles = StyleSheet.create({
  inputContainer: {
    alignItems: "center", // Center the input and button
    justifyContent: "center",
    marginVertical: 20,
  },
  input: {
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
    alignItems: "center",
    justifyContent: "center",
    width: "80%",
    height: 40,
  },
  buttonText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "bold",
  },
  scrollContainer: {
    marginTop: 30,
    paddingHorizontal: 20,
    paddingBottom: 50,
    alignItems: "center", // Align cards in the center
  },
  error: {
    fontSize: 18,
    color: "#dc3545",
    fontWeight: "bold",
    textAlign: "center",
  },
});
