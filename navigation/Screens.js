import React from 'react';
import { StatusBar, View } from 'react-native';
import Spinner from 'react-native-loading-spinner-overlay';
import { createStackNavigator } from "@react-navigation/stack";
import Toast from 'react-native-toast-message';

import CustomHeader from '../components/CustomHeader';
import HomeButton from '../components/HomeButton';

import LoginScreen from '../screens/Login';
import HomeScreen from '../screens/Home';
import SettingsScreen from '../screens/Settings';
import LookupScreen from '../screens/Lookup';
import ReceiveScreen from '../screens/Receive';
import MoveScreen from '../screens/Move';
import RepackScreen from '../screens/Repack';
import ShippingScreen from '../screens/Shipping';
import QualityScreen from '../screens/Quality';

import { useAppContext } from '../hooks/context/AppContext';

const Stack = createStackNavigator();

const OnboardingStack = () => {
  const { loading } = useAppContext();

  return (
    <View style={{ flex: 1 }}>
      <StatusBar
        backgroundColor="#000000"
        barStyle="light-content"
      />
      <Spinner
        visible={loading}
        textStyle={{ color: 'white' }}
      />
      <Stack.Navigator
        mode="card"
        headerMode="screen"
        initialRouteName="Login"
        screenOptions={{
          cardStyle: {
            backgroundColor: '#ffffff',
          },
          headerStyle: {
            backgroundColor: '#3880ff',
            height: 40
          }
        }}
      >
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={() => ({
            headerTitle: props => <CustomHeader {...props} />,
            headerLeft: () => null
          })}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={() => ({
            headerTitle: props => <CustomHeader {...props} />,
            headerLeft: () => null
          })}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={({ navigation }) => ({
            headerTitle: props => <CustomHeader {...props} />,
            headerRight: props => <HomeButton {...props} navigation={navigation} />,
            headerRightContainerStyle: { paddingRight: 20 },
            headerLeft: () => null
          })}
        />
        <Stack.Screen
          name="Lookup"
          component={LookupScreen}
          options={({ navigation }) => ({
            headerTitle: props => <CustomHeader {...props} />,
            headerRight: props => <HomeButton {...props} navigation={navigation} />,
            headerRightContainerStyle: { paddingRight: 20 },
            headerLeft: () => null
          })}
        />
        <Stack.Screen
          name="Receive"
          component={ReceiveScreen}
          options={({ navigation }) => ({
            headerTitle: props => <CustomHeader {...props} />,
            headerRight: props => <HomeButton {...props} navigation={navigation} />,
            headerRightContainerStyle: { paddingRight: 20 },
            headerLeft: () => null
          })}
        />
        <Stack.Screen
          name="Move"
          component={MoveScreen}
          options={({ navigation }) => ({
            headerTitle: props => <CustomHeader {...props} />,
            headerRight: props => <HomeButton {...props} navigation={navigation} />,
            headerRightContainerStyle: { paddingRight: 20 },
            headerLeft: () => null
          })}
        />
        <Stack.Screen
          name="Repack"
          component={RepackScreen}
          options={({ navigation }) => ({
            headerTitle: props => <CustomHeader {...props} />,
            headerRight: props => <HomeButton {...props} navigation={navigation} />,
            headerRightContainerStyle: { paddingRight: 20 },
            headerLeft: () => null
          })}
        />
        <Stack.Screen
          name="Shipping"
          component={ShippingScreen}
          options={({ navigation }) => ({
            headerTitle: props => <CustomHeader {...props} />,
            headerRight: props => <HomeButton {...props} navigation={navigation} />,
            headerRightContainerStyle: { paddingRight: 20 },
            headerLeft: () => null
          })}
        />
        <Stack.Screen
          name="Quality"
          component={QualityScreen}
          options={({ navigation }) => ({
            headerTitle: props => <CustomHeader {...props} />,
            headerRight: props => <HomeButton {...props} navigation={navigation} />,
            headerRightContainerStyle: { paddingRight: 20 },
            headerLeft: () => null
          })}
        />
      </Stack.Navigator>
      <Toast />
    </View>
  );
};

export default OnboardingStack;