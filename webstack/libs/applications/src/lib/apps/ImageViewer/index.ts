/**
 * Copyright (c) SAGE3 Development Team 2022. All Rights Reserved
 * University of Hawaii, University of Illinois Chicago, Virginia Tech
 *
 * Distributed under the terms of the SAGE3 License.  The full license is in
 * the file LICENSE, distributed as part of this software.
 */

/**
 * SAGE3 application: ImageViewer
 * created by: SAGE3 team
 */

import { z } from 'zod';

const bboxType = z.record(
  z.object({
    xmin: z.number(),
    ymin: z.number(),
    xmax: z.number(),
    ymax: z.number(),
  })
);

export type Vertex = z.infer<typeof segmentVertexType>;
const segmentVertexType = z.object({
  x: z.number(),
  y: z.number(),
});

const segmentsType = z.array(
  z.array(segmentVertexType)
);
export type Segments = z.infer<typeof segmentsType>;

export const schema = z.object({
  assetid: z.string(),
  annotations: z.boolean(),
  boxes: bboxType,
  segments: segmentsType,
  segmentsLoading: z.boolean(),
  executeInfo: z.object({
    executeFunc: z.string(),
    params: z.any(),
  }),
  imageUri: z.string(),
});
export type state = z.infer<typeof schema>;

export const init: Partial<state> = {
  executeInfo: { executeFunc: '', params: {} },
  assetid: '',
  annotations: false,
  boxes: {},
  segments: [],
  segmentsLoading: false,
  imageUri: '',
};

export const name = 'ImageViewer';
