/* eslint-disable react-native/no-inline-styles */
import * as React from 'react';

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
import {
  accelerometer,
  gyroscope,
  SensorTypes,
  setUpdateIntervalForType,
} from 'react-native-sensors';
import {map, filter} from 'rxjs/operators';
import {useState} from 'react';
import { runOnJS } from 'react-native-reanimated';

setUpdateIntervalForType(SensorTypes.gyroscope, 400); // defaults to 100ms

export default function SensorScreen({navigation}: any) {
  const [hasPermission, setHasPermission] = React.useState(false);
  const [ocr, setOcr] = React.useState<OCRFrame>();
  const [pixelRatio, setPixelRatio] = React.useState<number>(1);
  const devices = useCameraDevices();
  const device = devices.back;

  const [X, setX] = useState(0);
  const [Y, setY] = useState(0);
  const [Z, setZ] = useState(0);
  const [moveValue, setMoveValue] = useState(0);
  const [moveFlag, setMoveFlag] = useState(false);

  const subscription = gyroscope.subscribe(({x, y, z, timestamp}) => {
    let tempMoveValue:number = Math.abs(x) + Math.abs(y) + Math.abs(z);

    setX(x);
    setY(y);
    setZ(z);

    if (tempMoveValue < 0.1) {
      if(tempMoveValue != moveValue){
        setMoveFlag(true);
        setMoveValue(tempMoveValue);
      }
    }
  });

  const frameProcessor = useFrameProcessor(frame => {
    'worklet';
    if(moveFlag == true){
      console.log(moveValue);
      //ocr
      runOnJS(setMoveFlag)(false);
    }
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

      <Text style={{ color: "white" }}>value_SUM={moveValue}</Text>
      <Text style={{ color: "white" }}>x={X}</Text>
      <Text style={{ color: "white" }}>y={Y}</Text>
      <Text style={{ color: "white" }}>z={Z}</Text>
    </>
  ) : (
    <View>
      <Text>No available cameras</Text>
    </View>
  );
}
