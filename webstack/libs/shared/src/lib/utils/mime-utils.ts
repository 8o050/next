/**
 * Copyright (c) SAGE3 Development Team 2022. All Rights Reserved
 * University of Hawaii, University of Illinois Chicago, Virginia Tech
 *
 * Distributed under the terms of the SAGE3 License.  The full license is in
 * the file LICENSE, distributed as part of this software.
 */

// Mime type definitions
import * as mime from 'mime';

// Define extra MIME types
mime.define({
  'application/x-ipynb+json': ['ipynb'],
  'application/dzi': ['dzi'],
  'application/python': ['py'],
  'application/url': ['url'],
  'application/sage3': ['s3json'],
  'application/x-geotiff': ['geotiff'],
});

/**
 * Get the mime type for a given filename.
 *
 * @export
 * @param {string} filename
 * @returns {string}
 */
export function getMime(filename: string): string | null {
  return mime.getType(filename);
}

/**
 * Get the file extension for a given mime type.
 *
 * @export
 * @param {string} mimeType
 * @returns {string}
 */
export function getExtension(mimeType: string): string {
  const ext = mime.getExtension(mimeType) || '-';
  return ext;
}

/**
 * Test if a given mime type is a Tiff file
 *
 * @export
 * @param {string} mimeType
 * @returns {boolean}
 */
export function isFileURL(mimeType: string): boolean {
  return mimeType === 'application/url';
}

/**
 * Test if a given mime type is a Tiff file
 *
 * @export
 * @param {string} mimeType
 * @returns {boolean}
 */
export function isSessionFile(mimeType: string): boolean {
  return mimeType === 'application/sage3';
}

/**
 * Test if a given mime type is a Tiff file
 *
 * @export
 * @param {string} mimeType
 * @returns {boolean}
 */
export function isTiff(mimeType: string): boolean {
  return mimeType === 'image/tiff';
}

/**
 * Test if a given mime type is a Geotiff file
 *
 * @export
 * @param {string} mimeType
 * @returns {boolean}
 */
export function isGeoTiff(mimeType: string): boolean {
  return mimeType === 'application/x-geotiff';
}

/**
 * Test if a given mime type is an image file
 *
 * @export
 * @param {string} mimeType
 * @returns {boolean}
 */
export function isImage(mimeType: string): boolean {
  return mimeType.startsWith('image/') && mimeType !== 'image/heic';
}

/**
 * Test if a given mime type is a GIF image
 *
 * @export
 * @param {string} mimeType
 * @returns {boolean}
 */
export function isGIF(mimeType: string): boolean {
  return mimeType === 'image/gif';
}

/**
 * Test if a given mime type is a PDF file
 *
 * @export
 * @param {string} mimeType
 * @returns {boolean}
 */
export function isPDF(mimeType: string): boolean {
  return mimeType === 'application/pdf';
}
/**
 * Test if a given mime type is a video file
 *
 * @export
 * @param {string} mimeType
 * @returns {boolean}
 */
export function isVideo(mimeType: string): boolean {
  // return mimeType.startsWith('video/');
  // video/quicktime is for .mov files, hoping it contains an mp4 video track
  return mimeType === 'video/mp4' || mimeType === 'video/webm' || mimeType === 'video/ogg' || mimeType === 'video/quicktime';
}
/**
 * Test if a given mime type is an audio file
 *
 * @export
 * @param {string} mimeType
 * @returns {boolean}
 */
export function isAudio(mimeType: string): boolean {
  return mimeType.startsWith('audio/');
}
/**
 * Test if a given mime type is a notebook
 *
 * @export
 * @param {string} mimeType
 * @returns {boolean}
 */
export function isPythonNotebook(mimeType: string): boolean {
  return mimeType === 'application/x-ipynb+json';
}
/**
 * Test if a given mime type is a text file
 *
 * @export
 * @param {string} mimeType
 * @returns {boolean}
 */
export function isText(mimeType: string): boolean {
  return mimeType === 'text/plain';
}
/**
 * Test if a given mime type is a ZIP file
 *
 * @export
 * @param {string} mimeType
 * @returns {boolean}
 */
export function isZip(mimeType: string): boolean {
  const formats = ['application/zip', 'application/zip-compressed', 'application/x-zip-compressed', 'application/x-compressed'];
  return formats.includes(mimeType);
}
/**
 * Test if a given mime type is a JSON file
 *
 * @export
 * @param {string} mimeType
 * @returns {boolean}
 */
export function isJSON(mimeType: string): boolean {
  return mimeType === 'application/json';
}

/**
 * Test if a given mime type is a GeoJSON file
 *
 * @export
 * @param {string} mimeType
 * @returns {boolean}
 */
export function isGeoJSON(mimeType: string): boolean {
  return mimeType === 'application/geo+json';
}

/**
 * Test if a given mime type is a HTML file
 *
 * @export
 * @param {string} mimeType
 * @returns {boolean}
 */
export function isHTML(mimeType: string): boolean {
  return mimeType === 'text/html';
}
/**
 * Test if a given mime type is a CSV file
 *
 * @export
 * @param {string} mimeType
 * @returns {boolean}
 */
export function isCSV(mimeType: string): boolean {
  return mimeType === 'text/csv';
}

/**
 * Test if a given mime type is a DZI file
 *
 * @export
 * @param {string} mimeType
 * @returns {boolean}
 */
export function isDZI(mimeType: string): boolean {
  return mimeType === 'application/dzi';
}

/**
 * Test if a given mime type is a Markdown file
 *
 * @export
 * @param {string} mimeType
 * @returns {boolean}
 */
export function isMD(mimeType: string): boolean {
  return mimeType === 'text/markdown';
}

/**
 * Test if a given mime type is a Python file
 *
 * @export
 * @param {string} mimeType
 * @returns {boolean}
 */
export function isPython(mimeType: string): boolean {
  return mimeType === 'application/python';
}

/**
 * Test if a given mime type is a GLTF binary file
 *
 * @export
 * @param {string} mimeType
 * @returns {boolean}
 */
export function isGLTF(mimeType: string): boolean {
  return mimeType === 'model/gltf-binary';
}

/**
 * Test if a given mime type is a GLTF binary file
 *
 * @export
 * @param {string} mimeType
 * @returns {boolean}
 */
export function isValid(mimeType: string): boolean {
  return (
    isSessionFile(mimeType) ||
    isGeoTiff(mimeType) ||
    isFileURL(mimeType) ||
    isImage(mimeType) ||
    isPDF(mimeType) ||
    isVideo(mimeType) ||
    // isPythonNotebook(mimeType) ||
    isText(mimeType) ||
    isMD(mimeType) ||
    isJSON(mimeType) ||
    isGeoJSON(mimeType) ||
    isCSV(mimeType) ||
    isDZI(mimeType) ||
    isPython(mimeType) ||
    isGLTF(mimeType)
  );
}
