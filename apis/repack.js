import api from './api';

const repackValidation = (data) => {
  return new Promise((resolve, reject) => {
    api.post('/Repack/RepackValidation', data).then(response => {
      if (response.status === 200) {
        resolve(response.data);
      } else {
        reject(response.data);
      }
    }).catch(error => {
      console.log(error);
      reject(error);
    });
  });
};

const getAWSConfig = () => {
  return new Promise((resolve, reject) => {
    api.get('/AWS/AWSConfig').then(response => {
      if (response.status === 200) {
        resolve(response.data);
      } else {
        reject(response.data);
      }
    }).catch(error => {
      console.log(error);
      reject(error);
    });
  });
};

const storeImage = (data) => {
  return new Promise((resolve, reject) => {
    api.post('/AWS/StoreImage', data).then(response => {
      if (response.status === 200) {
        resolve(response.data);
      } else {
        reject(response.data);
      }
    }).catch(error => {
      console.log(error);
      reject(error);
    });
  });
};

const deleteImage = (data) => {
  return new Promise((resolve, reject) => {
    api.post('/AWS/DeleteImage', data).then(response => {
      if (response.status === 200) {
        resolve(response.data);
      } else {
        reject(response.data);
      }
    }).catch(error => {
      console.log(error);
      reject(error);
    });
  });
};

export { repackValidation, getAWSConfig, storeImage, deleteImage };