/**
 * Copyright (c) SAGE3 Development Team 2023. All Rights Reserved
 * University of Hawaii, University of Illinois Chicago, Virginia Tech
 *
 * Distributed under the terms of the SAGE3 License.  The full license is in
 * the file LICENSE, distributed as part of this software.
 */

import { Button, Tooltip } from '@chakra-ui/react';
import React, { useCallback } from 'react';
import { FaPuzzlePiece } from 'react-icons/fa';

type Image = {
  appId: string;
  imageUri: string;
};

type OnFetchData = {
  appId: string;
  uuid: string;
};

type Props = {
  images: Image[];
  onStartGeneration: (data: OnFetchData) => void;
};

export const ImageSegmentButton: React.FC<Props> = ({ images, onStartGeneration }) => {
  const onButtonClick = useCallback(async () => {
    for (const { appId, imageUri } of images) {
      try {
        const response = await fetch(imageUri);
        const blob = await response.blob();
  
        if (!blob.type.includes('image')) {
          console.error('image fetch failed');
          continue; // Skip the current iteration if the blob is not an image
        }
  
        const formData = new FormData();
        const fileExtension: string = getFileExtension(blob.type);
        formData.append('image', blob, `image${fileExtension}`);
  
        const segmentResponse = await fetch('/segment', {
          method: 'POST',
          body: formData,
        });
        const { uuid }: { uuid: string } = await segmentResponse.json();
  
        onStartGeneration({
          appId,
          uuid,
        });
      } catch (error) {
        console.error('Error processing image:', error);
      }
    }
  }, [images, onStartGeneration]);

  return (
    <Tooltip placement="top-start" hasArrow={true} label={'Segment Image'} openDelay={400}>
      <Button onClick={onButtonClick}>
        <FaPuzzlePiece />
      </Button>
    </Tooltip>
  );
};

function getFileExtension(mimeType: string): string {
  const mimeTypesToExtension: { [key: string]: string } = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp', // Support for WebP
    // Add more mappings as needed
  };
  
  // Return the file extension if found, otherwise default to '.jpg'
  return mimeTypesToExtension[mimeType] || '.jpg';
}