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
  Button,
} from 'react-native';
import {OCRFrame, scanOCR} from 'vision-camera-ocr';
import {
  useCameraDevices,
  useFrameProcessor,
  Camera,
} from 'react-native-vision-camera';
import {accelerometer} from 'react-native-sensors';

export default function CameraScreen({navigation}:any) {
  const [hasPermission, setHasPermission] = React.useState(false);
  const [ocr, setOcr] = React.useState<OCRFrame>();
  const [pixelRatio, setPixelRatio] = React.useState<number>(1);
  const devices = useCameraDevices();
  const device = devices.back;
  let value: string = '';
  const subscription = accelerometer.subscribe(
    ({x, y, z, timestamp}) => (value = 'x=' + x + 'y=' + y + 'z=' + z),
  );

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
      {/* <Button
        title="Go to Details... again"
        //onPress={() => navigation.navigate('Details')}
      /> */}

      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
        <Text
          style={{
            fontSize: 25,
            justifyContent: 'center',
            textAlign: 'center',
          }}>
          {value}
        </Text>
      </View>

      {/* {renderOverlay()} */}
    </>
  ) : (
    <View>
      <Text>No available cameras</Text>
    </View>
  );
}
