import api from './api';

const getReceiveInventory = (data) => {
  return new Promise((resolve, reject) => {
    api.post('/Receiving/ReceiveInventory', data).then(response => {
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

const getProjectList = () => {
  return new Promise((resolve, reject) => {
    api.get('/Receiving/GetProjectList').then(response => {
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

const getReceiveInventoryV2 = (data) => {
  return new Promise((resolve, reject) => {
    api.post('/Receiving/ReceiveInventoryV2', data).then(response => {
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

export { getReceiveInventory, getProjectList, getReceiveInventoryV2 };