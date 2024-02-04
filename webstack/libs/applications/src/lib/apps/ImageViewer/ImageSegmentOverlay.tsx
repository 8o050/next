/**
 * Copyright (c) SAGE3 Development Team 2023. All Rights Reserved
 * University of Hawaii, University of Illinois Chicago, Virginia Tech
 *
 * Distributed under the terms of the SAGE3 License.  The full license is in
 * the file LICENSE, distributed as part of this software.
 */
import React, { useEffect, useRef } from 'react';
import { Vertex } from '.';

interface OverlayProps {
  segments: Vertex[][];
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
        segments.forEach((segment, index) => {
          // Fill color with increased transparency
          const fillColor = `hsla(${(360 / segments.length) * index}, 100%, 50%, 0.4)`; // More transparent fill
          // Border color with less transparency
          const borderColor = `hsla(${(360 / segments.length) * index}, 100%, 50%, 0.9)`; // Less transparent border

          ctx.beginPath();
          segment.forEach((vertex, vertexIndex) => {
            if (vertexIndex === 0) {
              ctx.moveTo(vertex.x, vertex.y);
            } else {
              ctx.lineTo(vertex.x, vertex.y);
            }
          });
          ctx.closePath();
          ctx.fillStyle = fillColor;
          ctx.fill();

          // Drawing border with 2px line width and less transparency
          ctx.lineWidth = 2; // Set border width to 2px
          ctx.strokeStyle = borderColor;
          ctx.stroke();
        });
      }
    }
  }, [segments, width, height]); // Added width and height as dependencies

  if (segments.length === 0) {
    return null;
  }

  return <canvas style={{ position: 'absolute', inset: 0 }} ref={canvasRef}></canvas>;
};

export default ImageSegmentOverlay;
