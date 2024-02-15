/**
 * Copyright (c) SAGE3 Development Team 2022. All Rights Reserved
 * University of Hawaii, University of Illinois Chicago, Virginia Tech
 *
 * Distributed under the terms of the SAGE3 License.  The full license is in
 * the file LICENSE, distributed as part of this software.
 */

import { Box, Button, ButtonGroup, Image, Spinner, Tooltip } from '@chakra-ui/react';
import { useEffect, useMemo, useState } from 'react';
// Icons
import { AiOutlineMinus } from 'react-icons/ai';
import { HiPencilAlt } from 'react-icons/hi';
import { MdFileDownload } from 'react-icons/md';
// Utility functions from SAGE3
import { apiUrls, downloadFile, isUUIDv4, useAppStore, useAssetStore, useMeasure, useThrottleScale } from '@sage3/frontend';
import { Asset, ExtraImageType, ImageInfoType } from '@sage3/shared/types';

import { AppWindow } from '../../components';
import { App } from '../../schema';
import { state as AppState, state } from './index';

import { ImageSegmentButton } from './ImageSegmentButton';
import ImageSegmentOverlay from './ImageSegmentOverlay';

/**
 * ImageViewer app
 *
 * @param {App} props
 * @returns {JSX.Element}
 */
function AppComponent(props: App): JSX.Element {
  const s = props.data.state as AppState;
  const updateState = useAppStore((state) => state.updateState);
  const assets = useAssetStore((state) => state.assets);
  const update = useAppStore((state) => state.update);

  // Asset data structure
  const [file, setFile] = useState<Asset>();
  // URL used in the image tag
  const [url, setUrl] = useState('');
  // Image aspect ratio
  const [aspectRatio, setAspectRatio] = useState<number | boolean>(1);
  // Array of URLs for the image with multiple resolutions
  const [sizes, setSizes] = useState<ImageInfoType[]>([]);
  // Scale of the board
  const scale = useThrottleScale(250);
  // Track the size of the image tag on the screen
  const [ref, displaySize] = useMeasure<HTMLDivElement>();
  // Original image sizes
  const [origSizes, setOrigSizes] = useState({ width: 0, height: 0 });

  // Update the imageUri in the app state to make it easier to
  // access it in the grouped action
  useEffect(() => {
    updateState(props._id, { imageUri: sizes[0]?.url });
  }, [sizes]);

  // Convert the ID to an asset
  useEffect(() => {
    const isUUID = isUUIDv4(s.assetid);
    if (isUUID) {
      const myasset = assets.find((a) => a._id === s.assetid);
      if (myasset) {
        setFile(myasset);
        // Update the app title
        update(props._id, { title: myasset?.data.originalfilename });
      }
    } else {
      // Assume it is a URL
      setUrl(s.assetid);
      setAspectRatio(false);
    }
  }, [s.assetid, assets]);

  // Once we have the asset, get the image data
  useEffect(() => {
    if (file) {
      const extra = file.data.derived as ExtraImageType;
      if (extra) {
        // Store the extra data in the state
        setSizes(extra.sizes);
        // Save the aspect ratio
        setAspectRatio(extra.aspectRatio);
        // TODO Extract image size
        const localOrigSizes = { width: extra.width, height: extra.height };
        setOrigSizes(localOrigSizes);

        if (extra) {
          if (extra.sizes.length === 0) {
            // No multi-resolution images, use the original
            setUrl(apiUrls.assets.getAssetById(file.data.file));
          } else {
            // find the smallest image for this page (multi-resolution)
            const res = extra.sizes.reduce(function (p, v) {
              return p.width < v.width ? p : v;
            });
            setUrl(res.url);
          }
        }
      }
    }
  }, [file]);

  // Track the size size and pick the 'best' URL
  useEffect(() => {
    const isUUID = isUUIDv4(s.assetid);
    if (isUUID) {
      // Match the window size, dpi, and scale of the board to a URL
      const res = getImageUrl(url, sizes, displaySize.width * window.devicePixelRatio * scale);
      if (res) setUrl(res);
    }
  }, [url, sizes, displaySize, scale]);

  useEffect(() => {
    if (s.jobUUIDs == null) {
      return;
    }
    const fetchSegData = async () => {
      Object.entries(s.jobUUIDs).forEach(async ([uuid, value]) => {
        if (value) {
          const response = await fetch(`/segment/${uuid}`);
          const segments = await response.json();

          // Delete the job from the state
          const newJobUUID = {...s.jobUUIDs};
          delete newJobUUID[uuid];

          updateState(props._id, {jobUUIDs: newJobUUID, segments, segmentsLoading: false})
        }
      });
    }
    void fetchSegData();
  }, [s.jobUUIDs])

  return (
    // background false to handle alpha channel
    <AppWindow app={props} lockAspectRatio={aspectRatio} background={false}>
      <div
        ref={ref}
        style={{
          position: 'relative',
          overflowY: 'hidden',
          height: aspectRatio ? displaySize.width / (aspectRatio as number) : 'auto',
          maxHeight: '100%',
        }}
      >
        <>
          {s.segmentsLoading === true ? (
            <Spinner
              speed="1s"
              emptyColor="gray.200"
              thickness="5px"
              size="xl"
              style={{
                position: 'absolute',
                right: '16px',
                bottom: '16px',
              }}
              label='Generating Segments...'
            />
          ) : null}
          {s.segments && s.segments.length > 0 ? (
            <ImageSegmentOverlay width={displaySize.width} height={displaySize.height} segments={s.segments} />
          ) : null}
          <Image
            width="100%"
            userSelect={'auto'}
            draggable={false}
            alt={file?.data.originalfilename}
            src={url}
            borderRadius="0 0 6px 6px"
          />

          {s.boxes
            ? Object.keys(s.boxes).map((label, idx) => {
                // TODO Need to handle text overflow for labels
                return (
                  <Box
                    key={label + idx}
                    position="absolute"
                    left={s.boxes[label].xmin * (displaySize.width / origSizes.width) + 'px'}
                    top={s.boxes[label].ymin * (displaySize.height / origSizes.height) + 'px'}
                    width={(s.boxes[label].xmax - s.boxes[label].xmin) * (displaySize.width / origSizes.width) + 'px'}
                    height={(s.boxes[label].ymax - s.boxes[label].ymin) * (displaySize.height / origSizes.height) + 'px'}
                    border="2px solid red"
                    style={{ display: s.annotations === true ? 'block' : 'none' }}
                  >
                    <Box position="relative" top={'-1.5rem'} fontWeight={'bold'} textColor={'black'}>
                      {label}
                    </Box>
                  </Box>
                );
              })
            : null}
        </>
      </div>
    </AppWindow>
  );
}

