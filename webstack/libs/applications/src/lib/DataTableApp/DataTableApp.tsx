/**
 * Copyright (c) SAGE3 Development Team
 *
 * Distributed under the terms of the SAGE3 License.  The full license is in
 * the file LICENSE, distributed as part of this software.
 *
 */

import { useAppStore } from '@sage3/frontend';
import { Button } from '@chakra-ui/react';
import { AppSchema } from "../schema";

import { state as AppState } from "./index";
import './styles.css';

import { Tags } from "./components/Tags"
import { DataTable } from "./components/DataTable"
import { MessageCenter } from "./components/MessageCenter"

export function DataTableApp(props: AppSchema): JSX.Element {

  const s = props.state as AppState;

  const updateState = useAppStore(state => state.updateState);
  const deleteApp = useAppStore(state => state.delete);

  // function handleAddClick() {
  //   updateState(props.id, { count: s.count + 1 })
  // }
  //
  // function handleSubClick() {
  //   updateState(props.id, { count: s.count - 1 })
  // }

  function handleClose() {
    deleteApp(props.id);
  }

  return (
    <div className="Table-Container">
        <h3>{props.name} - <button onClick={handleClose}>X</button></h3>

        <div className="Message-Container">
            <Tags data={s.data}></Tags>
        </div>

        <DataTable data={s.data}></DataTable>

        <div className="Message-Container">
            <MessageCenter data={s.data}></MessageCenter>
        </div>

    </div>
  )
}

export default DataTableApp;