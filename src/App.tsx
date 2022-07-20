// In App.js in a new project

import * as React from 'react';
import {View, Text} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import CameraScreen from './screen/CameraScreen';
import SensorScreen from './screen/SensorScreen';
import {createStackNavigator} from '@react-navigation/stack';
import {RootStackParamList} from './navigation/type';
import HomeScreen from './screen/HomeScreen';

const Stack = createNativeStackNavigator();
const RootStack = createStackNavigator<RootStackParamList>();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{title: 'HomeScreen'}}
        />
        <Stack.Screen
          name="Camera"
          component={CameraScreen}
          options={{title: 'CameraScreen'}}
        />
        <Stack.Screen
          name="Sensor"
          component={SensorScreen}
          options={{title: 'SensorScreen'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
