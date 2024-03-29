import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import * as Font from 'expo-font';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AboutScreen from './AboutScreen'; // Import the AboutScreen component

// Import the reference MP3 file
const referenceAudioFile = require('./assets/reference.mp3');

// Load custom fonts
const customFonts = {
  'MontserratAlternates-Regular': require('./assets/fonts/MontserratAlternates-Regular.ttf'),
  'MontserratAlternates-Bold': require('./assets/fonts/MontserratAlternates-Bold.ttf'),
};

const Footer = () => {
  const navigation = useNavigation();

  const goToAbout = () => {
    navigation.navigate('About');
  };

  return (
    <View style={styles.footer}>
      <TouchableOpacity onPress={goToAbout}>
        <Text style={styles.footerText}>About Us</Text>
      </TouchableOpacity>
      <Text style={styles.footerText}>Contact</Text>
      <Text style={styles.footerText}>C ledeyoruba</Text>
    </View>
  );
};

const App = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordTimer, setRecordTimer] = useState({ minutes: 0, seconds: 0 });
  const [recording, setRecording] = useState(null);
  const [recordings, setRecordings] = useState([]);
  const [isPlayingReference, setIsPlayingReference] = useState(false);
  const [isPlayingRecording, setIsPlayingRecording] = useState(null);
  const [playbackInstance, setPlaybackInstance] = useState(null);
  const [playbackTimer, setPlaybackTimer] = useState({ minutes: 0, seconds: 0 });
  const [referencePlaybackInstance, setReferencePlaybackInstance] = useState(null);
  const [referencePlaybackTimer, setReferencePlaybackTimer] = useState({ minutes: 0, seconds: 0 });

  const referenceWord = "Hello, shey àtí bẹ̀rẹ̀ ni?";

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync(customFonts);
    }
    loadFonts();
  }, []);

  useEffect(() => {
    Audio.requestPermissionsAsync();
  }, []);

  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordTimer(prevTimer => {
          const seconds = prevTimer.seconds + 1;
          const minutes = Math.floor(seconds / 60);
          return {
            minutes: minutes,
            seconds: seconds % 60
          };
        });
      }, 1000);
    } else {
      clearInterval(interval);
      setRecordTimer({ minutes: 0, seconds: 0 });
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  useEffect(() => {
    let interval;
    if (isPlayingRecording !== null && playbackInstance !== null) {
      interval = setInterval(async () => {
        const status = await playbackInstance.getStatusAsync();
        if (status.isLoaded) {
          const seconds = Math.floor(status.positionMillis / 1000);
          const minutes = Math.floor(seconds / 60);
          setPlaybackTimer({
            minutes: minutes,
            seconds: seconds % 60
          });
        }
      }, 1000);
    } else {
      clearInterval(interval);
      setPlaybackTimer({ minutes: 0, seconds: 0 });
    }
    return () => clearInterval(interval);
  }, [isPlayingRecording, playbackInstance]);

  useEffect(() => {
    let interval;
    if (isPlayingReference && referencePlaybackInstance !== null) {
      interval = setInterval(async () => {
        const status = await referencePlaybackInstance.getStatusAsync();
        if (status.isLoaded) {
          const seconds = Math.floor(status.positionMillis / 1000);
          const minutes = Math.floor(seconds / 60);
          setReferencePlaybackTimer({
            minutes: minutes,
            seconds: seconds % 60
          });
        }
      }, 1000);
    } else {
      clearInterval(interval);
      setReferencePlaybackTimer({ minutes: 0, seconds: 0 });
    }
    return () => clearInterval(interval);
  }, [isPlayingReference, referencePlaybackInstance]);

  const startRecording = async () => {
    try {
      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      await newRecording.startAsync();
      setRecording(newRecording);
      setIsRecording(true);
      setRecordTimer({ minutes: 0, seconds: 0 }); // Reset record timer
    } catch (error) {
      console.error('Failed to start recording', error);
    }
  };

  const stopRecording = async () => {
    try {
      await recording.stopAndUnloadAsync();
      setIsRecording(false);
      const uri = recording.getURI();
      setRecordings([...recordings, { uri, duration: recordTimer }]);
    } catch (error) {
      console.error('Failed to stop recording', error);
    }
  };

  const deleteRecording = index => {
    const newRecordings = [...recordings];
    newRecordings.splice(index, 1);
    setRecordings(newRecordings);
  };

  const playReferenceAudio = async () => {
    setIsPlayingReference(true);
    const soundObject = new Audio.Sound();
    try {
      await soundObject.loadAsync(referenceAudioFile, {}, false);
      await soundObject.playAsync();
      setReferencePlaybackInstance(soundObject);
      soundObject.setOnPlaybackStatusUpdate(status => {
        if (status.isPlaying) {
          const seconds = Math.floor(status.positionMillis / 1000);
          const minutes = Math.floor(seconds / 60);
          setReferencePlaybackTimer({
            minutes: minutes,
            seconds: seconds % 60
          });
        }
        if (status.didJustFinish) {
          setIsPlayingReference(false);
          setReferencePlaybackTimer({ minutes: 0, seconds: 0 }); // Reset timer when finished
        }
      });
    } catch (error) {
      console.error('Failed to play reference audio', error);
    }
  };

  const playUserRecording = async (uri, index) => {
    if (isPlayingRecording === index) {
      try {
        await playbackInstance.pauseAsync();
        setIsPlayingRecording(null);
        setPlaybackInstance(null);
      } catch (error) {
        console.error('Failed to pause recording', error);
      }
    } else {
      const soundObject = new Audio.Sound();
      try {
        await soundObject.loadAsync({ uri });
        await soundObject.playAsync();
        setIsPlayingRecording(index);
        setPlaybackInstance(soundObject);
        soundObject.setOnPlaybackStatusUpdate(status => {
          if (status.didJustFinish) {
            setIsPlayingRecording(null);
            setPlaybackInstance(null);
          }
        });
      } catch (error) {
        console.error('Failed to play user recording', error);
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Yoruba Pronunciation</Text>
      </View>
      <Image source={require('./assets/679px-Yoruba_cultural_symbol.jpg')} style={styles.image} />
      <View style={styles.buttonsContainer}>
        <View style={styles.buttonWrapper}>
          <Text style={styles.referenceText}>Reference Word: {referenceWord}</Text>
          <Text style={styles.timerText}>{`${String(referencePlaybackTimer.minutes).padStart(2, '0')}:${String(referencePlaybackTimer.seconds).padStart(2, '0')}`}</Text>
          <Button title="Play Reference" onPress={playReferenceAudio} />
        </View>
        <View style={styles.buttonWrapper}>
          <Text style={styles.timerText}>{`${String(recordTimer.minutes).padStart(2, '0')}:${String(recordTimer.seconds).padStart(2, '0')}`}</Text>
          <Button
            title={isRecording ? 'Stop' : 'Record'}
            onPress={isRecording ? stopRecording : startRecording}
          />
        </View>
      </View>
      <ScrollView style={styles.recordings}>
        {recordings.map((item, index) => (
          <View key={index} style={styles.recordingItem}>
            <TouchableOpacity onPress={() => playUserRecording(item.uri, index)} style={styles.audioItem}>
              <Ionicons name={isPlayingRecording === index ? 'pause-circle-outline' : 'play-circle-outline'} size={24} color="black" />
            </TouchableOpacity>
            <View style={styles.recordingInfo}>
              <Text>{`Recording ${index + 1}`}</Text>
              <Text>{`${String(playbackTimer.minutes).padStart(2, '0')}:${String(playbackTimer.seconds).padStart(2, '0')}`}</Text>
            </View>
            <TouchableOpacity onPress={() => deleteRecording(index)} style={[styles.deleteButton, { backgroundColor: 'blue' }]}>
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
      <Footer />
    </View>
  );
};

const Stack = createStackNavigator();

export default function MainApp() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={App} />
        <Stack.Screen name="About" component={AboutScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#f4f4f4',
  },
  header: {
    width: '100%',
    backgroundColor: 'blue',
    paddingVertical: 20,
    marginTop: 20,
  },
  title: {
    fontFamily: 'MontserratAlternates-Bold',
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  image: {
    width: 200, // Adjust width as needed
    height: 200, // Adjust height as needed
    resizeMode: 'contain', // Adjust resizeMode as needed
    marginBottom: 20,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    marginTop: 20,
  },
  buttonWrapper: {
    alignItems: 'center',
  },
  referenceText: {
    fontFamily: 'MontserratAlternates-Regular',
    fontSize: 16,
  },
  timerText: {
    fontFamily: 'MontserratAlternates-Regular',
    fontSize: 18,
  },
  recordings: {
    maxHeight: 200,
    width: '100%',
  },
  recordingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  audioItem: {
    marginRight: 10,
  },
  recordingInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deleteButton: {
    marginLeft: 10,
    padding: 5,
    borderRadius: 5,
  },
  deleteText: {
    color: 'white',
  },
  footer: {
    backgroundColor: 'black',
    paddingVertical: 60,
    paddingHorizontal: 10,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    position: 'absolute',
    bottom: 0,
  },
  footerText: {
    color: 'white',
    fontFamily: 'MontserratAlternates-Regular',
    fontSize: 16,
  },
});

     
