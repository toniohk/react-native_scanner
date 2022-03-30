/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import type { Node } from 'react';
import { LogBox } from 'react-native';
import SplashScreen from 'react-native-splash-screen';
import { NavigationContainer } from '@react-navigation/native';

import Screens from './navigation/Screens';

import AppContextProvider from './hooks/context/AppContext';
import UserContextProvider from './hooks/context/UserContext';

const App: () => Node = () => {
  useEffect(() => {
    SplashScreen.hide();
    LogBox.ignoreLogs(['Animated: `useNativeDriver`', 'componentWillReceiveProps']);
  }, []);

  return (
    <NavigationContainer>
      <AppContextProvider>
        <UserContextProvider>
          <Screens />
        </UserContextProvider>
      </AppContextProvider>
    </NavigationContainer>
  );
};

export default App;
