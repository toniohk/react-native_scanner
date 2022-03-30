import api from './api';

const getCycleCountJobs = () => {
  return new Promise((resolve, reject) => {
    api.get('/Quality/GetCycleCountJobs').then(response => {
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

const getCycleCountJobRecords = (data) => {
  return new Promise((resolve, reject) => {
    api.post('/Quality/GetCycleCountJobRecords', data).then(response => {
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

const updateCycleCountJobRecord = (data) => {
  return new Promise((resolve, reject) => {
    api.post('/Quality/UpdateCycleCountJobRecord', data).then(response => {
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

export { getCycleCountJobs, getCycleCountJobRecords, updateCycleCountJobRecord };