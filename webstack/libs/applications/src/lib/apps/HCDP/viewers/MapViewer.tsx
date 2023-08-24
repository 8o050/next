/**
 * Copyright (c) SAGE3 Development Team 2022. All Rights Reserved
 * University of Hawaii, University of Illinois Chicago, Virginia Tech
 *
 * Distributed under the terms of the SAGE3 License.  The full license is in
 * the file LICENSE, distributed as part of this software.
 */

import { useEffect, useState } from 'react';
import { HStack, Box, ButtonGroup, Tooltip, Button, InputGroup, Input, useToast } from '@chakra-ui/react';
import { MdAdd, MdRemove, MdMap, MdTerrain } from 'react-icons/md';

// Data store
import create from 'zustand';
// Map library
import maplibregl, { Marker, latest } from 'maplibre-gl';
// Geocoding
import * as esriLeafletGeocoder from 'esri-leaflet-geocoder';
// Turfjs geojson utilities functions
import bbox from '@turf/bbox';
import center from '@turf/center';

import { useAppStore, useAssetStore, useUIStore } from '@sage3/frontend';
import { Asset } from '@sage3/shared/types';
import { App } from '../../../schema';
import { state as AppState } from '../index';
// import { state as AppState } from './index';
// import redMarker from './redMarker.png';

// Styling
import './maplibre-gl.css';
import React from 'react';

// Get a URL for an asset
export function getStaticAssetUrl(filename: string): string {
  return `/api/assets/static/${filename}`;
}

// Zustand store to communicate with toolbar
export const useStore = create((set) => ({
  map: {} as { [key: string]: maplibregl.Map },
  saveMap: (id: string, map: maplibregl.Map) => set((state: any) => ({ map: { ...state.map, ...{ [id]: map } } })),
}));

// Zoom levels
const maxZoom = 18;
const minZoom = 1;

// ArcGIS API Key
const esriKey = 'AAPK74760e71edd04d12ac33fd375e85ba0d4CL8Ho3haHz1cOyUgnYG4UUEW6NG0xj2j1qsmVBAZNupoD44ZiSJ4DP36ksP-t3B';

// MapTiler API Key
const mapTilerAPI = 'elzgvVROErSfCRbrVabp';
const baselayers = {
  Satellite: `https://api.maptiler.com/maps/hybrid/style.json?key=${mapTilerAPI}`,
  OpenStreetMap: `https://api.maptiler.com/maps/streets/style.json?key=${mapTilerAPI}`,
};

