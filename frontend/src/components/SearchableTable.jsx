import { useState, useEffect, useMemo } from 'react';
import { Input, Row, Table, useAsyncList, useCollator } from '@nextui-org/react';

import timestampFormatter from '../utils/timestampFormatter';

/**
 * @param {Array<{}>} data
 * @param {Array<{
 *          key:string, 
 *          label:string, 
 *          sortable:boolean, 
 *          description:string, 
 *          is_key: boolean,
 *          formatter: function,
 *          children:}>} columns
 * 
 */
export default function SearchableTable({ data = [], columns = [] }) {

    const primary_key = columns.findIndex(clm => clm.is_key)?.key || columns[0]?.key;

    const formattersMap = {}, childrenMap = {};

    columns.forEach((clm, index) => {
        if (typeof clm.formatter === 'function') formattersMap[clm.key] = clm.formatter;
        if (typeof clm.children === 'function') childrenMap[clm.key] = clm.children;
    });

    let load = async ({ filterText }) => ({
        items: filterText ? data.filter(row => (JSON.stringify(row)).includes(filterText.toLowerCase().trim())) : data
    }); //this can normally be an async function that fetches the data, but already we hold the whole page off while it is loading

    //This section is what supports sorting
    const collator = useCollator({ numeric: true });
    async function sort({ items, sortDescriptor }) {
        return {
            items: items.sort((a, b) => {
                let first = a[sortDescriptor.column];
                let second = b[sortDescriptor.column];
                let cmp = collator.compare(first, second);
                if (sortDescriptor.direction === "descending") {
                    cmp *= -1;
                }
                return cmp;
            }),
        };
    };

    const list = useAsyncList({ load, sort });
    //This section is what supports sorting


    // search Debounce mechanism from https://stackoverflow.com/questions/42217121/how-to-start-search-only-when-user-stops-typing
    const [searchText, setSearchText] = useState('');
    const keyword = useMemo(() => searchText.trim().toLowerCase(), [searchText]);

    useEffect(() => {
        if (!keyword || !searchText) {
            list.setFilterText('');
            return;
        }
        const delayDebounceFn = setTimeout(() => {
            console.log('Search Triggerred', keyword);
            list.setFilterText(keyword);
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [keyword]);


    return (<>
        <Row css={{ mb: '10px', 'ml': '30%' }} >
            <Input
                bordered
                value={searchText}
                labelPlaceholder="Search the table"
                helperText={searchText ? 'a small delay is normal' : ''}
                css={{ mr: '3px' }}
                width="300px"
                clearable
                onChange={e => setSearchText(e.target.value)}
            />
        </Row>

        <Table
            aria-label="Example table with dynamic content"
            bordered
            lined
            selectionMode='single'
            compact
            sortDescriptor={list.sortDescriptor}
            onSortChange={list.sort}
            shadow
            color="primary"
            containerCss={{
                height: "auto",
                minWidth: "70%",
                maxWidth: '95%',
                'z-index': 10
            }}
        >
            <Table.Header columns={columns}>
                {(column) => (
                    <Table.Column allowsSorting={column.sortable} key={column.key} css={{ padding: '20px' }} >{column.label}</Table.Column>
                )}
            </Table.Header>
            <Table.Body items={list.items} css={{ 'text-align': 'left' }} loadingState={list.loadingState}>
                {item => (
                    <Table.Row key={item[primary_key]} className="position-table-row" css={{ padding: '0px', margin: '0px' }}>
                        {columnKey => {

                            if (childrenMap.hasOwnProperty(columnKey)) return <Table.Cell css={{ 'padding': '0px', wordWrap: 'break-word', margin: '0px' }} >
                                {childrenMap[columnKey](item) || <></>}
                            </Table.Cell>
                            if (typeof formattersMap[columnKey] === 'function') {
                                return <Table.Cell> {formattersMap[columnKey](item[columnKey]) || ' - '} </Table.Cell>
                            } else if (['updated_on', 'created_on', 'posted_on'].includes(columnKey)) {
                                return <Table.Cell> {item[columnKey] ? timestampFormatter(item[columnKey]) : ' - '} </Table.Cell>
                            } else {
                                return <Table.Cell> {item[columnKey]?.toString() || ' - '} </Table.Cell>
                            }
                        }}
                    </Table.Row>
                )}
            </Table.Body>
            <Table.Pagination shadow align="center" rowsPerPage={10} onPageChange={(page) => console.log({ page })} />
        </Table >
    </>);
};