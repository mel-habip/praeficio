const db_keys = {
    all: [
        'user_id',
        'username',
        'first_name',
        'last_name',
        'permissions',
        'email',
        'created_on',
        'updated_on',
        'active',
        'deleted',
        'password'
    ],
    all_except_pass: [
        'user_id',
        'username',
        'first_name',
        'last_name',
        'permissions',
        'email',
        'created_on',
        'updated_on',
        'active',
        'deleted',

    ],
    tombstone: [
        'user_id',
        'username',
        'first_name',
        'last_name',
        'email',
    ]
};

export default db_keys;