/**
 * UI for the image viewer app
 *
 * @param {App} props
 * @returns {JSX.Element}
 */
function ToolbarComponent(props: App): JSX.Element {
  const s = props.data.state as AppState;
  const updateState = useAppStore((state) => state.updateState);
  const assets = useAssetStore((state) => state.assets);
  const [file, setFile] = useState<Asset>();

  // Convert the ID to an asset
  useEffect(() => {
    const isUUID = isUUIDv4(s.assetid);
    if (isUUID) {
      const appasset = assets.find((a) => a._id === s.assetid);
      setFile(appasset);
    }
  }, [s.assetid, assets]);

  const url = useMemo(() => (file != null ? file?.data.file : s.assetid), [file, s.assetid]);

  return (
    <>
      <ButtonGroup isAttached size="xs" colorScheme="teal">
        <Tooltip placement="top-start" hasArrow={true} label={'Download Image'} openDelay={400}>
          <Button
            onClick={() => {
              if (file) {
                const filename = file?.data.originalfilename;
                const dl = apiUrls.assets.getAssetById(url);
                downloadFile(dl, filename);
              } else {
                const filename = props.data.title || s.assetid.split('/').pop();
                downloadFile(url, filename);
              }
            }}
          >
            <MdFileDownload />
          </Button>
        </Tooltip>
        <div style={{ display: s.boxes ? (Object.keys(s.boxes).length !== 0 ? 'flex' : 'none') : 'none' }}>
          <Tooltip placement="top-start" hasArrow={true} label={'Annotations'} openDelay={400}>
            <Button
              onClick={() => {
                updateState(props._id, { annotations: !s.annotations });
              }}
            >
              <HiPencilAlt />
            </Button>
          </Tooltip>
        </div>
      </ButtonGroup>
      <ButtonGroup isAttached size="xs" colorScheme="pink" ml="1" mr="0" p={0}>
        {s.segmentsLoading ? <Button disabled><Spinner
              speed="1s"
              emptyColor="transparent"
              thickness="2px"
              size="sm"
              label='Generating Segments...'
            /></Button> : s.segments && s.segments.length === 0 ? (
          <ImageSegmentButton
            images={[{ appId: props._id, imageUri: s.imageUri }]}
            onStartGeneration={({ appId, uuid }) => {
              updateState(appId, {jobUUIDs: {
                ...s.jobUUIDs,
                [uuid]: false
              }, segmentsLoading: true});

              // TODO: Remove this state change simulation after
              // the serverside work is done.
              setTimeout(() => {
                  updateState(appId, {jobUUIDs: {
                    ...s.jobUUIDs,
                    [uuid]: true
                  }});
              }, 60*1000);
            }
          }
          />
        ) : (
          <Tooltip placement="top-start" hasArrow={true} label={'Remove Segments'} openDelay={400}>
            <Button onClick={() => updateState(props._id, { segments: [] })}>
              <AiOutlineMinus />
            </Button>
          </Tooltip>
        )}
      </ButtonGroup>
    </>
  );
}

