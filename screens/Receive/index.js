import React, { useState, useEffect } from 'react';
import { Alert, StyleSheet, View, ScrollView, Text, TextInput, TouchableOpacity } from 'react-native';
import SelectDropdown from 'react-native-select-dropdown';
import FeatherIcon from 'react-native-vector-icons/Feather';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';

import { getReceiveInventory, getProjectList, getReceiveInventoryV2 } from '../../apis/receive';
import { useAppContext } from '../../hooks/context/AppContext';
import { useUserContext } from '../../hooks/context/UserContext';

const Receive = () => {
  const { mode, setLoading, showMessage } = useAppContext();
  const { userInfo } = useUserContext();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [data1, setData1] = useState({
    inventoryId: '',
    locationId: '',
    quantity: '1'
  });
  const [startScan1, setStartScan1] = useState({
    locationId: false,
    locationId: false,
  });
  const [data2, setData2] = useState({
    zgs: '',
    sku: '',
    quality: '',
    locationBarcode: '',
    itemLabels: Array(9).fill(1).map((v, i) => ({ no: i, REESS: '', DMC: '' })),
    containerID: '',
    partNo: '',
    date: '',
  });
  const [startScan2, setStartScan2] = useState({
    locationBarcode: false,
    itemLabels: Array(9).fill(1).map((v, i) => ({ no: i, REESS: false, DMC: false })),
    containerID: false,
    partNo: false,
    date: false,
  });
  const [result, setResult] = useState('');

  useEffect(() => {
    getProjects();
  }, []);

  const getProjects = () => {
    setLoading(true);
    getProjectList().then(res => {
      setProjects(res);
      setSelectedProject(res.find(item => item.isDefault === true));
      setLoading(false);
    }).catch(() => {
      showMessage({ type: 'error', title: 'Error', message: 'Failed to load the project list.' });
      setLoading(false);
    });
  };

  const onChangeDropDown = (value) => {
    setSelectedProject(projects.find(item => item.projectName === value));
  };

  const onScanned1 = (e, type) => {
    console.log(e);
    setData1(prevState => ({ ...prevState, [type]: e.data }));
    setStartScan1(prevState => ({ ...prevState, [type]: false }));
    Alert.alert("Scanned succussfully");
  };

  const onScanned2 = (e, type) => {
    console.log(e);
    setData2(prevState => ({ ...prevState, [type]: e.data }));
    setStartScan2(prevState => ({ ...prevState, [type]: false }));
    Alert.alert("Scanned succussfully");
  };

  const onScannedItem = (e, i, type) => {
    console.log(e);
    setData2(prevState => ({ ...prevState, itemLabels: [...prevState.itemLabels.slice(0, i), { ...prevState.itemLabels[i], [type]: e.data }, ...prevState.itemLabels.slice(i + 1)] }));
    setStartScan2(prevState => ({ ...prevState, itemLabels: [...prevState.itemLabels.slice(0, i), { ...prevState.itemLabels[i], [type]: false }, ...prevState.itemLabels.slice(i + 1)] }));
    Alert.alert("Scanned succussfully");
  };

  const onSubmit1 = () => {
    setLoading(true);
    const param = {
      inventoryId: `IVIEWINV${data1.inventoryId}`,
      locationId: `IVIEWLOC${data1.locationId}`,
      quantity: data1.quantity,
      userId: userInfo.id,
    };
    getReceiveInventory(param).then(res => {
      setResult(res?.message || '');
      setLoading(false);
    }).catch(() => {
      showMessage({ type: 'error', title: 'Error', message: 'Failed to load receive inventory.' });
      setLoading(false);
    });
  };

  const onSubmit2 = () => {
    setLoading(true);
    const param = {
      userID: userInfo.id,
      projectId: selectedProject.id,
      zgs: data2.zgs,
      sku: data2.sku,
      quality: data2.quality,
      locationBarcode: data2.locationBarcode,
      itemLabels: data2.itemLabels,
      masterLabel: {
        containerID: data2.containerID,
        partNo: data2.partNo,
        date: data2.date,
      },
    };
    getReceiveInventoryV2(param).then(res => {
      setResult(res?.message || '');
      setLoading(false);
    }).catch(() => {
      showMessage({ type: 'error', title: 'Error', message: 'Failed to load receive inventory.' });
      setLoading(false);
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContainer} style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.contentView}>
            <Text style={styles.title}>Receive Inventory</Text>
            {userInfo.version === 1 ? (
              <>
                <View style={styles.barcodeView}>
                  <View style={styles.inputView}>
                    <TextInput
                      style={styles.textInput}
                      placeholder='Inventory Barcode'
                      placeholderTextColor='gray'
                      value={data1.inventoryId}
                      onChangeText={value => setData1(prevState => ({ ...prevState, inventoryId: value }))}
                    />
                  </View>
                  {mode === 'camera' && (
                    <TouchableOpacity style={styles.cameraButton} onPress={() => setStartScan1(prevState => ({ ...prevState, inventoryId: true }))}>
                      <FeatherIcon name='camera' size={30} color='black' />
                    </TouchableOpacity>
                  )}
                </View>
                {startScan1.inventoryId && (
                  <QRCodeScanner
                    containerStyle={styles.scannerContainer}
                    cameraStyle={styles.camera}
                    flashMode={RNCamera.Constants.FlashMode.torch}
                    cameraType={'back'}
                    onRead={e => onScanned1(e, 'inventoryId')}
                  />
                )}
                <View style={styles.barcodeView}>
                  <View style={styles.inputView}>
                    <TextInput
                      style={styles.textInput}
                      placeholder='Location Barcode'
                      placeholderTextColor='gray'
                      value={data1.locationId}
                      onChangeText={value => setData1(prevState => ({ ...prevState, locationId: value }))}
                    />
                  </View>
                  {mode === 'camera' && (
                    <TouchableOpacity style={styles.cameraButton} onPress={() => setStartScan1(prevState => ({ ...prevState, locationId: true }))}>
                      <FeatherIcon name='camera' size={30} color='black' />
                    </TouchableOpacity>
                  )}
                </View>
                {startScan1.locationId && (
                  <QRCodeScanner
                    containerStyle={styles.scannerContainer}
                    cameraStyle={styles.camera}
                    flashMode={RNCamera.Constants.FlashMode.torch}
                    cameraType={'back'}
                    onRead={e => onScanned1(e, 'locationId')}
                  />
                )}
                <View style={styles.barcodeView}>
                  <View style={styles.inputView}>
                    <TextInput
                      style={styles.textInput}
                      placeholder='Quantity'
                      placeholderTextColor='gray'
                      value={data1.quantity}
                      keyboardType="numeric"
                      onChangeText={value => setData1(prevState => ({ ...prevState, quantity: value }))}
                    />
                  </View>
                </View>
                <TouchableOpacity style={[styles.button, (!data1.inventoryId || !data1.locationId || !data1.quantity) && styles.disabled]} disabled={!data1.inventoryId || !data1.locationId || !data1.quantity} onPress={() => onSubmit1()}>
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
              </>
            ) : (
              <>
                <SelectDropdown
                  data={projects.map(item => item.projectName)}
                  defaultValue={selectedProject?.projectName || ''}
                  defaultButtonText="Select a project"
                  onSelect={item => onChangeDropDown(item)}
                  buttonStyle={styles.dropdownButton}
                  buttonTextStyle={styles.dropdownButtonText}
                  rowTextStyle={styles.dropdownRowText}
                />
                <View style={styles.barcodeView}>
                  <View style={styles.inputView}>
                    <TextInput
                      style={styles.textInput}
                      placeholder='ZGS'
                      placeholderTextColor='gray'
                      value={data2.zgs}
                      onChangeText={value => setData2(prevState => ({ ...prevState, zgs: value }))}
                    />
                  </View>
                </View>
                <View style={styles.barcodeView}>
                  <View style={styles.inputView}>
                    <TextInput
                      style={styles.textInput}
                      placeholder='SKU'
                      placeholderTextColor='gray'
                      value={data2.sku}
                      onChangeText={value => setData2(prevState => ({ ...prevState, sku: value }))}
                    />
                  </View>
                </View>
                <View style={styles.barcodeView}>
                  <View style={styles.inputView}>
                    <TextInput
                      style={styles.textInput}
                      placeholder='Quality'
                      placeholderTextColor='gray'
                      value={data2.quality}
                      onChangeText={value => setData2(prevState => ({ ...prevState, quality: value }))}
                    />
                  </View>
                </View>
                <View style={styles.barcodeView}>
                  <View style={styles.inputView}>
                    <TextInput
                      style={styles.textInput}
                      placeholder='Location Barcode'
                      placeholderTextColor='gray'
                      value={data2.locationBarcode}
                      onChangeText={value => setData2(prevState => ({ ...prevState, locationBarcode: value }))}
                    />
                  </View>
                  {mode === 'camera' && (
                    <TouchableOpacity style={styles.cameraButton} onPress={() => setStartScan2(prevState => ({ ...prevState, locationBarcode: true }))}>
                      <FeatherIcon name='camera' size={30} color='black' />
                    </TouchableOpacity>
                  )}
                </View>
                {startScan2.locationBarcode && (
                  <QRCodeScanner
                    containerStyle={styles.scannerContainer}
                    cameraStyle={styles.camera}
                    flashMode={RNCamera.Constants.FlashMode.torch}
                    cameraType={'back'}
                    onRead={e => onScanned2(e, 'locationBarcode')}
                  />
                )}
                <View style={styles.barcodeView}>
                  <View style={styles.inputView}>
                    <TextInput
                      style={styles.textInput}
                      placeholder='Container ID'
                      placeholderTextColor='gray'
                      value={data2.containerID}
                      onChangeText={value => setData2(prevState => ({ ...prevState, containerID: value }))}
                    />
                  </View>
                  {mode === 'camera' && (
                    <TouchableOpacity style={styles.cameraButton} onPress={() => setStartScan2(prevState => ({ ...prevState, containerID: true }))}>
                      <FeatherIcon name='camera' size={30} color='black' />
                    </TouchableOpacity>
                  )}
                </View>
                {startScan2.containerID && (
                  <QRCodeScanner
                    containerStyle={styles.scannerContainer}
                    cameraStyle={styles.camera}
                    flashMode={RNCamera.Constants.FlashMode.torch}
                    cameraType={'back'}
                    onRead={e => onScanned2(e, 'containerID')}
                  />
                )}
                <View style={styles.barcodeView}>
                  <View style={styles.inputView}>
                    <TextInput
                      style={styles.textInput}
                      placeholder='Part No'
                      placeholderTextColor='gray'
                      value={data2.partNo}
                      onChangeText={value => setData2(prevState => ({ ...prevState, partNo: value }))}
                    />
                  </View>
                  {mode === 'camera' && (
                    <TouchableOpacity style={styles.cameraButton} onPress={() => setStartScan2(prevState => ({ ...prevState, partNo: true }))}>
                      <FeatherIcon name='camera' size={30} color='black' />
                    </TouchableOpacity>
                  )}
                </View>
                {startScan2.partNo && (
                  <QRCodeScanner
                    containerStyle={styles.scannerContainer}
                    cameraStyle={styles.camera}
                    flashMode={RNCamera.Constants.FlashMode.torch}
                    cameraType={'back'}
                    onRead={e => onScanned2(e, 'partNo')}
                  />
                )}
                <View style={styles.barcodeView}>
                  <View style={styles.inputView}>
                    <TextInput
                      style={styles.textInput}
                      placeholder='Date'
                      placeholderTextColor='gray'
                      value={data2.date}
                      keyboardType="numeric"
                      onChangeText={value => setData2(prevState => ({ ...prevState, date: value }))}
                    />
                  </View>
                  {mode === 'camera' && (
                    <TouchableOpacity style={styles.cameraButton} onPress={() => setStartScan2(prevState => ({ ...prevState, date: true }))}>
                      <FeatherIcon name='camera' size={30} color='black' />
                    </TouchableOpacity>
                  )}
                </View>
                {startScan2.date && (
                  <QRCodeScanner
                    containerStyle={styles.scannerContainer}
                    cameraStyle={styles.camera}
                    flashMode={RNCamera.Constants.FlashMode.torch}
                    cameraType={'back'}
                    onRead={e => onScanned2(e, 'date')}
                  />
                )}
                {data2.itemLabels.map((item, idx) => (
                  <View key={idx} style={{ width: '100%' }}>
                    <View style={styles.itemView}>
                      <View style={styles.itemInputView}>
                        <TextInput
                          style={styles.itemTextInput}
                          placeholder='REESS'
                          placeholderTextColor='gray'
                          value={item.REESS}
                          onChangeText={value => setData2(prevState => ({ ...prevState, itemLabels: [...prevState.itemLabels.slice(0, idx), { ...prevState.itemLabels[idx], REESS: value }, ...prevState.itemLabels.slice(idx + 1)] }))}
                        />
                        {mode === 'camera' && (
                          <TouchableOpacity style={styles.itemCameraButton} onPress={() => setStartScan2(prevState => ({ ...prevState, itemLabels: [...prevState.itemLabels.slice(0, idx), { ...prevState.itemLabels[idx], REESS: true }, ...prevState.itemLabels.slice(idx + 1)] }))}>
                            <FeatherIcon name='camera' size={26} color='black' />
                          </TouchableOpacity>
                        )}
                      </View>
                      <View style={styles.itemInputView}>
                        <TextInput
                          style={styles.itemTextInput}
                          placeholder='DMC'
                          placeholderTextColor='gray'
                          value={item.DMC}
                          onChangeText={value => setData2(prevState => ({ ...prevState, itemLabels: [...prevState.itemLabels.slice(0, idx), { ...prevState.itemLabels[idx], DMC: value }, ...prevState.itemLabels.slice(idx + 1)] }))}
                        />
                        {mode === 'camera' && (
                          <TouchableOpacity style={styles.itemCameraButton} onPress={() => setStartScan2(prevState => ({ ...prevState, itemLabels: [...prevState.itemLabels.slice(0, idx), { ...prevState.itemLabels[idx], DMC: true }, ...prevState.itemLabels.slice(idx + 1)] }))}>
                            <FeatherIcon name='camera' size={26} color='black' />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                    {startScan2.itemLabels[idx].REESS && (
                      <QRCodeScanner
                        containerStyle={styles.scannerContainer}
                        cameraStyle={styles.camera}
                        flashMode={RNCamera.Constants.FlashMode.torch}
                        cameraType={'back'}
                        onRead={e => onScannedItem(e, 1, 'REESS')}
                      />
                    )}
                    {startScan2.itemLabels[idx].DMC && (
                      <QRCodeScanner
                        containerStyle={styles.scannerContainer}
                        cameraStyle={styles.camera}
                        flashMode={RNCamera.Constants.FlashMode.torch}
                        cameraType={'back'}
                        onRead={e => onScannedItem(e, 1, 'DMC')}
                      />
                    )}
                  </View>
                ))}
                <TouchableOpacity style={[styles.button, (!data2.zgs || !data2.sku || !data2.quality || !data2.locationBarcode || !data2.containerID || !data2.partNo || !data2.date || !selectedProject || !data2.itemLabels.find(item => item.REESS.length < 30 && item.REESS.length > 0 && item.DMC.length > 30 && item.DMC.length < 45)) && styles.disabled]} disabled={!data2.zgs || !data2.sku || !data2.quality || !data2.locationBarcode || !data2.containerID || !data2.partNo || !data2.date || !selectedProject || !data2.itemLabels.find(item => item.REESS.length < 30 && item.REESS.length > 0 && item.DMC.length > 30 && item.DMC.length < 45)} onPress={() => onSubmit2()}>
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
              </>
            )}
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
  itemView: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 40,
    marginTop: 20,
  },
  itemInputView: {
    width: '48%',
    height: '100%',
    backgroundColor: '#f2f2f2',
    borderRadius: 4,
  },
  itemTextInput: {
    height: 40,
    flex: 1,
    padding: 10,
    color: '#000',
    fontSize: 12,
  },
  cameraButton: {
    position: 'absolute',
    right: 8,
    top: 8,
    opacity: 0.8,
  },
  itemCameraButton: {
    position: 'absolute',
    right: 8,
    top: 6,
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
  disabled: {
    opacity: 0.5,
  },
});

export default Receive;