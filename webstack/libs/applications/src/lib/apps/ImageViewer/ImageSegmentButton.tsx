/*
 * Copyright (c) SAGE3 Development Team 2023. All Rights Reserved
 * University of Hawaii, University of Illinois Chicago, Virginia Tech
 *
 * Distributed under the terms of the SAGE3 License.  The full license is in
 * the file LICENSE, distributed as part of this software.
 */
import { Button, Tooltip } from '@chakra-ui/react';

import React, { useCallback } from 'react';
import { FaPuzzlePiece } from 'react-icons/fa';
import { Segments, Vertex } from '.';

// Segments look like these:
// const MOCK_SEGMENT_DATA = [
//   // Example segment data
//   [
//     { x: 50, y: 150 },
//     { x: 60, y: 140 },
//     { x: 75, y: 145 },
//     { x: 90, y: 130 },
//     { x: 110, y: 135 },
//     { x: 130, y: 120 },
//     { x: 150, y: 130 },
//     { x: 170, y: 120 },
//     { x: 190, y: 140 },
//     { x: 180, y: 160 },
//     { x: 160, y: 170 },
//     { x: 140, y: 160 },
//     { x: 120, y: 175 },
//     { x: 100, y: 165 },
//     { x: 80, y: 180 },
//     { x: 60, y: 170 },
//   ],
// ];

function generateNonOverlappingSegments(
  numberOfSegments: number,
  minVertices: number,
  maxVertices: number,
  canvasWidth: number,
  canvasHeight: number
): Vertex[][] {
  const segments: Vertex[][] = [];
  const sectionWidth = canvasWidth / Math.ceil(Math.sqrt(numberOfSegments));
  const sectionHeight = canvasHeight / Math.ceil(Math.sqrt(numberOfSegments));

  // Helper function to generate a random integer within a range
  const getRandomInt = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  for (let i = 0; i < numberOfSegments; i++) {
    const segment: Vertex[] = [];
    const numberOfVertices = getRandomInt(minVertices, maxVertices);
    const sectionX = (i % Math.ceil(Math.sqrt(numberOfSegments))) * sectionWidth;
    const sectionY = Math.floor(i / Math.ceil(Math.sqrt(numberOfSegments))) * sectionHeight;

    for (let j = 0; j < numberOfVertices; j++) {
      const vertex: Vertex = {
        x: getRandomInt(sectionX, sectionX + sectionWidth),
        y: getRandomInt(sectionY, sectionY + sectionHeight),
      };
      segment.push(vertex);
    }

    // Ensure the shape is closed by repeating the first vertex at the end
    segment.push(segment[0]);

    segments.push(segment);
  }

  return segments;
}
type Props = {
  imageUri: string;
  onFetch: (segments: Segments) => void;
};

const ImageSegmentButton: React.FC<Props> = ({ imageUri, onFetch }) => {
  const onButtonClick = useCallback(() => {
    // Call a model to get the segmentations.
    onFetch(generateNonOverlappingSegments(5, 2, 8, 400, 400));
  }, [imageUri, onFetch]);
  return (
    <Tooltip placement="top-start" hasArrow={true} label={'Segment Image'} openDelay={400}>
      <Button onClick={onButtonClick}>
        <FaPuzzlePiece />
      </Button>
    </Tooltip>
  );
};

export default ImageSegmentButton;
