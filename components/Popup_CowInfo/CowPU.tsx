// Few requirements: 
// - Displays information based on specific cow. 
// - Displays information such as: Birthdate, gender, origin etc.
// - (Could) Open/Close animation

import React, {useState} from 'react';
import {Modal, View, Text, StyleSheet, TouchableOpacity, Dimensions, Image} from 'react-native';

const screenWidth = Dimensions.get('window').width;
const isMobile = screenWidth < 768;

//const [cowInfo, setCowInfo] = useState([]);

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
    closeBtnTxt: {
        fontSize:20, 
        color: '#000',
    },
    title: {
      fontSize: 22,
      fontWeight: 'bold',
      marginBottom: 10,
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
        marginTop:60
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


    cowImageMobile: {
        width: Dimensions.get('window').width * 0.68,
        height: Dimensions.get('window').height * 0.28,
        alignItems:"center", 
        borderRadius: 12,


        elevation: 5, // For Android shadow
        shadowColor: '#333',
        shadowOffset: { width: 0, height: 2 }, // For iOS shadow
        shadowOpacity: 0.55,
        shadowRadius: 3.84,
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
    cowDataTextMobile: {
        fontSize: 19,
        height: 30,
    }
  });



const Popup = ({visible, onClose, cowData}) => {
    return (
    <Modal transparent={true} visible={visible} animationType='fade' onRequestClose={onClose}>
        <View style={styles.overlay}>

            <View style={styles.popup}>
                
                <Text style={styles.title}>Cow Info</Text>
                
                <View style={isMobile ? styles.contentMobile : styles.content}>
                    {/* Information of the cow */}
                    <View style={isMobile ? styles.cowImgContainerMobile : styles.cowImgContainer}>
                        {/* Should be replaced with the actual cow image. */}
                        <Image style={isMobile ? styles.cowImageMobile : styles.cowImage} source={{
                            uri: "https://upload.wikimedia.org/wikipedia/commons/a/a3/Image-not-found.png", 
                        }}
                        />
                    </View>
                    

                    <View style={isMobile ? styles.cowDataContainerMobile : styles.cowDataContainer}>
                        
                        <Text style={isMobile ? styles.cowDataTextMobile : styles.cowDataText}>Work Number: {cowData.tag}</Text>
                        {/* <Text style={isMobile ? styles.cowDataTextMobile : styles.cowDataText}>ID Number: {cowData}</Text> */}
                        {/* <Text style={isMobile ? styles.cowDataTextMobile : styles.cowDataText}>Full Number: BE429940016 {console.log(cowData)}</Text> */}
                        <Text style={isMobile ? styles.cowDataTextMobile : styles.cowDataText}>Country: {cowData.country}</Text>
                        <Text style={isMobile ? styles.cowDataTextMobile : styles.cowDataText}>Age: {cowData.age} Birthdate: 15-06-2024</Text>
                        {/* <Text style={isMobile ? styles.cowDataTextMobile : styles.cowDataText}>Company: Kupersvee B.V</Text> */}
                        <Text style={isMobile ? styles.cowDataTextMobile : styles.cowDataText}>Color: Zwart-wit</Text>
                    </View>

                    
                </View>

                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.closeBtnTxt}>X</Text>
                </TouchableOpacity>

            </View>

        </View>
    </Modal>
    );
}

export default Popup;