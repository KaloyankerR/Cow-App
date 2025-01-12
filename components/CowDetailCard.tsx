import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, Modal, Button, StyleSheet } from "react-native";

export default function CowDetailCard({ cow }) {
  const [modalVisible, setModalVisible] = useState(false);

  const handleDetailsPress = () => {
    setModalVisible(true);
    console.log("Details button pressed");
    console.log(cow.imagePath);
  };

  const getImageSource = (imagePath) => {
    try {
      return require(`./assets/saved_images/${imagePath}`);
    } catch (error) {
      console.warn("Image not found:", imagePath);
      return require("./assets/saved_images/default.jpg"); // Fallback image
    }
  };
  

  return (
    <>
      <TouchableOpacity onPress={handleDetailsPress} style={styles.cardContainer}>
        {/* Cow Image */}
        <Image
          source={{ uri: cow.imagePath }}
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
            {/* <Image
              source={{ uri: cow.imagePath }}
              style={styles.image}
              resizeMode="cover"
              onError={(e) => console.log("Image loading error:", e.nativeEvent.error)}
            /> */}
            <Image source={eval(cow.imagePath)} style={styles.image} resizeMode="cover" />
            
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
  modalImage: {
    width: "100%",
    height: 250,
    marginBottom: 15,
  },
  modalText: {
    fontSize: 16,
    color: "#555",
    marginVertical: 5,
  },
});
