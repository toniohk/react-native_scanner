import React, { useState } from 'react';
import { Alert, StyleSheet, View, ScrollView, Text, TextInput, TouchableOpacity } from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';

import { getInventoryLookup } from '../../apis/lookup';
import { useAppContext } from '../../hooks/context/AppContext';

const Lookup = () => {
  const { mode, setLoading, showMessage } = useAppContext();
  const [barcode, setBarcode] = useState('');
  const [startScan, setStartScan] = useState(false);
  const [result, setResult] = useState('');

  const onScanned = e => {
    console.log(e);
    setBarcode(e.data);
    setStartScan(false);
    Alert.alert("Scanned succussfully");
  };

  const onSubmit = () => {
    setLoading(true);
    const param = {
      inventoryId: `IVIEWINV${barcode}`
    };
    getInventoryLookup(param).then(res => {
      setResult('Location: ' + res?.locationName || '');
      setLoading(false);
    }).catch(() => {
      showMessage({ type: 'error', title: 'Error', message: 'Failed to load lookup inventory.' });
      setLoading(false);
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContainer} style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.contentView}>
            <Text style={styles.title}>Lookup Inventory</Text>
            <View style={styles.barcodeView}>
              <View style={styles.inputView}>
                <TextInput
                  style={styles.textInput}
                  placeholder='Inventory Barcode'
                  placeholderTextColor='gray'
                  value={barcode}
                  onChangeText={value => setBarcode(value)}
                />
              </View>
              {mode === 'camera' && (
                <TouchableOpacity style={styles.cameraButton} onPress={() => setStartScan(true)}>
                  <FeatherIcon name='camera' size={30} color='black' />
                </TouchableOpacity>
              )}
            </View>
            {startScan && (
              <QRCodeScanner
                containerStyle={styles.scannerContainer}
                cameraStyle={styles.camera}
                flashMode={RNCamera.Constants.FlashMode.torch}
                cameraType={'back'}
                onRead={onScanned}
              />
            )}
            <TouchableOpacity style={[styles.button, !barcode && styles.disabled]} disabled={!barcode} onPress={() => onSubmit()}>
              <Text style={styles.buttonText}>Go</Text>
            </TouchableOpacity>
            <View style={styles.textAreaView}>
              <TextInput
                multiline
                numberOfLines={6}
                style={styles.textArea}
                value={`${result}`}
                editable={false}
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
  title: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  barcodeView: {
    width: '100%',
    height: 50,
    marginTop: 20,
  },
  inputView: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f2f2f2',
    borderRadius: 4,
  },
  textInput: {
    height: 50,
    flex: 1,
    padding: 10,
    paddingLeft: 20,
    color: '#000',
  },
  cameraButton: {
    position: 'absolute',
    right: 8,
    top: 8,
    opacity: 0.8,
  },
  scannerContainer: {
    width: '100%',
    aspectRatio: 1.5,
    marginTop: 20,
    backgroundColor: '#e1ebf9'
  },
  camera: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
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
  textAreaView: {
    width: '100%',
    backgroundColor: '#f2f2f2',
    marginTop: 30,
    borderRadius: 4,
    height: 150,
    justifyContent: 'center'
  },
  textArea: {
    paddingLeft: 20,
    color: '#000',
    textAlignVertical: 'top'
  },
  disabled: {
    opacity: 0.5,
  },
});

export default Lookup;