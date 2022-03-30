import React, { createContext, useState, useContext } from 'react';
import PropTypes from 'prop-types';
import Toast from 'react-native-toast-message';

export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState(null);

  const showMessage = ({ type, title, message }) => {
    Toast.show({
      type: type,
      text1: title,
      text2: message,
      position: 'bottom',
    });
  };

  return <AppContext.Provider value={{ loading, setLoading, mode, setMode, showMessage }}>
    {children}
  </AppContext.Provider>;
};

AppContextProvider.propTypes = {
  children: PropTypes.object,
};

export default AppContextProvider;
export const useAppContext = () => useContext(AppContext);