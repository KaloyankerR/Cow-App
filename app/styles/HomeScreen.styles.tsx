import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF3E3",
  },
  
  headerContainer: {
    padding: 20,
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
    //padding: 20,
    //paddingBottom: 50, // Add padding to avoid clipping at the bottom
  },
  detectedCowsContainer: {
    flex: 1,
    flexDirection: "row",
    flexWrap: 'wrap',
    gap: 14,
    marginTop: "2%"
  },
  uploadButton: {
    backgroundColor: "#8B5E3C",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    borderColor: "#D2B48C",
    borderWidth: 2,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 2, height: 2 },
    elevation: 5,
    marginBottom: 20,
  },
  // 18/12/2024 - Added by me Shelson, just to center the button's
  buttonContainer: {
    flex:1,
    flexDirection: "row",
    alignItems: "center",
    marginTop:"1%"
  },
  
  buttonText: {
    fontSize: 18,
    color: "#FFF7E4",
    fontWeight: "bold",
  },
  image: {
    width: "50vw",
    maxWidth: "50vw",
    height: "55vh",
    maxHeight: "55vh",
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
    textAlign: "center",
  },
  detailsTitle: {
    fontSize: 20
  }
});

export default styles;

