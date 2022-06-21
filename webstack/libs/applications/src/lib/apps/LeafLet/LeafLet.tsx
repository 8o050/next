/**
 * Copyright (c) SAGE3 Development Team
 *
 * Distributed under the terms of the SAGE3 License.  The full license is in
 * the file LICENSE, distributed as part of this software.
 *
 */

import { useAppStore } from '@sage3/frontend';
import { AppSchema } from '../../schema';

import { state as AppState } from './index';
import { AppWindow } from '../../components';
import { SBDocument } from '@sage3/sagebase';

function LeafLet(props: SBDocument<AppSchema>): JSX.Element {
  const s = props.data.state as AppState;

  const updateState = useAppStore((state) => state.updateState);

  return (
    <AppWindow app={props}>
      <>
        <h1> center : {s.center}</h1>
      </>
    </AppWindow>
  );
}

export default LeafLet;
