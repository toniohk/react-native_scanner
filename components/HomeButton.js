import React from 'react';
import { TouchableOpacity } from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';

const HomeButton = ({ navigation }) => {
  return (
    <TouchableOpacity onPress={() => navigation.navigate('Home')}>
      <FontAwesomeIcon name='home' size={30} color='white' />
    </TouchableOpacity>
  );
}

export default HomeButton;