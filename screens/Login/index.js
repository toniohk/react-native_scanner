import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, Alert, Text, TextInput, TouchableOpacity } from 'react-native';
import SelectDropdown from 'react-native-select-dropdown';

import { getUserList, login } from '../../apis/auth';
import { useAppContext } from '../../hooks/context/AppContext';
import { useUserContext } from '../../hooks/context/UserContext';

const Login = (props) => {
  const { navigation } = props;
  const { setLoading, showMessage } = useAppContext();
  const { setUserInfo } = useUserContext();
  const [userList, setUserList] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [data, setData] = useState({
    userName: '',
    pin: '',
  });

  useEffect(() => {
    setLoading(true);
    getUserList().then(res => {
      setUserList(res);
      setLoading(false);
    }).catch(() => {
      showMessage({ type: 'error', title: 'Error', message: 'Failed to load the user list.' });
      setLoading(false);
    });
  }, []);

  const handleInputChange = (inputName, inputValue) => {
    setData(prevState => ({ ...prevState, [inputName]: inputValue }));
  };

  const onChangeDropDown = (value) => {
    setSelectedUser(userList.find(item => item.name === value));
    setData(prevState => ({ ...prevState, userName: value }));
  };

  const handleLogin = () => {
    if (data.userName.length === 0) {
      Alert.alert("User is not selected.");
    } else if (data.pin.length === 0) {
      Alert.alert("Name is empty.");
    } else {
      setLoading(true);
      login(data).then(res => {
        setUserInfo({ ...selectedUser, version: res.version });
        showMessage({ type: 'success', title: 'Success', message: 'You have successfully logged in.' });
        navigation.navigate('Home');
        setLoading(false);
        setData(prevState => ({ ...prevState, pin: '' }));
      }).catch(() => {
        showMessage({ type: 'error', title: 'Error', message: 'Failed to login.' });
        setLoading(false);
      });
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContainer} style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.contentView}>
            <SelectDropdown
              data={userList.map(item => item.name)}
              defaultValue={data.userName}
              defaultButtonText="Select a user"
              onSelect={item => onChangeDropDown(item)}
              buttonStyle={styles.dropdownButton}
              buttonTextStyle={styles.dropdownButtonText}
              rowTextStyle={styles.dropdownRowText}
            />
            <View style={styles.inputView}>
              <TextInput
                style={styles.textInput}
                placeholder='Enter a pin'
                placeholderTextColor='gray'
                value={data.pin}
                onChangeText={value => handleInputChange('pin', value)}
              />
            </View>
            <TouchableOpacity style={styles.button} onPress={() => handleLogin()}>
              <Text style={styles.buttonText}>LOGIN</Text>
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
  inputView: {
    width: '100%',
    backgroundColor: '#f2f2f2',
    borderRadius: 4,
    height: 50,
    marginTop: 20,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  textInput: {
    height: 50,
    flex: 1,
    padding: 10,
    paddingLeft: 20,
    color: '#000',
  },
  button: {
    width: '100%',
    borderRadius: 4,
    height: 50,
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
  dropdownButton: {
    width: '100%',
    backgroundColor: '#f2f2f2',
    borderRadius: 4,
    height: 50,
    marginTop: 20,
  },
  dropdownButtonText: {
    width: '100%',
    color: '#000',
    fontSize: 14,
    textAlign: 'left',
    margin: 0,
  },
  dropdownRowText: {
    marginLeft: 20,
    color: '#000',
    fontSize: 14,
    textAlign: 'left',
  },
});

export default Login;