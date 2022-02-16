import React from "react";
import { StyleSheet, TouchableOpacity, Text, View } from "react-native";
import * as FileSystem from "expo-file-system";
import type { Region, LatLng } from "./App";
import { LatLonToTile } from "./tileMath";

type MapServiceDefinition = {
  name: string;
  urlTemplate: string;
};

type OfflineDownloaderProps = {
  region: Region | undefined;
  zoom: number | undefined;
  mapServices: MapServiceDefinition[];
  taskId: string;
};

// From region, calculate top left, bottom right corners
// From corners, calculate ranges of tiles we need to download for some specified zoom levels
const OfflineDownloader = (props: OfflineDownloaderProps) => {
  const { region, zoom, mapServices, taskId } = props;
  const downloadOfflineAreaForTask = async (
    region: Region | undefined,
    zoom: number | undefined,
    mapService: MapServiceDefinition,
    taskId: string
  ) => {
    if (!region || !zoom) {
      return;
    }
    const northLat = region.latitude + region.latitudeDelta / 2;
    const southLat = region.latitude - region.latitudeDelta / 2;
    const westLon = region.longitude - region.longitudeDelta / 2;
    const eastLon = region.longitude + region.longitudeDelta / 2;
    const nw: LatLng = {
      latitude: -northLat,
      longitude: westLon,
    };

    const se: LatLng = {
      latitude: -southLat,
      longitude: eastLon,
    };

    console.log("NW tile: ", LatLonToTile(nw.latitude, nw.longitude, zoom));
    console.log("SE tile: ", LatLonToTile(se.latitude, se.longitude, zoom));
    const nwTile = LatLonToTile(nw.latitude, nw.longitude, zoom);
    const seTile = LatLonToTile(se.latitude, se.longitude, zoom);

    // Prepare paths
    const phoneUrlTemplate = `${FileSystem.cacheDirectory}/mapcache/${taskId}/${mapService.name}/{z}/{x}/{y}`;

    // Loop tiles, download pngs, save to phone ------------------
    const startX = nwTile.tx;
    const stopX = seTile.tx;
    const startY = nwTile.ty;
    const stopY = seTile.ty;
    let x = startX;
    while (x <= stopX) {
      const folder = `${FileSystem.cacheDirectory}/mapcache/${taskId}/${mapService.name}/${zoom}/${x}`;
      await FileSystem.makeDirectoryAsync(folder, {
        intermediates: true,
      });
      let y = startY;
      while (y <= stopY) {
        // console.log({ x, y });
        var downloadUrl = mapService.urlTemplate
          .replace("{z}", zoom as any)
          .replace("{x}", x as any)
          .replace("{y}", y as any);
        console.log("Downloading ", downloadUrl);
        const phoneUrl = phoneUrlTemplate
          .replace("{z}", zoom as any)
          .replace("{x}", x as any)
          .replace("{y}", y as any);
        await FileSystem.downloadAsync(downloadUrl, phoneUrl);

        console.log("Saved as " + phoneUrl);
        y += 1;
      }
      x += 1;
    }
    // ----------------------- ------------------
    console.log("downloadOfflineAreaForTask done");
  };

  return (
    <View style={styles.buttonContainer}>
      <TouchableOpacity
        onPress={() =>
          downloadOfflineAreaForTask(region, zoom, mapServices[0], taskId)
        }
        style={styles.bubble}
      >
        <Text>Make area available offline</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bubble: {
    backgroundColor: "rgba(255,255,255,0.7)",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    // flexDirection: "row",
    marginVertical: 20,
    backgroundColor: "transparent",
    zIndex: 1000,
  },
});

export { OfflineDownloader };
