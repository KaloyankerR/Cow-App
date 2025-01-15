// Few requirements: 
// - Displays information based on specific cow. 
// - Displays information such as: Birthdate, gender, origin etc.
// - (Could) Open/Close animation

import React, {useEffect, useState} from 'react';
import {Modal, View, Text, StyleSheet, TouchableOpacity, Dimensions, Image} from 'react-native';
import { Asset } from 'expo-asset';
import ip_config from '@/config';
import styles from './styling/CowPU.styles';


const screenWidth = Dimensions.get('window').width;
const isMobile = screenWidth < 768;

const SERVER_URL = ip_config.API_BASE_URL;

//const [cowInfo, setCowInfo] = useState([]);





const Popup = ({visible, onClose, cowData, imgURL}) => {
    
    const screenWidth = Dimensions.get('window').width;
    const isMobile = screenWidth < 768;

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


    return (
    <Modal transparent={true} visible={visible} animationType='fade' onRequestClose={onClose}>
        <View style={styles.overlay}>

            <View style={isMobile ? styles.popupPH : styles.popup }>
                
                <Text style={styles.title}>Cow Info</Text>
                
                <View style={isMobile ? styles.contentMobile : styles.content}>
                    {/* Information of the cow */}
                    <View style={isMobile ? styles.cowImgContainerMobile : styles.cowImgContainer}>
                        {/* Should be replaced with the actual cow image. */}
                        <Image style={isMobile ? styles.cowImageMobile : styles.cowImage} source={{uri: getImageUri(cowData)}}
                        />
                    </View>
                    

                    <View style={isMobile ? styles.cowDataContainerMobile : styles.cowDataContainer}>
                        {isMobile ? 
                        (<View>
                            <Text style={styles.cowDataTextPH}><Text style={styles.boldText}>Full Number: </Text>{cowData.Fulltag}</Text>
                            <Text style={styles.cowDataTextPH}><Text style={styles.boldText}>Work number: </Text>{cowData.Tag}</Text>
                        </View>) : 
                        (
                        <View style={styles.cowDataWorkNumber}>
                            <Text style={styles.cowDataWorkTxt}><Text style={styles.boldText}>Full number:</Text> {cowData.Fulltag}</Text>
                            <Text style={styles.cowDataWorkTxt}>|</Text>
                            <Text style={styles.cowDataWorkTxt}><Text style={styles.boldText}>Work number:</Text> {cowData.Tag}</Text>
                        </View>
                    )}

                        
                        
                        <Text style={isMobile ? styles.cowDataTextPH : styles.cowDataText}>
                            <Text style={styles.boldText}>Country: </Text>
                            {cowData.Country}
                        </Text>
                        
                        <Text style={isMobile ? styles.cowDataTextPH : styles.cowDataText}>
                            <Text style={styles.boldText}>Age: </Text>
                            <Text>{cowsAge.age} - </Text>
                            <Text>
                                {cowsAge.format == "m" ? "Months": "Years"} old
                            </Text>
                        </Text>
                        
                        <Text style={isMobile ? styles.cowDataTextPH : styles.cowDataText}>
                            <Text style={styles.boldText}>Company: </Text>
                            {cowData.Company}
                        </Text>
                        
                        <Text style={isMobile ? styles.cowDataTextPH : styles.cowDataText}>
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