const MapViewer = (props: App & { isSelectingStations: boolean; isLoaded?: boolean; stationMetadata?: any }): JSX.Element => {
  const s = props.data.state as AppState;
  // const [map, setMap] = useState<maplibregl.Map>();
  const updateState = useAppStore((state) => state.updateState);
  const update = useAppStore((state) => state.update);
  const saveMap = useStore((state: any) => state.saveMap);
  const map = useStore((state: any) => state.map[props._id + '0']);
  const stationDataRef = React.useRef(stationData);
  const stationNameRef = React.useRef(s.stationNames);
  // Assets store
  const assets = useAssetStore((state) => state.assets);
  const scale = useUIStore((state) => state.scale);
  const [file, setFile] = useState<Asset>();
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [scaleSize, setScaleSize] = useState<number>(5);

  // Source
  const [source, setSource] = useState<{ id: string; data: any } | null>(null);

  // Toast to inform user about errors
  const toast = useToast();

  // Add the source to the map
  // This is needed when the baselayer is changed
  function addSource() {
    if (source) {
      // Check if the source is already added
      if (map.getSource(source.id)) {
        return;
      }
      // Add the source to the map
      map.addSource(source.id, {
        type: 'geojson',
        data: source.data,
      });
      // Layer for Polygons (lines and fills)
      map.addLayer({
        id: source.id + 'line',
        source: source.id,
        type: 'line',
        paint: {
          'line-color': '#000',
          'line-width': 2,
        },
        filter: ['==', '$type', 'Polygon'],
      });
      map.addLayer({
        id: source.id + 'fill',
        source: source.id,
        type: 'fill',
        paint: {
          'fill-outline-color': '#000',
          'fill-color': '#39b5e6',
          'fill-opacity': 0.4,
        },
        filter: ['==', '$type', 'Polygon'],
      });
      // Layer for points
      map.addLayer({
        id: source.id + 'symbol',
        source: source.id,
        type: 'circle',
        paint: {
          'circle-color': '#ff7800',
          'circle-opacity': 0.4,
          'circle-stroke-width': 2,
          'circle-radius': 5,
        },
        filter: ['==', '$type', 'Point'],
      });
    }
  }

  // useEffect(() => {
  //   if (map) {
  //     const mapContainer = map.getContainer();
  //     mapContainer.style.transform = `scale(${1 / scale})`;
  //   }
  // }, [scale]);

  // Convert ID to asset
  useEffect(() => {
    const myasset = assets.find((a) => a._id === s.assetid);
    if (myasset) {
      setFile(myasset);
      // Update the app title
      update(props._id, { title: myasset?.data.originalfilename });
    }
  }, [s.assetid, assets]);

  // Convert asset to URL
  useEffect(() => {
    if (file && map) {
      // when the map is loaded, add the source and layers
      map.on('load', async () => {
        const newURL = getStaticAssetUrl(file.data.file);
        console.log('MapGL> Adding source to map', newURL);
        // Get the GEOJSON data from the asset
        const response = await fetch(newURL, {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        });

        const gjson = await response.json();

        // Check if the file is valid
        // bbox will throw an error if an invalid geojson is passed
        try {
          // Calculate the bounding box and center using turf library
          const box = bbox(gjson);
          const cc = center(gjson).geometry.coordinates;
          // Duration is zero to get a valid zoom value next
          map.fitBounds(box, { padding: 20, duration: 0 });
          updateState(props._id, { zoom: map.getZoom(), location: cc });
          // Add the source to the map
          setSource({ id: file._id, data: gjson });
        } catch (error: any) {
          toast({
            title: 'Error',
            description: 'Error loading GEOJSON file',
            status: 'error',
            duration: 3000,
            isClosable: true,
          });
        }
      });
    }
  }, [file, map, setSource]);

  // If the source is changed, add it to the map
  useEffect(() => {
    if (source) {
      addSource();
    }
  }, [source]);

  useEffect(() => {
    const localmap = new maplibregl.Map({
      container: 'map' + props._id + '0',
      attributionControl: false,
      style: baselayers[s.baseLayer as 'OpenStreetMap' | 'Satellite'],
      center: s.location as maplibregl.LngLatLike,
      zoom: s.zoom,
      pitch: s.pitch || 0,
      bearing: s.bearing || 0,
    });

    localmap.on('moveend', (evt) => {
      // if originalEvent is null, this is a programmatic move
      if (evt.originalEvent) {
        const lmap = evt.target;
        const zoom = lmap.getZoom();
        const center = lmap.getCenter();
        const pitch = lmap.getPitch();
        const bearing = lmap.getBearing();

        // Update center and zoom level
        updateState(props._id, { zoom: zoom, location: [center.lng, center.lat], pitch: pitch, bearing: bearing });
      }
    });

    // Add button for attribution
    localmap.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');
    // Remove compass
    localmap.addControl(new maplibregl.NavigationControl({ showCompass: false }));

    // Disable map rotations
    // localmap.dragRotate.disable();
    localmap.touchZoomRotate.disableRotation();
    localmap.keyboard.disableRotation();
    // Disable map zooming with a box (shift click and drag)
    localmap.boxZoom.disable();

    // Save map to store
    saveMap(props._id + '0', localmap);
  }, [props._id]);

  // When the baselayer is changed
  useEffect(() => {
    if (map) {
      (map as maplibregl.Map).setStyle(baselayers[s.baseLayer as 'OpenStreetMap' | 'Satellite']);
      // When the base layer changes readd the sources
      setTimeout(addSource, 100);
    }
  }, [map, s.baseLayer]);

  // When the state is changed
  useEffect(() => {
    if (map) {
      // Update center from server, duration 0 to update immediately
      map.easeTo({
        bearing: s.bearing,
        pitch: s.pitch,
        center: [s.location[0], s.location[1]],
        zoom: s.zoom,
        speed: 0.2,
        curve: 1,
        duration: 1000,
      });
    }
  }, [map, s.bearing, s.pitch, s.location[0], s.location[1], s.zoom]);

  // When the app is resized
  useEffect(() => {
    // when app is resized, reset the center
    if (map) {
      map.setCenter(s.location, { duration: 0 });
      map.resize();
    }
  }, [props.data.size.width, props.data.size.height, map]);

  useEffect(() => {
    console.log('here');
    if (map && props.isLoaded && !props.isSelectingStations) {
      const widget = props.data.state.widget;
      // const observations = props.stationMetadata[0].OBSERVATIONS;
      const variableName = widget.yAxisNames[0];
      // console.log(props.stationMetadata)
      map.resize();
      for (let i = 0; i < markers.length; i++) {
        markers[i].remove();
      }
      // map.on('load', () => {
      for (let i = 0; i < props.stationMetadata.length; i++) {
        // console.log(props.stationMetadata[i].OBSERVATIONS[variableName]);
        if (props.stationMetadata[i].OBSERVATIONS[variableName]) {
          const latestValue =
            props.stationMetadata[i].OBSERVATIONS[variableName][props.stationMetadata[i].OBSERVATIONS[variableName].length - 1];

          const station: StationDataType | undefined = stationData.find(
            (station: StationDataType) => station.name == props.stationMetadata[i].STID
          );

          if (station) {
            const el = document.createElement('div');

            el.innerHTML = `<div style="position: relative; ">
            <div style=" border-radius: 50%; position: absolute; left: 50%; top: 50%; transform: scale(${
              s.stationScale
            }); background-color: #2fa9ee; width: 20px; height: 20px; color: white; border: 2px solid black; display: flex; flex-direction: column; justify-content: center; ">
            <p  style="font-size:5px; font-weight: bold; text-align: center">
            ${Number(latestValue).toFixed(1)}</p>
            </div>
            </div>`;
            if (el && el !== null) {
              const marker = new maplibregl.Marker({
                color: '#000000',
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                element: el.firstChild,
              })
                .setLngLat([station.lon, station.lat])
                .addTo(map);
              marker.togglePopup();
              setMarkers((prev) => [...prev, marker]);
            }

            // // station.value = latestValue;
            // map.addSource(`stationValues${props._id + "0" + variableName + station.name}`, {
            //   type: 'geojson',
            //   data: {
            //     type: 'FeatureCollection',
            //     features: [
            //       {
            //         type: 'Feature',
            //         geometry: { type: 'Point', coordinates: [station.lon, station.lat] },
            //         // properties: { stationInfo: station },
            //       },
            //     ],
            //   },
            // });

            // // map.addLayer({
            // //   id: 'selectedCircle',
            // //   type: 'circle',
            // //   source: 'selectedStations',
            // //   paint: {
            // //     'circle-radius': 15,
            // //     'circle-color': '#CC4833',
            // //     'circle-stroke-color': 'black',
            // //     'circle-stroke-width': 2,
            // //   },
            // // });
            // map.addLayer({
            //   id: `stationValues${props._id + "0" + variableName + station.name}`,
            //   type: 'symbol',
            //   source: `stationValues${props._id + "0" + variableName + station.name}`,
            //   layout: {
            //     'icon-image': 'marker_15',
            //     'text-field': `Soil Moisture: ${Number(latestValue).toFixed(1)} at ${station.name}`,
            //     'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
            //     'text-offset': [0, 0.6],
            //     'text-anchor': 'top',
            //   },
            // });
          }
        }
      }
      // });
    }
  }, [map, props.isLoaded, JSON.stringify(props.stationMetadata), JSON.stringify(s.stationNames), JSON.stringify(s.stationScale)]);

  const increaseScaleSize = () => {
    if (s.stationScale < 8) {
      updateState(props._id, { stationScale: s.stationScale + 1 });
      console.log(s.stationScale, 'inside');
    }
    console.log(s.stationScale);
  };

  const decreaseScaleSize = () => {
    if (s.stationScale > 3) {
      updateState(props._id, { stationScale: s.stationScale - 1 });
    }
  };

  return (
    <>
      {/* One box for map, one box for container */}
      {/* <Box id={'container' + props._id + "0"} w={props.data.size.width} h={props.data.size.height}> */}
      <Box id={'map' + props._id + '0'} w={'100%'} h={'100%'} />
      <Box
        position="absolute"
        left="2rem"
        bottom="2rem"
        display="flex"
        flexDir={'column'}
        gap="1rem"
        p="1rem"
        borderRadius={'lg'}
        backgroundColor={'#ffffff'}
        transform="scale(2)"
        transformOrigin={'bottom left'}
      >
        <Button size={'lg'} onClick={increaseScaleSize} colorScheme="teal">
          Increase Marker Size
        </Button>
        <Button size={'lg'} onClick={decreaseScaleSize} colorScheme="teal">
          Decrease Marker Size
        </Button>
      </Box>
      {/* </Box> */}
    </>
  );
};

