import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import styles from "../styles/HomeScreen.styles";
import CowDetailCard from "../../components/CowDetailCard";
import cowDataJson from "../../cow_data.json";

export default function CheckCow() {
  const [cowTag, setCowTag] = useState("");
  const [cowDetails, setCowDetails] = useState(null);
  const [cowData, setCowData] = useState({});

  // const getImagePath = (tag) => {
  //   try {
  //     return require(`../../assets/saved_images/${tag}.jpg`);
  //   } catch (error) {
  //     return require(`../../assets/saved_images/default.jpg`);
  //   }
  // };

  useEffect(() => {
    const loadCowData = async () => {
      try {
        const organizedData = cowDataJson.reduce((acc, cow) => {
          const tag = cow["Veld02_V"];
          if (!acc[tag]) acc[tag] = [];
          acc[tag].push({
            tag: cow["Veld02_V"],
            breed: cow["Veld12_V"],
            country: cow["Veld07_V"],
            age: `${cow["Veld05_V"]} years`,
            feedType: cow["Veld09_V"],
            height: cow["Veld06_V"],
            weight: cow["Veld11_V"],
            lastVaccination: cow["Veld14_V"],
            imagePath: tag+".jpg",
          });
          return acc;
        }, {});
        setCowData(organizedData);
      } catch (error) {
        console.error("Error loading cow data:", error);
      }
    };

    loadCowData();
  }, []);

  const handleSearch = () => {
    const details = cowData[cowTag];
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
        <Text style={styles.subheader}>Enter a cow tag to retrieve details</Text>
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
                <CowDetailCard key={index} cow={cow} />
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
    alignItems: "center",
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
    alignItems: "center",
  },
  error: {
    fontSize: 18,
    color: "#dc3545",
    fontWeight: "bold",
    textAlign: "center",
  },
});
