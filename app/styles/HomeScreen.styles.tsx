import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#FAF3E3",
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#4A4228",
    textAlign: "center",
    fontFamily: "serif",
  },
  subheader: {
    fontSize: 16,
    color: "#6B8E23",
    marginBottom: 30,
    textAlign: "center",
  },
  uploadButton: {
    backgroundColor: "#8B5E3C",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    borderColor: "#D2B48C",
    borderWidth: 2,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 2, height: 2 },
    elevation: 5,
    marginBottom: 20,
  },
  buttonText: {
    fontSize: 18,
    color: "#FFF7E4",
    fontWeight: "bold",
  },
  image: {
    width: 350,
    height: 250,
    borderRadius: 20,
    marginTop: 20,
    borderWidth: 3,
    borderColor: "#8B4513",
    backgroundColor: "#FAEBD7",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 1, height: 1 },
    elevation: 5,
  },
  imageText: {
    marginTop: 15,
    fontSize: 18,
    color: "#6B8E23",
    fontFamily: "serif",
    fontStyle: "italic",
  },
  cowgirlImage: {
    position: "absolute",
    bottom: 20,
    left: 20,
    width: 80,
    height: 80,
    resizeMode: "contain",
  },
});

export default styles;
