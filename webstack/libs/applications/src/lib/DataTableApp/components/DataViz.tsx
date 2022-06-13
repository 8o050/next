import {
    Button,
    Input,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    TableCaption,
    TableContainer,
} from '@chakra-ui/react'

import './styles.css'
import * as React from "react";
import {useState} from "react";
// import {Util} from "leaflet";
// import isArray = Util.isArray;

interface Props{
    data:any;
}

export const DataViz = ({data}:Props) => {
    const [inputVal, setInputVal] = useState('');
    const [items, setItems] = useState<any[]>([]);
    const [loaded, setLoaded] = useState(false);
    const [headers, setHeaders] = useState<any[]>([]);
    let arr = [[]];

    function handleSubmit() {
        console.log(inputVal)
        fetch(
            inputVal)
            .then((res) => res.json())
            .then((json) => {
                setItems(json)
                setLoaded(true)
                setHeaders(Object.keys(json[0]))

            })
        setInputVal('')
        // {(!Array.isArray(items) || !items.length) ? <h1>Invalid json file, can't find headers</h1>: setHeaders(Object.keys(items[0]))}
    }

    function handleNesting(child: []) {
        if (typeof Object.keys(child) === 'object') {
            Array.from(child).forEach(element => {
                // arr.push(element)
                console.log(Object.keys(element))
            })
        }
        return arr
    }

    return (
        <div>
            {!loaded ? <h1>Not loaded</h1>:<h1>Loaded</h1>}
            <Input
                type="text"
                value={inputVal}
                placeholder={'Fetch data from API'}
                onChange={(e) => setInputVal(e.target.value)}
            />
            <Button size='sm' variant='outline' onClick={handleSubmit}>Submit</Button>
        <TableContainer>
            <Table colorScheme="facebook" variant='simple'>
                <TableCaption>Data loaded from API</TableCaption>
                <Thead>
                    <Tr>
                        {
                            headers.map((header, index) => (
                                <Th key={index}> {header} </Th>
                            ))
                        }
                    </Tr>
                </Thead>
                <Tbody>
                        {
                            items.map((item) => (
                                <Tr>
                                    {Object.values(item).map((itemChild: any, index) => (
                                        <>{(typeof itemChild === 'object') ?<Td> {handleNesting(itemChild)} </Td> : <Td> {itemChild} </Td>}</>
                                    ))}
                                </Tr>
                            ))
                        }
                </Tbody>
            </Table>
        </TableContainer>
        </div>
    )
}