/**
 * Copyright (c) SAGE3 Development Team
 *
 * Distributed under the terms of the SAGE3 License.  The full license is in
 * the file LICENSE, distributed as part of this software.
 *
 */

/**
 * Auth Provider
 * @file User Provider
 * @author <a href="mailto:rtheriot@hawaii.edu">Ryan Theriot</a>
 * @version 1.0.0
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { SocketAPI } from '../api';

import { AuthHTTPService } from '../auth';

type AuthenticatedType = {
  isAuthenticated: boolean;
  auth: { id: string } | null;
};

const AuthContext = createContext({
  isAuthenticated: false,
  auth: null
} as AuthenticatedType);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider(props: React.PropsWithChildren<Record<string, unknown>>) {
  const [auth, setAuth] = useState<AuthenticatedType>({ isAuthenticated: false, auth: null })

  // const [socketConnected, setSocketConnected] = useState(false);

  useEffect(() => {
    async function fetchAuth() {
      const auth = await AuthHTTPService.verifyAuth();
      if (auth.auth) {
        // Init the SocketAPI after the Auth is set and before we navigate to the home page
        await SocketAPI.init();
      }
      setAuth({ isAuthenticated: auth.authentication, auth: auth.auth });
    }
    fetchAuth()
  }, [])
  return (
    <AuthContext.Provider value={auth}>
      {props.children}
    </AuthContext.Provider>
  );
}
