/* eslint-disable react-native/no-inline-styles */
import * as React from 'react';

import {runOnJS} from 'react-native-reanimated';
import {
  StyleSheet,
  View,
  Text,
  LayoutChangeEvent,
  PixelRatio,
  TouchableOpacity,
  Alert,
  Clipboard,
} from 'react-native';
import {OCRFrame, scanOCR} from 'vision-camera-ocr';
import {
  useCameraDevices,
  useFrameProcessor,
  Camera,
} from 'react-native-vision-camera';
import { accelerometer, gyroscope, SensorTypes, setUpdateIntervalForType } from 'react-native-sensors';
import { map, filter } from "rxjs/operators";
import { useState } from 'react';


setUpdateIntervalForType(SensorTypes.accelerometer, 400); // defaults to 100ms

export default function SensorScreen() {
  const [hasPermission, setHasPermission] = React.useState(false);
  const [ocr, setOcr] = React.useState<OCRFrame>();
  const [pixelRatio, setPixelRatio] = React.useState<number>(1);
  const devices = useCameraDevices();
  const device = devices.back;

  const [value_X, setValue_X] = useState(0);
  const [value_Y, setValue_Y] = useState(0);
  const [value_Z, setValue_Z] = useState(0);
  const [value_SUM, setValue_SUM] = useState(0);


  //gyroscope ->value_SUM 0.1 이하
  const subscription = gyroscope.subscribe(({x, y, z, timestamp}) => {
    setValue_X(x), setValue_Y(y), setValue_Z(z),setValue_SUM((Math.abs(x)+Math.abs(y)+Math.abs(z)));
  });


  const frameProcessor = useFrameProcessor(frame => {
    'worklet';
    const data = scanOCR(frame);
    console.log(JSON.stringify(data));
    runOnJS(setOcr)(data);
  }, []);

  React.useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'authorized');
    })();
  }, []);

  const renderOverlay = () => {
    return (
      <>
        {ocr?.result.blocks.map(block => {
          return (
            <TouchableOpacity
              onPress={() => {
                Clipboard.setString(block.text);
                Alert.alert(`"${block.text}" copied to the clipboard`);
              }}
              style={{
                position: 'absolute',
                left: block.frame.x * pixelRatio,
                top: block.frame.y * pixelRatio,
                backgroundColor: 'white',
                padding: 8,
                borderRadius: 6,
              }}>
              <Text
                style={{
                  fontSize: 25,
                  justifyContent: 'center',
                  textAlign: 'center',
                }}>
                {block.text}
              </Text>
            </TouchableOpacity>
          );
        })}
      </>
    );
  };

  return device !== undefined && hasPermission ? (
    <>
      <Camera
        style={[StyleSheet.absoluteFill]}
        frameProcessor={frameProcessor}
        device={device}
        isActive={true}
        frameProcessorFps={5}
        onLayout={(event: LayoutChangeEvent) => {
          setPixelRatio(
            event.nativeEvent.layout.width /
              PixelRatio.getPixelSizeForLayoutSize(
                event.nativeEvent.layout.width,
              ),
          );
        }}
      />
      {renderOverlay()}

      <Text>X={value_X}</Text>
      <Text>Y={value_Y}</Text>
      <Text>Z={value_Z}</Text>
      <Text>value_SUM={value_SUM}</Text>
    </>
  ) : (
    <View>
      <Text>No available cameras</Text>
    </View>
  );
}
