import { StyleSheet } from "react-native";
import {Dimensions} from 'react-native';


const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)', // Transparent background
    },
    
    popup: {
      width: "80vw",
      height: "55vh",
      padding: 20,
      backgroundColor: 'white',
      borderRadius: 10,
      elevation: 5, // For Android shadow
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 }, // For iOS shadow
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      position: 'relative'
    },


    // Phone 
    popupPH: {
        width: 350,
        height: 700,
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        elevation: 5, // For Android shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 }, // For iOS shadow
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        position: 'relative'
    },

    content: {
        marginBottom: 20,
        flex:1,
        flexDirection:"row",

        },
        contentMobile: {
            flex:1, 
            flexDirection:"column",
            justifyContent: "center",
    }, 

    cowImage: {
        minHeight: "44vh",
        minWidth:"32vw",
        maxWidth: Dimensions.get('window').width * 0.30,
        maxHeight: Dimensions.get('window').height * 0.30,
        borderRadius: 12,
        borderColor: "#333",
        
        elevation: 5, // For Android shadow
        shadowColor: '#333',
        shadowOffset: { width: 0, height: 2 }, // For iOS shadow
        shadowOpacity: 0.55,
        shadowRadius: 3.84,
    },

    // Phone
    cowImageMobile: {
        width: Dimensions.get('window').width * 0.78,
        height: Dimensions.get('window').height * 0.28,
        alignItems:"center", 
        borderRadius: 8,
        elevation: 5, // For Android shadow
        shadowColor: '#333',
        shadowOffset: { width: 0, height: 2 }, // For iOS shadow
        shadowOpacity: 0.55,
        shadowRadius: 3.84,
    }, 
    
    cowDataWorkNumber: {
        flexDirection: "row",
        height: "10%", 
        gap: 10,
        borderBottomColor: "grey",
        borderBottomWidth: 1,
    },
    
    cowDataWorkNumberPH: {
        flexDirection: "column",
        gap: 10,
        borderBottomColor: "grey",
        borderBottomWidth: 1,
    },

    cowDataText: {
        // display: "block",
        fontSize:17,
        // backgroundColor: "grey",
        marginTop: 10,
        width: "42vw",
        padding: 10,
        borderBottomColor: "grey",
        borderBottomWidth: 1,
        fontWeight: "440"
    },
    cowDataTextPH: {
        fontSize: 16,
        height: 35,
        marginTop: 10,

        borderBottomColor: "grey",
        borderBottomWidth: 1,
    },





    closeBtnTxt: {
        fontSize:20, 
        color: '#000',
    },
    title: {
      fontSize: 22,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    
    closeButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'transparent',
        padding: 5,
        zIndex: 10,
    },
    cowDataContainer: {
        marginLeft:40,
    },

    cowDataContainerMobile: {
        marginTop: 20,
    },

    cowImgContainer: {
        //alignItems: "center"
        
    },
    cowImgContainerMobile:{
        alignItems: "center"
    },



    
    
    cowDataWorkTxt: {
        fontSize:17,
        paddingLeft: 10,
    },
    boldText: {
        fontWeight: 500
    }
  });

export default styles;