/**
 * Give an width, find the best URL for the image
 *
 * @param {string} src
 * @param {ImageInfoType[]} sizes
 * @param {number} width
 * @returns {string}
 */
function getImageUrl(src: string, sizes: ImageInfoType[], width: number): string {
  if (sizes.length > 0) {
    // Find closest value to width
    const s = sizes.reduce((a, b) => {
      return Math.abs(b.width - width) < Math.abs(a.width - width) ? b : a;
    });
    // If found a match, returns the size
    if (s) {
      return s.url;
    }
  }
  // else, default url
  return src;
}

/**
 * Grouped App toolbar component, this component will display when a group of apps are selected
 * @returns JSX.Element | null
 */
const GroupedToolbarComponent = ({ apps }: { apps: App[] }) => {
  const updateState = useAppStore((state) => state.updateState);
  const images = useMemo(() => {
    return apps.map(({ _id: appId, data}) => {
      const imageState: state = data.state;
      return {
        appId,
        imageUri: imageState.imageUri,
      }
    });
  }, [apps]);
  return (
    <ButtonGroup isAttached size="xs" colorScheme="pink" ml="0" mr="1" p={0}>
      <ImageSegmentButton
        images={images}
        onStartGeneration={({ appId, uuid }) => {
          const app = apps.find(app => app._id === appId);

          // App dosn't exist.
          if (app == null) {
            return
          }

          const state = app.data.state;

          // Don't start when segments are currently loading.
          if (state.segmentsLoading) {
            return;
          }

          updateState(appId, {jobUUIDs: {
            ...state.jobUUIDs,
            [uuid]: false,
          }, segmentsLoading: true});
 
          // TODO: Remove this state change simulation after
          // the serverside work is done.
          setTimeout(() => {
            updateState(appId, {jobUUIDs: {
              ...state.jobUUIDs,
              [uuid]: true,
            }});
        }, 120 * 1000);
        }}
      />
      <Tooltip placement="top-start" hasArrow={true} label={'Remove Segments'} openDelay={400}>
        <Button onClick={() => apps.forEach(({ _id: appId }) => updateState(appId, { segments: [] }))}>
          <AiOutlineMinus />
        </Button>
      </Tooltip>
    </ButtonGroup>
  );
};

export default { AppComponent, ToolbarComponent, GroupedToolbarComponent };