export default MapViewer;

type StationDataType = { lat: number; lon: number; name: string; selected: boolean };
// For now, this is hard-coded. Will change when HCDP is ready.
export const stationData: StationDataType[] = [
  {
    lat: 20.8415,
    lon: -156.2948,
    name: '017HI',
    selected: false,
  },
  {
    lat: 20.7067,
    lon: -156.3554,
    name: '016HI',
    selected: false,
  },
  {
    lat: 20.7579,
    lon: -156.32,
    name: '001HI',
    selected: false,
  },
  {
    lat: 20.7598,
    lon: -156.2482,
    name: '002HI',
    selected: false,
  },
  {
    lat: 20.7382,
    lon: -156.2458,
    name: '013HI',
    selected: false,
  },
  {
    lat: 20.7104,
    lon: -156.2567,
    name: '003HI',
    selected: false,
  },
  {
    lat: 19.6974,
    lon: -155.0954,
    name: '005HI',
    selected: false,
  },
  {
    lat: 19.964,
    lon: -155.25,
    name: '006HI',
    selected: false,
  },
  {
    lat: 19.932,
    lon: -155.291,
    name: '007HI',
    selected: false,
  },
  {
    lat: 19.748,
    lon: -155.996,
    name: '008HI',
    selected: false,
  },
  {
    lat: 19.803,
    lon: -155.851,
    name: '009HI',
    selected: false,
  },
  {
    lat: 19.73,
    lon: -155.87,
    name: '010HI',
    selected: false,
  },
  {
    lat: 21.333,
    lon: -157.8025,
    name: '011HI',
    selected: false,
  },
  {
    lat: 21.3391,
    lon: -157.8369,
    name: '012HI',
    selected: false,
  },
  {
    lat: 22.2026,
    lon: -159.5188,
    name: '014HI',
    selected: false,
  },
  {
    lat: 22.1975,
    lon: -159.421,
    name: '015HI',
    selected: false,
  },
];
