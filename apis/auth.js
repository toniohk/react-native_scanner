import api from './api';

const getUserList = () => {
  return new Promise((resolve, reject) => {
    api.get('/Login/GetUserList').then(response => {
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

const login = (data) => {
  return new Promise((resolve, reject) => {
    api.post('/Login/GetUserValid', data).then(response => {
      if (response.status === 200 && response.data?.result) {
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

export { getUserList, login };