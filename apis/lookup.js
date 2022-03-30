import api from './api';

const getInventoryLookup = (data) => {
  return new Promise((resolve, reject) => {
    api.post('/Lookup/GetInventoryLookup', data).then(response => {
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

export { getInventoryLookup };