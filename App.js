import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, TouchableOpacity, ScrollView } from 'react-native';
import { Audio } from 'expo-av';

// Import the reference MP3 file
const referenceAudioFile = require('./assets/reference.mp3');

export default function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState(null);
  const [recordings, setRecordings] = useState([]);
  const [timer, setTimer] = useState({ minutes: 0, seconds: 0 });

  const referenceWord = "Hello, shey àtí bẹ̀rẹ̀ ni?";

  useEffect(() => {
    Audio.requestPermissionsAsync();
  }, []);

  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setTimer(prevTimer => {
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
      setTimer({ minutes: 0, seconds: 0 });
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const recordingObject = new Audio.Recording();
      await recordingObject.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      await recordingObject.startAsync();
      setRecording(recordingObject);
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording', error);
    }
  };

  const stopRecording = async () => {
    try {
      await recording.stopAndUnloadAsync();
      setIsRecording(false);
      const uri = recording.getURI();
      setRecordings([...recordings, uri]);
    } catch (error) {
      console.error('Failed to stop recording', error);
    }
  };

  const deleteRecording = (index) => {
    // Check if recordings is an array before deleting
    if (Array.isArray(recordings)) {
      const newRecordings = [...recordings];
      newRecordings.splice(index, 1);
      setRecordings(newRecordings);
    } else {
      console.error('recordings is not an array:', recordings);
    }
  };

  const playReferenceAudio = async () => {
    const soundObject = new Audio.Sound();
    try {
      await soundObject.loadAsync(referenceAudioFile);
      await soundObject.playAsync();
    } catch (error) {
      console.error('Failed to play reference audio', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Yoruba Pronunciation</Text>
      </View>
      <View style={styles.reference}>
        <Text style={styles.referenceText}>Reference Word: {referenceWord}</Text>
        <Button title="Play Reference" onPress={playReferenceAudio} />
      </View>
      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>{`${String(timer.minutes).padStart(2, '0')}:${String(timer.seconds).padStart(2, '0')}`}</Text>
      </View>
      <ScrollView style={styles.recordings}>
        {recordings.map((uri, index) => (
          <View key={index} style={styles.recordingItem}>
            <AudioPlayer uri={uri} />
            <TouchableOpacity onPress={() => deleteRecording(index)} style={styles.deleteButton}>
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
      <Button
        title={isRecording ? 'Stop' : 'Record'}
        onPress={isRecording ? stopRecording : startRecording}
      />
    </View>
  );
}

function AudioPlayer(props) {
  const { uri } = props;
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <TouchableOpacity onPress={togglePlayback} style={styles.audioItem}>
      <Text>{uri}</Text>
      <Text>{isPlaying ? "Pause" : "Play"}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start', // Align items at the top
    backgroundColor: '#f4f4f4',
  },
  header: {
    width: '100%',
    backgroundColor: 'blue',
    paddingVertical: 20,
    // Remove marginTop or set it to 0
    marginTop: 0, 
  },
  title: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  reference: {
    marginTop: 20,
  },
  referenceText: {
    fontSize: 16,
  },
  timerContainer: {
    marginTop: 10,
  },
  timerText: {
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
    flex: 1,
  },
  deleteButton: {
    marginLeft: 10,
  },
  deleteText: {
    color: 'red',
  },
});