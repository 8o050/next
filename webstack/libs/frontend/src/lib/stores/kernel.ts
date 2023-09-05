/**
 * Copyright (c) SAGE3 Development Team 2023. All Rights Reserved
 * University of Hawaii, University of Illinois Chicago, Virginia Tech
 *
 * Distributed under the terms of the SAGE3 License.  The full license is in
 * the file LICENSE, distributed as part of this software.
 */

// The React version of Zustand
import create from 'zustand';

// Dev Tools
import { mountStoreDevtool } from 'simple-zustand-devtools';

import { KernelInfo, ExecOutput } from '@sage3/shared/types';

import { FastAPI } from '../api';

type KernelStoreState = {
  kernels: KernelInfo[];
  apiStatus: boolean;
  kernelTypes: string[];
  fetchKernels: () => Promise<KernelInfo[]>;
  fetchKernelTypes: () => Promise<string[]>;
  createKernel: (kernelInfo: KernelInfo) => Promise<boolean>;
  deleteKernel: (kernelId: string) => Promise<boolean>;
  interruptKernel: (kernelId: string) => Promise<boolean>;
  restartKernel: (kernelId: string) => Promise<boolean>;
  executeCode: (code: string, kernelId: string, userId: string) => Promise<{ ok: boolean; msg_id: string }>;
  fetchResults: (msgId: string) => Promise<{ ok: boolean; execOutput: ExecOutput }>;
};

/**
 * The Kernel Store
 */
export const useKernelStore = create<KernelStoreState>((set, get) => {
  // Heartbeat check for status of the API
  const checkFastAPIStatus = async () => {
    const online = await FastAPI.checkStatus();
    set({ apiStatus: online });
  };
  checkFastAPIStatus();
  // 5 second interval
  setInterval(checkFastAPIStatus, 5000);

  // Get Kernel Types
  const fetchKernelTypes = async () => {
    const kernelTypes = await FastAPI.fetchKernelTypes();
    set({ kernelTypes });
    return kernelTypes;
  };
  fetchKernelTypes();
  // 30 Second interval
  setInterval(fetchKernelTypes, 30000);

  // Fetch kernels
  const fetchKernels = async () => {
    const kernels = await FastAPI.fetchKernels();
    set({ kernels });
    return kernels;
  };
  fetchKernels();
  // 5 second interval
  setInterval(fetchKernels, 5000);

  // Create a kernel
  const createKernel = async (kernelInfo: KernelInfo): Promise<boolean> => {
    const response = await FastAPI.createKernel(kernelInfo);
    fetchKernels();
    return response;
  };

  // Delete a kernel
  const deleteKernel = async (kernelId: string): Promise<boolean> => {
    const response = await FastAPI.deleteKernel(kernelId);
    fetchKernels();
    return response;
  };

  // Interrupt a kernel
  const interruptKernel = async (kernelId: string): Promise<boolean> => {
    const response = await FastAPI.interruptKernel(kernelId);
    return response;
  };

  // Restart a kernel
  const restartKernel = async (kernelId: string): Promise<boolean> => {
    const response = await FastAPI.restartKernel(kernelId);
    return response;
  };

  // Execute code on a kernel
  const executeCode = async (code: string, kernelId: string, userId: string): Promise<{ ok: boolean; msg_id: string }> => {
    const response = await FastAPI.executeCode(code, kernelId, userId);
    return response;
  };

  const fetchResults = async (msgId: string): Promise<{ ok: boolean; execOutput: ExecOutput }> => {
    const response = await FastAPI.fetchResults(msgId);
    return response;
  };

  return {
    kernels: [],
    apiStatus: false,
    kernelTypes: [],
    fetchKernels: fetchKernels,
    fetchKernelTypes: fetchKernelTypes,
    createKernel: createKernel,
    deleteKernel: deleteKernel,
    interruptKernel: interruptKernel,
    restartKernel: restartKernel,
    executeCode: executeCode,
    fetchResults: fetchResults,
  };
});

// Add Dev tools
if (process.env.NODE_ENV === 'development') mountStoreDevtool('KernelStore', useKernelStore);
