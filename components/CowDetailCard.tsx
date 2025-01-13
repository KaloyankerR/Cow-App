import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, Modal, Button, StyleSheet } from "react-native";
import ip_config from "../config";

const SERVER_URL = ip_config.API_BASE_URL; // Replace with your FastAPI server's URL

export default function CowDetailCard({ cow }) {
  const [modalVisible, setModalVisible] = useState(false);

  const handleDetailsPress = () => {
    setModalVisible(true);
    console.log("Details button pressed");
    console.log(cow.imagePath);
  };
    const getImageUri = (path: string) => `${SERVER_URL}/images/${path}`;

  return (
    <>
      <TouchableOpacity onPress={handleDetailsPress} style={styles.cardContainer}>
        {/* Cow Image */}
        <Image
          source={{ uri: getImageUri(cow.imagePath) }}
          style={styles.image}
          resizeMode="cover"
          onError={(e) => console.log("Image loading error:", e.nativeEvent.error)}
        />

        {/* Cow Details */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>🐮 {cow.tag || "Unknown Tag"}</Text>
          <Text style={styles.detail}>📅 Age: {cow.age || "N/A"}</Text>
          <Text style={styles.detail}>🌍 Country: {cow.country || "N/A"}</Text>
          <Text style={styles.detail}>🐄 Breed: {cow.breed || "N/A"}</Text>
        </View>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Cow Details</Text>
            <Image
              source={{ uri: getImageUri(cow.imagePath) }}
              style={styles.image}
              resizeMode="cover"
              onError={(e) => console.log("Modal Image loading error:", e.nativeEvent.error)}
            />
            <Text style={styles.modalText}>🐮 Tag: {cow.tag || "Unknown Tag"}</Text>
            <Text style={styles.modalText}>📅 Age: {cow.age || "N/A"}</Text>
            <Text style={styles.modalText}>🌍 Country: {cow.country || "N/A"}</Text>
            <Text style={styles.modalText}>🐄 Breed: {cow.breed || "N/A"}</Text>
            <Button title="Close" onPress={() => setModalVisible(false)} color="#28a745" />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    margin: 10,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  image: {
    width: "100%",
    height: 200,
  },
  textContainer: {
    padding: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  detail: {
    fontSize: 16,
    color: "#555",
    marginVertical: 2,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  modalText: {
    fontSize: 16,
    color: "#555",
    marginVertical: 5,
  },
});
