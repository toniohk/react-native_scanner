import React from 'react';
import { StyleSheet, View, Text } from 'react-native';

const CustomHeader = () => {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>iView Scanner</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});

export default CustomHeader;