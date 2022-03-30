import React from 'react';
import { StyleSheet, View, ScrollView, Text, Switch } from 'react-native';

import { useAppContext } from '../../hooks/context/AppContext';

const Settings = () => {
  const { mode, setMode } = useAppContext();

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContainer} style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.contentView}>
            <View style={styles.switchContainer}>
              <Text style={styles.switchText}>Use Zebra Scanner</Text>
              <Switch
                trackColor={{ false: "#767577", true: "#0000FF" }}
                thumbColor="white"
                ios_backgroundColor="#3e3e3e"
                onValueChange={() => setMode(prevState => prevState === 'zebra' ? null : 'zebra')}
                value={mode === 'zebra'}
              />
            </View>
            <View style={styles.switchContainer}>
              <Text style={styles.switchText}>Use Device Camera</Text>
              <Switch
                trackColor={{ false: "#767577", true: "#0000FF" }}
                thumbColor="white"
                ios_backgroundColor="#3e3e3e"
                onValueChange={() => setMode(prevState => prevState === 'camera' ? null : 'camera')}
                value={mode === 'camera'}
              />
            </View>
            <View style={styles.switchContainer}>
              <Text style={styles.switchText}>Use Built-In Scanner</Text>
              <Switch
                trackColor={{ false: "#767577", true: "#0000FF" }}
                thumbColor="white"
                ios_backgroundColor="#3e3e3e"
                onValueChange={() => setMode(prevState => prevState === 'other' ? null : 'other')}
                value={mode === 'other'}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  scrollViewContainer: {
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  scrollView: {
    width: '100%',
    backgroundColor: '#ffffff',
  },
  content: {
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingBottom: 50,
    marginBottom: 50,
  },
  contentView: {
    width: '80%',
    alignItems: 'center',
    marginVertical: 20,
  },
  switchContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    marginVertical: 20,
  },
  switchText: {
    fontSize: 18,
  },
});

export default Settings;