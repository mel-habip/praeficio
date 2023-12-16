
import React, { useState, useEffect, useContext, Suspense } from 'react';
import axios from 'axios';

import { Button, Modal, Spacer, Text, Input, Loading, Table } from '@nextui-org/react';

const columns = [
    {
        key: "user_id",
        label: "ID",
        sortable: true
    },
    {
        key: "first_name",
        label: "First Name",
        sortable: true
    },
    {
        key: "last_name",
        label: "Last Name",
        sortable: true
    },
    {
        key: "email",
        label: "Email",
        sortable: true
    },
    {
        key: "username",
        label: "Username",
        sortable: true
    },
    {
        key: 'score',
        label: 'Match'
    }
];

export default function UserSearchModal({ is_open, user, set_is_open, add_button_text = 'Add User', button_function = () => { }, setIsLoggedIn }) {



    const [tableSelected, setTableSelected] = useState(null);
    const [searchResults, setSearchResults] = useState([]);
    const [tableLoading, setTableLoading] = useState(false);

    // search mechanism from https://stackoverflow.com/questions/42217121/how-to-start-search-only-when-user-stops-typing
    const [searchText, setSearchText] = useState('');
    const keyword = React.useMemo(() => searchText.trim().toLowerCase(), [searchText]);

    useEffect(() => {
        if (!keyword || !searchText) {
            return;
        }
        const delayDebounceFn = setTimeout(() => {
            console.log('Search Triggerred', keyword);

            setTableLoading(true);

            //fetch the data, needs to be a POST to send a body
            axios.post(`/api/search`, { type: 'User', keyword, columns: ['username', 'first_name', 'last_name', 'email', 'user_id'] }).then(response => {
                if (response.status === 401) {
                    setIsLoggedIn(false);
                } else if (response.status === 200) {
                    setSearchResults(response.data.data);
                } else {
                    console.log('fetch', response);
                }
                setTableLoading(false);
            });

        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [keyword]);


    return (
        <Modal
            closeButton
            blur
            aria-labelledby="modal-title"
            open={is_open}
            onClose={() => set_is_open(false)}
            scroll
            width="60%" >
            <Modal.Header css={{ 'z-index': 86, position: 'relative' }}>
                <Text size={14} > Please select a user below </Text>
            </Modal.Header>
            <Modal.Body>
                <Spacer y={1} />
                <Input
                    bordered
                    value={searchText}
                    labelPlaceholder="Search users"
                    helperText={searchText ? '3 second delay is normal' : ''}
                    clearable
                    onChange={(e) => setSearchText(e.target.value)}
                ></Input>
                <Spacer y={0.5} hidden={!searchResults.length} />

                {!searchResults.length && !keyword && <h3>Start by typing something</h3>}
                {tableLoading ? <Loading /> : ''}

                <Table
                    aria-label="Example table with dynamic content"
                    bordered
                    hidden={!searchResults.length}
                    lined
                    selectionMode='single'
                    onSelectionChange={e => setTableSelected(parseInt(e.currentKey))}
                    compact
                    shadow
                    color="primary"
                    containerCss={{
                        height: "auto",
                        minWidth: "70%",
                        'z-index': 10
                    }}
                >
                    <Table.Header columns={columns}>
                        {(column) => (
                            <Table.Column key={column.key} css={{ padding: '5px' }} >{column.label}</Table.Column>
                        )}
                    </Table.Header>


                    <Table.Body items={searchResults} css={{ 'text-align': 'left' }}>
                        {(item) => (
                            <Table.Row key={item.user_id}>
                                {columnKey => <Table.Cell> {item[columnKey]} </Table.Cell>}
                            </Table.Row>
                        )}
                    </Table.Body>

                    <Table.Pagination shadow align="center" rowsPerPage={10} onPageChange={(page) => console.log({ page })} />

                </Table>

                <Button
                    disabled={!tableSelected}
                    shadow
                    auto
                    onPress={() => button_function(tableSelected)}> {add_button_text} </Button>
            </Modal.Body>
        </Modal>);
}