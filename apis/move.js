import api from './api';

const getInventoryMove = (data) => {
  return new Promise((resolve, reject) => {
    api.post('/Receiving/InventoryMove', data).then(response => {
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

export { getInventoryMove };