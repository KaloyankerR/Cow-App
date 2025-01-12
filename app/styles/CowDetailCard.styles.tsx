import { StyleSheet, Platform } from "react-native";

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
    width: "15vw",
    height: "12vh",
    justifyContent: "center",
  },
  detail: {
    fontSize: 18,
    ...Platform.select({
      android: { elevation: 2 },
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      web: { boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)" },
    }),
  },
  detail: {
    fontSize: 16,
    marginBottom: 8,
    color: "#333",
  },
  buttonContainer: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  confirmButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 4,
    flex: 1,
    marginRight: 8,
  },
  confirmButtonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  reportButton: {
    backgroundColor: "#f44336",
    padding: 10,
    borderRadius: 4,
    flex: 1,
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
    backgroundColor: "#2196F3",
    padding: 10,
    borderRadius: 4,
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    ...Platform.select({
      android: { elevation: 5 },
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      web: { boxShadow: "0px 6px 10px rgba(0, 0, 0, 0.2)" },
    }),
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
    color: "#555",
  },
  detailsButton: {
    marginTop: 10,
    backgroundColor: "#007BFF",
    paddingVertical: 8,
    borderRadius: 5,
    alignItems: "center",
  },
  detailsButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default styles;
