import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const AboutScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Learn Yoruba Like a Native: Speak with Confidence</Text>
      <Text style={styles.body}>
        We at Yoruba Pronunciator are passionate about empowering people to connect with the Yoruba language and culture through accurate pronunciation. Our mission is to make Yoruba learning accessible and engaging for everyone, regardless of background or experience.
        {"\n\n"}
        We understand the challenges of mastering Yoruba pronunciation. Tones and sounds can be unfamiliar to non-native speakers. That's why we've developed a unique approach that combines:
        {"\n\n"}
        Native speaker recordings: Immerse yourself in authentic Yoruba with crystal-clear audio from native speakers.
        {"\n\n"}
        Focus on everyday usage: Learn the most practical Yoruba words and phrases you'll use in real-life conversations.
        {"\n\n"}
        Whether you're a beginner looking for a solid foundation or a more advanced learner wanting to polish your accent, Yoruba Pronunciator is your perfect Yoruba pronunciation companion.
        {"\n\n"}
        We are proud to announce our partnership with ledeyoruba.com, a leading platform for Yoruba language resources and education. Together, we are committed to providing you with comprehensive and effective tools to enhance your Yoruba language skills.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  body: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default AboutScreen;