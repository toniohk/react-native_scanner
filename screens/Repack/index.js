import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, View, ScrollView, Text, TextInput, TouchableOpacity, Modal, Image } from 'react-native';
import { Row, Col } from 'react-native-responsive-grid-system';
import FeatherIcon from 'react-native-vector-icons/Feather';
import EntypoIcon from 'react-native-vector-icons/Entypo';
import IoniconsIcon from 'react-native-vector-icons/Ionicons';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';
import { launchCamera } from 'react-native-image-picker';
import { RNS3 } from 'react-native-aws3';

import { repackValidation, getAWSConfig, storeImage, deleteImage } from '../../apis/repack';
import { useAppContext } from '../../hooks/context/AppContext';
import { useUserContext } from '../../hooks/context/UserContext';

const Repack = () => {
  const { mode, setLoading, showMessage } = useAppContext();
  const { userInfo } = useUserContext();
  const [awsConfig, setAwsConfig] = useState({});
  const [data, setData] = useState({
    serialNumber: '',
    partNo: '',
    quantity: '1',
    itemLabels: [{ no: 0, REESS: '', DMC: '', validate: false, images: [] }],
  });
  const [startScan, setStartScan] = useState({
    serialNumber: false,
    partNo: false,
    quantity: false,
    itemLabels: [{ no: 0, REESS: false, DMC: false }],
  });
  const [selectedItemIdx, setSelectedItemIdx] = useState(0);
  const [openImagesModal, setOpenImagesModal] = useState(false);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [openImageModal, setOpenImageModal] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    getConfig();
  }, []);

  const getConfig = () => {
    setLoading(true);
    getAWSConfig().then(res => {
      setAwsConfig(res);
      setLoading(false);
    }).catch(() => {
      showMessage({ type: 'error', title: 'Error', message: 'Failed to load AWS config' });
      setLoading(false);
    });
  };

  const onScanned = (e, type) => {
    console.log(e);
    setData(prevState => ({ ...prevState, [type]: e.data, itemLabels: { no: 0, REESS: '', DMC: '', validate: false, images: [] } }));
    setStartScan(prevState => ({ ...prevState, [type]: false }));
    Alert.alert("Scanned succussfully");
  };

  const onScannedItem = (e, i, type) => {
    console.log(e);
    setData(prevState => ({ ...prevState, itemLabels: [...prevState.itemLabels.slice(0, i), { ...prevState.itemLabels[i], [type]: e.data }, ...prevState.itemLabels.slice(i + 1)] }));
    setStartScan(prevState => ({ ...prevState, itemLabels: [...prevState.itemLabels.slice(0, i), { ...prevState.itemLabels[i], [type]: false }, ...prevState.itemLabels.slice(i + 1)] }));
    Alert.alert("Scanned succussfully");
  };

  const handleValidate = (i) => {
    setLoading(true);
    const param = {
      userID: userInfo.id,
      itemLabel: {
        REESS: data.itemLabels[i].REESS,
        DMC: data.itemLabels[i].DMC,
      },
      dunnageLabel: {
        serialNumber: data.serialNumber,
        partNo: data.partNo,
        quantity: data.quantity,
      },
    };
    repackValidation(param).then(res => {
      if (res?.result) {
        setData(prevState => ({ ...prevState, itemLabels: [...prevState.itemLabels.slice(0, i), { ...prevState.itemLabels[i], validate: true }, ...prevState.itemLabels.slice(i + 1)] }));
        showMessage({ type: 'success', title: 'Success', message: res.message });
        if (res.complete) {
          setCompleted(true);
        } else {
          if (data.itemLabels.length < 9) {
            setStartScan(prevState => ({ ...prevState, itemLabels: [...prevState.itemLabels, { no: prevState.itemLabels.length, REESS: false, DMC: false }] }));
            setData(prevState => ({ ...prevState, itemLabels: [...prevState.itemLabels, { no: prevState.itemLabels.length, REESS: '', DMC: '', validate: false, images: [] }] }));
          }
        }
      } else {
        showMessage({ type: 'error', title: 'Error', message: res?.message || 'Failed to validate the line item' });
      }

      setLoading(false);
    }).catch(() => {
      showMessage({ type: 'error', title: 'Error', message: 'Failed to validate the line item.' });
      setLoading(false);
    });
  };

  const showPhotos = (i) => {
    setSelectedItemIdx(i);
    setOpenImagesModal(true);
  };

  const takePhoto = () => {
    const options = {
      title: 'You can capture image from camera',
      storageOptions: {
        skipBackup: true
      }
    };

    launchCamera(options, response => {
      if (response.didCancel) {
        console.log('User cancelled photo picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      } else {
        const filePath = response?.assets[0];
        setLoading(true);
        const options = {
          keyPrefix: `images/${data.itemLabels[selectedItemIdx].REESS}/`,
          bucket: awsConfig.bucket,
          region: awsConfig.region,
          accessKey: awsConfig.key,
          secretKey: awsConfig.secret,
          successActionStatus: 201,
        };
        const file = {
          uri: filePath?.uri,
          name: filePath?.fileName,
          type: filePath?.type,
        };
        RNS3.put(file, options)
          .then(res => {
            if (res.status === 201) {
              const { postResponse } = res.body;
              const param = {
                url: postResponse.location,
                userID: userInfo.id,
                fileName: filePath.fileName,
                itemLabel: {
                  REESS: data.itemLabels[selectedItemIdx].REESS,
                  DMC: data.itemLabels[selectedItemIdx].DMC,
                },
              };
              storeImage(param).then(res => {
                if (res.result) {
                  setData(prevState => ({ ...prevState, itemLabels: [...prevState.itemLabels.slice(0, selectedItemIdx), { ...prevState.itemLabels[selectedItemIdx], images: [...prevState.itemLabels[selectedItemIdx].images, { uri: postResponse.location, fileName: filePath.fileName }] }, ...prevState.itemLabels.slice(selectedItemIdx + 1)] }));
                  setLoading(false);
                } else {
                  Alert.alert(res.message);
                  setLoading(false);
                }
              }).catch(() => {
                Alert.alert("Failed to store image.");
                setLoading(false);
              });
            } else {
              Alert.alert("Failed to upload to s3.");
              setLoading(false);
            }
          }).catch(() => {
            Alert.alert("Failed to upload to s3.");
            setLoading(false);
          });
      }
    });
  };

  const showImageModal = (index) => {
    setSelectedImageIdx(index);
    setOpenImageModal(true);
  };

  const handleDeleteImage = () => {
    setOpenImageModal(false);
    setLoading(true);
    const param = {
      url: data.itemLabels[selectedItemIdx].images[selectedImageIdx].uri,
      userID: userInfo.id,
      fileName: data.itemLabels[selectedItemIdx].images[selectedImageIdx].fileName,
      itemLabel: {
        REESS: data.itemLabels[selectedItemIdx].REESS,
        DMC: data.itemLabels[selectedItemIdx].DMC,
      },
    };
    deleteImage(param).then(res => {
      if (res.result) {
        setData(prevState => ({ ...prevState, itemLabels: [...prevState.itemLabels.slice(0, selectedItemIdx), { ...prevState.itemLabels[selectedItemIdx], images: [...prevState.itemLabels[selectedItemIdx].images.slice(0, selectedImageIdx), ...prevState.itemLabels[selectedItemIdx].images.slice(selectedImageIdx + 1)] }, ...prevState.itemLabels.slice(selectedItemIdx + 1)] }));
        setLoading(false);
      } else {
        Alert.alert(res.message);
        setLoading(false);
      }
    }).catch(() => {
      Alert.alert("Failed to delete image.");
      setLoading(false);
    });
  };

  const handleReset = () => {
    setStartScan({
      serialNumber: false,
      partNo: false,
      quantity: false,
      itemLabels: [{ no: 0, REESS: false, DMC: false }],
    });
    setData({
      serialNumber: '',
      partNo: '',
      quantity: '1',
      itemLabels: [{ no: 0, REESS: '', DMC: '', validate: false, images: [] }],
    });
    setSelectedItemIdx(0);
    setSelectedImageIdx(0);
    setCompleted(false);
  };

  return (
    <>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollViewContainer} style={styles.scrollView}>
          <View style={styles.content}>
            <View style={styles.contentView}>
              <Text style={styles.title}>Repack</Text>
              <View style={styles.barcodeView}>
                <View style={styles.inputView}>
                  <TextInput
                    style={styles.textInput}
                    placeholder='Serial Number'
                    placeholderTextColor='gray'
                    value={data.serialNumber}
                    onChangeText={value => setData(prevState => ({ ...prevState, serialNumber: value }))}
                  />
                </View>
                {mode === 'camera' && (
                  <TouchableOpacity style={styles.cameraButton} onPress={() => setStartScan(prevState => ({ ...prevState, serialNumber: true }))}>
                    <FeatherIcon name='camera' size={30} color='black' />
                  </TouchableOpacity>
                )}
              </View>
              {startScan.serialNumber && (
                <QRCodeScanner
                  containerStyle={styles.scannerContainer}
                  cameraStyle={styles.camera}
                  flashMode={RNCamera.Constants.FlashMode.torch}
                  cameraType={'back'}
                  onRead={e => onScanned(e, 'serialNumber')}
                />
              )}
              <View style={styles.barcodeView}>
                <View style={styles.inputView}>
                  <TextInput
                    style={styles.textInput}
                    placeholder='Part No'
                    placeholderTextColor='gray'
                    value={data.partNo}
                    onChangeText={value => setData(prevState => ({ ...prevState, partNo: value }))}
                  />
                </View>
                {mode === 'camera' && (
                  <TouchableOpacity style={styles.cameraButton} onPress={() => setStartScan(prevState => ({ ...prevState, partNo: true }))}>
                    <FeatherIcon name='camera' size={30} color='black' />
                  </TouchableOpacity>
                )}
              </View>
              {startScan.partNo && (
                <QRCodeScanner
                  containerStyle={styles.scannerContainer}
                  cameraStyle={styles.camera}
                  flashMode={RNCamera.Constants.FlashMode.torch}
                  cameraType={'back'}
                  onRead={e => onScanned(e, 'partNo')}
                />
              )}
              <View style={styles.barcodeView}>
                <View style={styles.inputView}>
                  <TextInput
                    style={styles.textInput}
                    placeholder='Quantity'
                    placeholderTextColor='gray'
                    value={data.quantity}
                    onChangeText={value => setData(prevState => ({ ...prevState, quantity: value }))}
                  />
                </View>
                {mode === 'camera' && (
                  <TouchableOpacity style={styles.cameraButton} onPress={() => setStartScan(prevState => ({ ...prevState, quantity: true }))}>
                    <FeatherIcon name='camera' size={30} color='black' />
                  </TouchableOpacity>
                )}
              </View>
              {startScan.quantity && (
                <QRCodeScanner
                  containerStyle={styles.scannerContainer}
                  cameraStyle={styles.camera}
                  flashMode={RNCamera.Constants.FlashMode.torch}
                  cameraType={'back'}
                  onRead={e => onScanned(e, 'quantity')}
                />
              )}
              {!!data.serialNumber && !!data.partNo && !!data.quantity && (
                data.itemLabels.map((item, idx) => (
                  <View key={idx} style={styles.itemContainer}>
                    <View style={styles.itemView}>
                      <View style={styles.itemInputView}>
                        <TextInput
                          style={styles.itemTextInput}
                          placeholder='REESS'
                          placeholderTextColor='gray'
                          value={item.REESS}
                          onChangeText={value => setData(prevState => ({ ...prevState, itemLabels: [...prevState.itemLabels.slice(0, idx), { ...prevState.itemLabels[idx], REESS: value }, ...prevState.itemLabels.slice(idx + 1)] }))}
                        />
                        {mode === 'camera' && (
                          <TouchableOpacity style={styles.itemCameraButton} onPress={() => setStartScan(prevState => ({ ...prevState, itemLabels: [...prevState.itemLabels.slice(0, idx), { ...prevState.itemLabels[idx], REESS: true }, ...prevState.itemLabels.slice(idx + 1)] }))}>
                            <FeatherIcon name='camera' size={28} color='black' />
                          </TouchableOpacity>
                        )}
                      </View>
                      <View style={styles.itemInputView}>
                        <TextInput
                          style={styles.itemTextInput}
                          placeholder='DMC'
                          placeholderTextColor='gray'
                          value={item.DMC}
                          onChangeText={value => setData(prevState => ({ ...prevState, itemLabels: [...prevState.itemLabels.slice(0, idx), { ...prevState.itemLabels[idx], DMC: value }, ...prevState.itemLabels.slice(idx + 1)] }))}
                        />
                        {mode === 'camera' && (
                          <TouchableOpacity style={styles.itemCameraButton} onPress={() => setStartScan(prevState => ({ ...prevState, itemLabels: [...prevState.itemLabels.slice(0, idx), { ...prevState.itemLabels[idx], DMC: true }, ...prevState.itemLabels.slice(idx + 1)] }))}>
                            <FeatherIcon name='camera' size={28} color='black' />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                    {startScan.itemLabels[idx].REESS && (
                      <QRCodeScanner
                        containerStyle={styles.scannerContainer}
                        cameraStyle={styles.camera}
                        flashMode={RNCamera.Constants.FlashMode.torch}
                        cameraType={'back'}
                        onRead={e => onScannedItem(e, 1, 'REESS')}
                      />
                    )}
                    {startScan.itemLabels[idx].DMC && (
                      <QRCodeScanner
                        containerStyle={styles.scannerContainer}
                        cameraStyle={styles.camera}
                        flashMode={RNCamera.Constants.FlashMode.torch}
                        cameraType={'back'}
                        onRead={e => onScannedItem(e, 1, 'DMC')}
                      />
                    )}
                    <View style={styles.itemView}>
                      <TouchableOpacity style={[styles.itemValidateButton, (item.REESS.length > 29 || item.REESS.length < 1 || item.DMC.length < 31 || item.DMC.length > 44) && styles.disabled]} disabled={item.REESS.length > 29 || item.REESS.length < 1 || item.DMC.length < 31 || item.DMC.length > 44} onPress={() => handleValidate(idx)}>
                        <Text style={styles.buttonText}>Validate</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.itemUploadButton, !item.validate && styles.disabled]} disabled={!item.validate} onPress={() => showPhotos(idx)}>
                        <Text style={styles.buttonText}>Upload photos</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
              {completed && (
                <TouchableOpacity style={styles.button} onPress={() => handleReset()}>
                  <Text style={styles.buttonText}>Complete</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
      </View>
      <Modal
        animationType="slide"
        visible={openImagesModal}
      >
        <View style={[styles.container, { zIndex: 99, elevation: 99 }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => setOpenImagesModal(false)}>
            <IoniconsIcon name='arrow-back' size={30} color='black' />
          </TouchableOpacity>
          <ScrollView contentContainerStyle={styles.scrollViewContainer} style={styles.scrollView}>
            <View style={styles.content}>
              <View style={[styles.contentView, { alignItems: 'flex-start' }]}>
                <Row>
                  {data.itemLabels[selectedItemIdx].images.map((item, idx) => (
                    <Col xs={4} sm={4} md={4} lg={4} key={idx}>
                      <TouchableOpacity style={styles.imageItem} onPress={() => showImageModal(idx)}>
                        <Image
                          source={{ uri: item.uri }}
                          style={{ width: '100%', height: '100%' }}
                        />
                      </TouchableOpacity>
                    </Col>
                  ))}
                  {data.itemLabels[selectedItemIdx].images.length < 100 && (
                    <Col xs={4} sm={4} md={4} lg={4}>
                      <TouchableOpacity style={styles.imageItem} onPress={() => takePhoto()}>
                        <EntypoIcon name='plus' size={50} color='black' />
                      </TouchableOpacity>
                    </Col>
                  )}
                </Row>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
      <Modal
        animationType="slide"
        visible={openImageModal}
      >
        <View style={[styles.container, { zIndex: 999, elevation: 999 }]}>
          <View style={{ width: '100%', height: '100%' }}>
            {!!data.itemLabels[selectedItemIdx].images[selectedImageIdx] && (
              <Image
                source={{ uri: data.itemLabels[selectedItemIdx].images[selectedImageIdx].uri }}
                style={{ width: '100%', height: '100%' }}
              />
            )}
          </View>
          <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: '25%', position: 'absolute', bottom: 40 }}>
            <TouchableOpacity onPress={() => setOpenImageModal(false)}>
              <FontAwesomeIcon name='check' size={50} color='green' />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDeleteImage()}>
              <FontAwesomeIcon name='remove' size={50} color='red' />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  itemContainer: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#aaaaaa',
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  itemView: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 40,
    marginTop: 10,
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
  itemValidateButton: {
    width: '48%',
    borderRadius: 4,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#589758',
  },
  itemUploadButton: {
    width: '48%',
    borderRadius: 4,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#d58e25',
  },
  itemButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
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
  disabled: {
    opacity: 0.5,
  },
  backButton: {
    marginTop: 20,
    marginLeft: 20,
  },
  imageItem: {
    marginBottom: 10,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dedede',
  },
});

export default Repack;