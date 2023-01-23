const db_keys = {
    all: [
        'UserID',
        'Username',
        'FirstName',
        'LastName',
        'Permissions',
        'Email',
        'CreatedOn',
        'UpdatedOn',
        'Active',
        'Password'
    ],
    all_except_pass: [
        'UserID',
        'Username',
        'FirstName',
        'LastName',
        'Permissions',
        'Email',
        'CreatedOn',
        'UpdatedOn',
        'Active'
    ],
    tombstone: [
        'UserID',
        'Username',
        'FirstName',
        'LastName',
        'Email',
    ]
};

export default db_keys;