// Few requirements: 
// - Displays information based on specific cow. 
// - Displays information such as: Birthdate, gender, origin etc.
// - (Could) Open/Close animation

import React, {useEffect, useState} from 'react';
import {Modal, View, Text, StyleSheet, TouchableOpacity, Dimensions, Image} from 'react-native';
import { Asset } from 'expo-asset';
import ip_config from '@/config';

const screenWidth = Dimensions.get('window').width;
const isMobile = screenWidth < 768;

const SERVER_URL = ip_config.API_BASE_URL;

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
    },
    cowDataWorkNumber: {
        flexDirection: "row",
        height: "10%", 
        gap: 10,
        borderBottomColor: "grey",
        borderBottomWidth: 1,
    },
    cowDataWorkTxt: {
        fontSize:17,
        paddingLeft: 10,
    },
    boldText: {
        fontWeight: 500
    }
  });



const Popup = ({visible, onClose, cowData, imgURL}) => {
    // console.log("Pop Up data: ")
    // console.log(cowData) 
    let cowsAge = {
        "age":0,
        "format":""
    };


    const getImageUri = (cowData: object) => {



        if(cowData.IMG_URL == "")
        {
            return "https://upload.wikimedia.org/wikipedia/commons/a/a3/Image-not-found.png";
        }
        else {
            return `${SERVER_URL}/images/${cowData.Tag}.jpg`;
        }
    }

    const convertDateToAge = (date="") => {
        // DOB = Date of Birth
        const cowDOB = new Date(date);
        const currDate = new Date();

        console.log(date)

        let age = currDate.getFullYear() - cowDOB.getFullYear();
        
        const isBeforeBOD = currDate.getMonth() < cowDOB.getMonth() ||
        (currDate.getMonth() === cowDOB.getMonth() 
        && currDate.getDate() < cowDOB.getDate())
        
        if (isBeforeBOD) {
            age--;
        }

        // Calculate months difference
        let months = currDate.getMonth() - cowDOB.getMonth();

        if (months < 0) {
            age--;
            months += 12; // Adjust for negative months
        }

        // Adjust days to refine the month difference
        if (currDate.getDate() < cowDOB.getDate() && months >= 0) {
            months--;
            
        }
        
        if(age <= 0)
        {
            cowsAge.age = months;
            console.log(months)
            cowsAge.format = "m";
        }
        else{
            cowsAge.age = age;
            console.log(age)
            cowsAge.format = "y";
        }
    }
    
    //convertDateToAge("2024-06-15T00:00:00")

    convertDateToAge(cowData.Birthdate)


    let tstr = String(imgURL);
    // console.log(tstr);
    let newURI = tstr.replace("./", "")

    return (
    <Modal transparent={true} visible={visible} animationType='fade' onRequestClose={onClose}>
        <View style={styles.overlay}>

            <View style={styles.popup}>
                
                <Text style={styles.title}>Cow Info</Text>
                
                <View style={isMobile ? styles.contentMobile : styles.content}>
                    {/* Information of the cow */}
                    <View style={isMobile ? styles.cowImgContainerMobile : styles.cowImgContainer}>
                        {/* Should be replaced with the actual cow image. */}
                        <Image style={isMobile ? styles.cowImageMobile : styles.cowImage} source={{uri: getImageUri(cowData)}}
                        />
                    </View>
                    

                    <View style={isMobile ? styles.cowDataContainerMobile : styles.cowDataContainer}>
                        <View style={styles.cowDataWorkNumber}>
                            <Text style={styles.cowDataWorkTxt}><Text style={styles.boldText}>Full number:</Text> {cowData.Fulltag}</Text>
                            <Text style={styles.cowDataWorkTxt}>|</Text>
                            <Text style={styles.cowDataWorkTxt}><Text style={styles.boldText}>Work number:</Text> {cowData.Tag}</Text>
                        </View>
                        
                        <Text style={isMobile ? styles.cowDataTextMobile : styles.cowDataText}>
                            <Text style={styles.boldText}>Country: </Text>
                            {cowData.Country}
                        </Text>
                        
                        <Text style={isMobile ? styles.cowDataTextMobile : styles.cowDataText}>
                            <Text style={styles.boldText}>Age: </Text>
                            <Text>{cowsAge.age} - </Text>
                            <Text>
                                {cowsAge.format == "m" ? "Months": "Years"} old
                            </Text>
                        </Text>
                        
                        <Text style={isMobile ? styles.cowDataTextMobile : styles.cowDataText}>
                            <Text style={styles.boldText}>Company: </Text>
                            {cowData.Company}
                        </Text>
                        
                        <Text style={isMobile ? styles.cowDataTextMobile : styles.cowDataText}>
                            <Text style={styles.boldText}>Color: </Text>
                            {cowData.Color}
                        </Text>

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