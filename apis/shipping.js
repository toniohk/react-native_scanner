import api from './api';

const getOpenOrders = () => {
  return new Promise((resolve, reject) => {
    api.get('/Shipping/GetOpenOrders').then(response => {
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

const getOrderLineItems = (data) => {
  return new Promise((resolve, reject) => {
    api.post('/Shipping/GetOrderLineItems', data).then(response => {
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

const lineItemPicked = (data) => {
  return new Promise((resolve, reject) => {
    api.post('/Shipping/LineItemPicked', data).then(response => {
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

const validateOrderLineScanned = (data) => {
  return new Promise((resolve, reject) => {
    api.post('/Shipping/ValidateOrderLineScanned', data).then(response => {
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

export { getOpenOrders, getOrderLineItems, lineItemPicked, validateOrderLineScanned };