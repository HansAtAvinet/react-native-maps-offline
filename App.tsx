import React, { useRef } from "react";
import { StyleSheet, View, Dimensions } from "react-native";
import * as FileSystem from "expo-file-system";
import MapView, { UrlTile } from "react-native-maps";
import { OfflineDownloader } from "./OfflineDownloader";

const { width, height } = Dimensions.get("window");

function calculateZoomFromRegion(region: Region) {
  const GLOBE_WIDTH = 256; // a constant in Google's map projection
  const pixelWidth = width;
  const west = region.longitude - region.longitudeDelta / 2;
  const east = region.longitude + region.longitudeDelta / 2;
  var angle = east - west;
  if (angle < 0) {
    angle += 360;
  }
  var zoom = Math.floor(
    Math.log((pixelWidth * 360) / angle / GLOBE_WIDTH) / Math.LN2
  );
  console.log("calculated zoom level: ", zoom);
}

export type LatLng = {
  latitude: number;
  longitude: number;
};

export type MarkerType = {
  coordinate: LatLng;
  key: number;
  color: string;
};

export type Region = {
  latitude: number;
  latitudeDelta: number;
  longitude: number;
  longitudeDelta: number;
};

const App = (props: any) => {
  const region = {
    latitude: 65.45056820308791,
    latitudeDelta: 17.724108951273813,
    longitude: 13.668749537318945,
    longitudeDelta: 22.964847944676876,
  };

  const [currentZoom, setCurrentZoom] = React.useState<number>();
  const [currentRegion, setCurrentRegion] = React.useState<Region>();

  const map = useRef<any>();

  // Get this from list of selected map layers
  const mapServices = [
    {
      name: "norgeskart_bakgrunn",
      urlTemplate:
        "https://opencache.statkart.no/gatekeeper/gk/gk.open_gmaps?layers=norgeskart_bakgrunn&zoom={z}&x={x}&y={y}",
    },
  ];

  // Get this from the current Task
  const taskId = "abc123";

  console.log("render", { currentZoom });
  return (
    <View style={styles.container}>
      <MapView
        ref={(ref) => {
          map.current = ref;
        }}
        provider={props.provider}
        style={styles.map}
        initialRegion={region}
        // onPress={(e) => onMapPress(e)}
        onRegionChange={async (r: Region, details: any) => {
          console.log("region change: ", r);
          setCurrentRegion(r);
          const camera = await map.current.getCamera();
          let zoom = camera.zoom;
          if (!zoom) {
            zoom = calculateZoomFromRegion(r);
          }
          setCurrentZoom(Math.floor(zoom));
        }}
      >
        <UrlTile
          /**
           * The path template of the locally stored tiles. The patterns {x} {y} {z} will be replaced at runtime
           * For example, /storage/emulated/0/mytiles/{z}/{x}/{y}.png
           */
          urlTemplate={`${FileSystem.cacheDirectory}/mapcache/${taskId}/${mapServices[0].name}/{z}/{x}/{y}`}
        />
      </MapView>
      <OfflineDownloader
        region={currentRegion}
        zoom={currentZoom}
        mapServices={mapServices}
        taskId={taskId}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  bubble: {
    backgroundColor: "rgba(255,255,255,0.7)",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20,
  },
  latlng: {
    width: 200,
    alignItems: "stretch",
  },
  button: {
    width: 80,
    paddingHorizontal: 12,
    alignItems: "center",
    marginHorizontal: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    marginVertical: 20,
    backgroundColor: "transparent",
  },
});

export default App;
