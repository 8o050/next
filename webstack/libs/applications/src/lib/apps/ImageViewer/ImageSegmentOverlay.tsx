/**
 * Copyright (c) SAGE3 Development Team 2023. All Rights Reserved
 * University of Hawaii, University of Illinois Chicago, Virginia Tech
 *
 * Distributed under the terms of the SAGE3 License.  The full license is in
 * the file LICENSE, distributed as part of this software.
 */
import React, { useEffect, useRef } from 'react';
import { Segments } from '.';

interface OverlayProps {
  segments: Segments;
  width: number;
  height: number;
}

const ImageSegmentOverlay: React.FC<OverlayProps> = ({ segments, width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (ctx != null) {
        canvas.width = width;
        canvas.height = height;
        const pixelSize = canvas.width / segments[0][0].length;
        for (let i = 0; i < segments.length; i++) {
          const segment = segments[i];
          const color = COLOR_MAP?.[i] ?? '#FFC0CB';
          for (let y = 0; y < segment.length; y++) {
            for (let x = 0; x < segment[y].length; x++) {
                if (segment[y][x]) {
                    ctx.fillStyle = color; // Fill color for 'true'
                    ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
                }
            }
          }
        }
      }
    }
  }, [segments, width, height]); // Added width and height as dependencies

  if (segments.length === 0) {
    return null;
  }

  return <canvas style={{ position: 'absolute', inset: 0, opacity: 0.5 }} ref={canvasRef}></canvas>;
};

export default ImageSegmentOverlay;

const COLOR_MAP: {[key:number]: string} = {
  0: '#FF0000', // Red
  1: '#FFFF00', // Yellow
  2: '#008000', // Green
  3: '#000080', // Blue
  4: '#800080', // Purple
  5: '#808080', // Gray,
  6: '#C0C0C0', // Light gray
  7: '#FFA500', // Orange
  8: '#FFFFFF', // White
  9: '#000000', // Black
  10: '#00FFFF', // Cyan
  11: '#0000FF', // Blue
  12: '#FFC0CB', // Pink
  13: '#FFD700', // Gold
  14: '#800000', // Maroon
  15: '#808000', // Olive,
  16: '#008080', // Cyan,
  17: '#000080', // Navy blue
}
