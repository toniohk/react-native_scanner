import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, Alert, Text, TextInput, TouchableOpacity } from 'react-native';
import SelectDropdown from 'react-native-select-dropdown';
import { Table, TableWrapper, Cell } from 'react-native-table-component';
import FeatherIcon from 'react-native-vector-icons/Feather';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';

import { getCycleCountJobs, getCycleCountJobRecords, updateCycleCountJobRecord } from '../../apis/quality';
import { useAppContext } from '../../hooks/context/AppContext';
import { useUserContext } from '../../hooks/context/UserContext';

const Quality = () => {
  const { mode, setLoading, showMessage } = useAppContext();
  const { userInfo } = useUserContext();
  const [jobList, setJobList] = useState([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [jobRecord, setJobRecord] = useState(null);
  const [data, setData] = useState({
    inventoryId: '',
    locationId: '',
    quantity: '1',
  });
  const [startScan, setStartScan] = useState({
    inventoryId: false,
    locationId: false,
  });
  const [result, setResult] = useState('');

  useEffect(() => {
    getJobs();
  }, []);

  const getJobs = () => {
    setLoading(true);
    getCycleCountJobs().then(res => {
      setJobList(res);
      setLoading(false);
    }).catch(() => {
      showMessage({ type: 'error', title: 'Error', message: 'Failed to load the cycle count job list.' });
      setLoading(false);
    });
  };

  const getJobRecord = (value) => {
    setJobRecord(null);
    setData({
      inventoryId: '',
      locationId: '',
      quantity: '1',
    });
    setLoading(true);
    getCycleCountJobRecords({ cycleCountId: value }).then(res => {
      setJobRecord(res);
      setLoading(false);
    }).catch(() => {
      showMessage({ type: 'error', title: 'Error', message: 'Failed to load the job record.' });
      setLoading(false);
    });
  };

  const onChangeDropDown = (value) => {
    setSelectedJob(value);
    getJobRecord(value);
  };

  const onScanned = (e, type) => {
    console.log(e);
    setData(prevState => ({ ...prevState, [type]: e.data }));
    setStartScan(prevState => ({ ...prevState, [type]: false }));
    Alert.alert("Scanned succussfully");
  };

  const onSubmit = () => {
    setLoading(true);
    const param = {
      cycleCountId: jobRecord.cycleCountId,
      recordId: jobRecord.recordId,
      quantity: data.quantity,
      locationId: `IVIEWLOC${data.locationId}`,
      inventoryId: `IVIEWINV${data.inventoryId}`,
      userId: userInfo.id,
    };
    updateCycleCountJobRecord(param).then(res => {
      setResult(res?.message || '');
      setLoading(false);
    }).catch(() => {
      showMessage({ type: 'error', title: 'Error', message: 'Failed to update the job record.' });
      setLoading(false);
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContainer} style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.contentView}>
            <Text style={styles.title}>Quality</Text>
            <SelectDropdown
              data={jobList}
              defaultValue={selectedJob}
              defaultButtonText="Select a job"
              onSelect={item => onChangeDropDown(item)}
              buttonStyle={styles.dropdownButton}
              buttonTextStyle={styles.dropdownButtonText}
              rowTextStyle={styles.dropdownRowText}
            />
            <Table borderStyle={styles.tableBorder} style={styles.table}>
              <TableWrapper style={styles.tableRow}>
                <Cell data="SKU" textStyle={styles.tableText} style={{ width: '60%' }} />
                <Cell data="Location" textStyle={styles.tableText} style={{ width: '20%' }} />
                <Cell data="Quantity" textStyle={styles.tableText} style={{ width: '20%' }} />
              </TableWrapper>
              <TableWrapper style={styles.tableRow}>
                <Cell data={jobRecord?.inventory?.sku || ''} textStyle={styles.tableText} style={{ width: '60%' }} />
                <Cell data={jobRecord?.inventory?.locationId || ''} textStyle={styles.tableText} style={{ width: '20%' }} />
                <Cell data={jobRecord?.inventory?.quantity || ''} textStyle={styles.tableText} style={{ width: '20%' }} />
              </TableWrapper>
            </Table>
            <View style={styles.barcodeView}>
              <View style={styles.inputView}>
                <TextInput
                  style={styles.textInput}
                  placeholder='Inventory Barcode'
                  placeholderTextColor='gray'
                  value={data.inventoryId}
                  onChangeText={value => setData(prevState => ({ ...prevState, inventoryId: value }))}
                />
              </View>
              {mode === 'camera' && (
                <TouchableOpacity style={styles.cameraButton} onPress={() => setStartScan(prevState => ({ ...prevState, inventoryId: true }))}>
                  <FeatherIcon name='camera' size={30} color='black' />
                </TouchableOpacity>
              )}
            </View>
            {startScan.inventoryId && (
              <QRCodeScanner
                containerStyle={styles.scannerContainer}
                cameraStyle={styles.camera}
                flashMode={RNCamera.Constants.FlashMode.torch}
                cameraType={'back'}
                onRead={e => onScanned(e, 'inventoryId')}
              />
            )}
            <View style={styles.barcodeView}>
              <View style={styles.inputView}>
                <TextInput
                  style={styles.textInput}
                  placeholder='Location Barcode'
                  placeholderTextColor='gray'
                  value={data.locationId}
                  onChangeText={value => setData(prevState => ({ ...prevState, locationId: value }))}
                />
              </View>
              {mode === 'camera' && (
                <TouchableOpacity style={styles.cameraButton} onPress={() => setStartScan(prevState => ({ ...prevState, locationId: true }))}>
                  <FeatherIcon name='camera' size={30} color='black' />
                </TouchableOpacity>
              )}
            </View>
            {startScan.locationId && (
              <QRCodeScanner
                containerStyle={styles.scannerContainer}
                cameraStyle={styles.camera}
                flashMode={RNCamera.Constants.FlashMode.torch}
                cameraType={'back'}
                onRead={e => onScanned(e, 'locationId')}
              />
            )}
            <View style={styles.barcodeView}>
              <View style={styles.inputView}>
                <TextInput
                  style={styles.textInput}
                  placeholder='Quantity'
                  placeholderTextColor='gray'
                  value={data.quantity}
                  keyboardType="numeric"
                  onChangeText={value => setData(prevState => ({ ...prevState, quantity: value }))}
                />
              </View>
            </View>
            <TouchableOpacity style={[styles.button, (!jobRecord || !data.inventoryId || !data.locationId || !data.quantity) && styles.disabled]} disabled={!jobRecord || !data.inventoryId || !data.locationId || !data.quantity} onPress={() => onSubmit()}>
              <Text style={styles.buttonText}>Process</Text>
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
  table: {
    width: '100%',
    marginVertical: 20,
  },
  tableBorder: {
    borderWidth: 1,
    borderColor: '#000000',
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableText: {
    fontSize: 12,
    margin: 6,
    textAlign: 'center',
    color: '#000',
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

export default Quality;