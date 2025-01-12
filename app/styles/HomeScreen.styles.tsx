import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF3E3",
  },
  headerContainer: {
    padding: 20,
    marginTop: 40,
    backgroundColor: "#FAF3E3",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#D2B48C",
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#4A4228",
    textAlign: "center",
    fontFamily: "serif",
  },
  subheader: {
    fontSize: 16,
    color: "#6B8E23",
    textAlign: "center",
    marginBottom: 10,
  },
  scrollContainer: {
    alignItems: "center",
    padding: 20,
    paddingBottom: 50, // Add padding to avoid clipping at the bottom
  },
  uploadButton: {
    backgroundColor: "#8B5E3C",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    borderColor: "#D2B48C",
    borderWidth: 2,
    elevation: 5, // Works for Android shadows
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
    elevation: 5, // Add shadow for Android
  },
  imageText: {
    marginTop: 15,
    fontSize: 18,
    color: "#6B8E23",
    fontFamily: "serif",
    fontStyle: "italic",
    textAlign: "center",
  },
});

export default styles;
