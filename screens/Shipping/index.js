import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView, Alert, Text, TextInput, TouchableOpacity } from 'react-native';
import SelectDropdown from 'react-native-select-dropdown';
import { Table, TableWrapper, Cell } from 'react-native-table-component';
import FeatherIcon from 'react-native-vector-icons/Feather';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';

import { getOpenOrders, getOrderLineItems, lineItemPicked, validateOrderLineScanned } from '../../apis/shipping';
import { useAppContext } from '../../hooks/context/AppContext';
import { useUserContext } from '../../hooks/context/UserContext';

const Shipping = () => {
  const { mode, setLoading, showMessage } = useAppContext();
  const { userInfo } = useUserContext();
  const [orderList, setOrderList] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState('');
  const [lineItems, setLineItems] = useState([]);
  const [completed, setCompleted] = useState(false);
  const [selectedLineItem, setSelectedLineItem] = useState(null);
  const [data1, setData1] = useState({
    inventoryId: '',
    locationId: '',
    quantity: '1',
  });
  const [startScan1, setStartScan1] = useState({
    inventoryId: false,
    locationId: false,
  });
  const [data2, setData2] = useState({
    serialNumber: '',
    partNo: '',
    quantity: '1',
  });
  const [startScan2, setStartScan2] = useState({
    serialNumber: false,
    partNo: false,
  });

  useEffect(() => {
    getOrders();
  }, []);

  const getOrders = () => {
    setLoading(true);
    getOpenOrders().then(res => {
      setOrderList(res);
      setLoading(false);
    }).catch(() => {
      showMessage({ type: 'error', title: 'Error', message: 'Failed to load the open order list.' });
      setLoading(false);
    });
  };

  const getLineItems = (value) => {
    setLineItems([]);
    setSelectedLineItem(null);
    setData1({
      inventoryId: '',
      locationId: '',
      quantity: '1',
    });
    setData2({
      serialNumber: '',
      partNo: '',
      quantity: '1',
    });
    setLoading(true);
    getOrderLineItems({ orderId: value }).then(res => {
      setLineItems(res);
      setLoading(false);
    }).catch(() => {
      showMessage({ type: 'error', title: 'Error', message: 'Failed to load the order line items.' });
      setLoading(false);
    });
  };

  const onChangeDropDown = (value) => {
    setSelectedOrder(value);
    getLineItems(value);
    setCompleted(false);
  };

  const handlePick = (item) => {
    setSelectedLineItem(item);
    setData1({
      inventoryId: '',
      locationId: '',
      quantity: '1',
    });
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

  const handleUnpick = (item) => {

  };

  const pick = () => {
    setLoading(true);
    const param = {
      orderNumber: selectedOrder,
      quantity: data1.quantity,
      locationId: `IVIEWLOC${data1.locationId}`,
      inventoryId: `IVIEWINV${data1.inventoryId}`,
      userId: userInfo.id,
    };
    lineItemPicked(param).then(res => {
      if (res.result) {
        showMessage({ type: 'success', title: 'Success', message: res.message });
        if (res.complete) {
          setCompleted(true);
        }
      } else {
        showMessage({ type: 'error', title: 'Error', message: res.message });
      }

      setLoading(false);
    }).catch(() => {
      showMessage({ type: 'error', title: 'Error', message: 'Failed to pick line item.' });
      setLoading(false);
    });
  };

  const validate = () => {
    setLoading(true);
    const param = {
      orderID: selectedOrder,
      dunnageLabel: {
        serialNumber: data2.serialNumber,
        partNo: data2.partNo,
        quantity: data2.quantity,
      },
      userId: userInfo.id,
    };
    validateOrderLineScanned(param).then(res => {
      if (res.result) {
        showMessage({ type: 'success', title: 'Success', message: res.message });
        if (res.complete) {
          setCompleted(true);
        }
      } else {
        showMessage({ type: 'error', title: 'Error', message: res.message });
      }

      setLoading(false);
    }).catch(() => {
      showMessage({ type: 'error', title: 'Error', message: 'Failed to pick line item.' });
      setLoading(false);
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContainer} style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.contentView}>
            <Text style={styles.title}>Shipping</Text>
            <SelectDropdown
              data={orderList}
              defaultValue={selectedOrder}
              defaultButtonText="Select an order"
              onSelect={item => onChangeDropDown(item)}
              buttonStyle={styles.dropdownButton}
              buttonTextStyle={styles.dropdownButtonText}
              rowTextStyle={styles.dropdownRowText}
            />
            <Table borderStyle={styles.tableBorder} style={styles.table}>
              <TableWrapper style={styles.tableRow}>
                <Cell data="SKU" textStyle={styles.tableText} style={{ width: '40%' }} />
                <Cell data="Location" textStyle={styles.tableText} style={{ width: '20%' }} />
                <Cell data="Qty" textStyle={styles.tableText} style={{ width: '10%' }} />
                <Cell data="Status" textStyle={styles.tableText} style={{ width: '30%' }} />
              </TableWrapper>
              {lineItems.map((item, idx) => (
                <TableWrapper style={styles.tableRow} key={idx}>
                  <Cell data={item.inventory.sku} textStyle={styles.tableText} style={{ width: '40%' }} />
                  <Cell data={item.inventory.locationId} textStyle={styles.tableText} style={{ width: '20%' }} />
                  <Cell data={item.inventory.quantity} textStyle={styles.tableText} style={{ width: '10%' }} />
                  <Cell
                    data={item.picked ? (
                      <TouchableOpacity onPress={() => handleUnpick(item)}>
                        <Text style={[styles.tableText, { color: 'blue' }]}>Picked</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity onPress={() => handlePick(item)}>
                        <Text style={[styles.tableText, { color: 'red' }]}>Not Picked</Text>
                      </TouchableOpacity>
                    )}
                    textStyle={styles.tableText}
                    style={{ width: '30%' }}
                  />
                </TableWrapper>
              ))}
            </Table>
            {!completed && (userInfo.version === 1 ? (
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
                <TouchableOpacity style={[styles.button, (!selectedLineItem || !data1.inventoryId || !data1.locationId || !data1.quantity) && styles.disabled]} disabled={!selectedLineItem || !data1.inventoryId || !data1.locationId || !data1.quantity} onPress={() => pick()}>
                  <Text style={styles.buttonText}>Pick</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={styles.barcodeView}>
                  <View style={styles.inputView}>
                    <TextInput
                      style={styles.textInput}
                      placeholder='Serial Number'
                      placeholderTextColor='gray'
                      value={data2.serialNumber}
                      onChangeText={value => setData2(prevState => ({ ...prevState, serialNumber: value }))}
                    />
                  </View>
                  {mode === 'camera' && (
                    <TouchableOpacity style={styles.cameraButton} onPress={() => setStartScan2(prevState => ({ ...prevState, serialNumber: true }))}>
                      <FeatherIcon name='camera' size={30} color='black' />
                    </TouchableOpacity>
                  )}
                </View>
                {startScan2.serialNumber && (
                  <QRCodeScanner
                    containerStyle={styles.scannerContainer}
                    cameraStyle={styles.camera}
                    flashMode={RNCamera.Constants.FlashMode.torch}
                    cameraType={'back'}
                    onRead={e => onScanned2(e, 'serialNumber')}
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
                      placeholder='Quantity'
                      placeholderTextColor='gray'
                      value={data2.quantity}
                      keyboardType="numeric"
                      onChangeText={value => setData2(prevState => ({ ...prevState, quantity: value }))}
                    />
                  </View>
                </View>
                <TouchableOpacity style={[styles.button, (!selectedLineItem || !data2.serialNumber || !data2.partNo || !data2.quantity) && styles.disabled]} disabled={!selectedLineItem || !data2.serialNumber || !data2.partNo || !data2.quantity} onPress={() => validate()}>
                  <Text style={styles.buttonText}>Validate</Text>
                </TouchableOpacity>
              </>
            ))}
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
  disabled: {
    opacity: 0.5,
  },
});

export default Shipping;