import React from 'react';
import { StyleSheet, View, ScrollView, Text, TouchableOpacity } from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';

import { useUserContext } from '../../hooks/context/UserContext';

const Home = (props) => {
  const { navigation } = props;
  const { setUserInfo } = useUserContext();

  const logout = () => {
    setUserInfo(false);
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContainer} style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.contentView}>
            <View style={styles.settingsButtonView}>
              <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
                <FeatherIcon name='settings' size={30} color='black' />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Lookup')}>
              <Text style={styles.buttonText}>Inventory Lookup</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Receive')}>
              <Text style={styles.buttonText}>Receive Inventory</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Move')}>
              <Text style={styles.buttonText}>Move Inventory</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Repack')}>
              <Text style={styles.buttonText}>Repack</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Shipping')}>
              <Text style={styles.buttonText}>Shipping</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Quality')}>
              <Text style={styles.buttonText}>Quality</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={() => logout()}>
              <Text style={styles.buttonText}>Log out</Text>
            </TouchableOpacity>
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
  settingsButtonView: {
    width: '100%',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  button: {
    width: '100%',
    borderRadius: 4,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    backgroundColor: '#3880ff',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default Home;