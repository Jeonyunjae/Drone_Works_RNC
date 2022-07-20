import React, {useState} from 'react';
import {Text, View} from 'react-native';
import {
  accelerometer,
  gyroscope,
  SensorTypes,
  setUpdateIntervalForType,
} from 'react-native-sensors';
import {map, filter} from 'rxjs/operators';
setUpdateIntervalForType(SensorTypes.gyroscope, 400); // defaults to 100ms

export function HomeScreen() {
  const [value_X, setValue_X] = useState(0);
  const [value_Y, setValue_Y] = useState(0);
  const [value_Z, setValue_Z] = useState(0);
  const [value_SUM, setValue_SUM] = useState(0);

  //gyroscope ->value_SUM 0.1 이하
  const subscription = gyroscope.subscribe(({x, y, z, timestamp}) => {
    setValue_X(x), setValue_Y(y), setValue_Z(z),setValue_SUM((Math.abs(x)+Math.abs(y)+Math.abs(z))/3);
  });

  //   const subscription = accelerometer
  //     .pipe(
  //       map(({x, y, z}) => x + y + z),
  //       filter(speed => speed > 20),
  //     )
  //     .subscribe(
  //       speed => console.log(`You moved your phone with ${speed}`),
  //       error => {
  //         console.log('The sensor is not available');
  //       },
  //     );

  //   setTimeout(() => {
  //     // If it's the last subscription to accelerometer it will stop polling in the native API
  //     subscription.unsubscribe();
  //   }, 1000);

  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
      <Text>X={value_X}</Text>
      <Text>Y={value_Y}</Text>
      <Text>Z={value_Z}</Text>
      <Text>value_SUM={value_SUM}</Text>
    </View>
  );
}
