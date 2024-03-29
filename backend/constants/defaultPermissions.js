const defaultPermissions = {
    "actions": {
        "edit_self_details": [
            "ALL"
        ],
        "edit_others_details": [
            "total",
            "workspace_admin",
            "dev_lead"
        ],
        "edit_user_details_framework": {
            "total": [
                "first_name",
                "last_name",
                "username",
                "created_on",
                "updated_on",
                "email",
                "active",
                "deleted",
                "to_do_categories",
                "use_beta_features",
            ],
            "workspace_admin": [
                "first_name",
                "last_name",
                "username",
                "email",
                "active",
                "deleted",
                "to_do_categories",
                "use_beta_features",
            ],
            "workspace_supervisor": [
                "first_name",
                "last_name",
                "username",
                "email",
                "active",
                "deleted",
                "to_do_categories",
                "use_beta_features",
            ],
            "workspace_employee": [
                "first_name",
                "last_name",
                "username",
                "email",
                "active",
                "deleted",
                "to_do_categories",
                "use_beta_features",
            ],
            "dev_lead": [
                "first_name",
                "last_name",
                "username",
                "email",
                "active",
                "deleted",
                "to_do_categories",
                "use_beta_features",
            ],
            "dev_senior": [
                "first_name",
                "last_name",
                "username",
                "email",
                "active",
                "deleted",
                "to_do_categories",
                "use_beta_features",
            ],
            "dev_junior": [
                "first_name",
                "last_name",
                "username",
                "email",
                "active",
                "deleted",
                "to_do_categories",
                "use_beta_features",
            ],
            "basic_client": [
                "first_name",
                "last_name",
                "username",
                "email",
                "active",
                "deleted",
                "to_do_categories",
                "use_beta_features",
            ]
        },
        "delete_self_user": [
            "workspace_admin",
            "workspace_supervisor",
            "workspace_employee",
            "dev_lead",
            "dev_senior",
            "dev_junior",
            "basic_client",
            "pro_client"
        ],
        "delete_other_user": [
            "total",
            "workspace_admin",
            "dev_lead"
        ],
        "add_position_to_self": [
            "ALL"
        ],
        "edit_positions_of_other_user": [
            "total",
            "dev_lead",
            "workspace_admin",
            "workspace_supervisor",
            "workspace_employee"
        ],
        "import_position_data": [
            "total",
            "dev_lead",
            "workspace_admin",
            "workspace_supervisor",
            "workspace_employee",
            "pro_client"
        ],
        "edit_self_alerts": [
            "ALL"
        ],
        "edit_other_alerts": [
            "total",
            "dev_lead",
            "workspace_admin",
            "workspace_supervisor",
            "workspace_employee"
        ],
        "can_create_new_user": [
            "total",
            "workspace_admin",
            "workspace_supervisor",
            "workspace_employee",
            "dev_lead",
            "dev_senior",
            "dev_junior",
        ],
        "permission_access_framework": {
            "total": [
                "workspace_admin",
                "workspace_supervisor",
                "workspace_employee",
                "dev_lead",
                "dev_senior",
                "dev_junior",
                "basic_client",
                "pro_client",
                "spectator?"
            ],
            "workspace_admin": [
                "workspace_supervisor",
                "workspace_employee",
                "pro_client",
                "basic_client"
            ],
            "workspace_supervisor": [
                "workspace_employee",
                "pro_client",
                "basic_client"
            ],
            "workspace_employee": [
                "pro_client",
                "basic_client"
            ],
            "dev_lead": [
                "dev_senior",
                "dev_junior",
                "workspace_employee",
                "workspace_supervisor",
                "basic_client",
                "pro_client"
            ],
            "dev_senior": [
                "dev_junior",
                "workspace_employee",
                "workspace_supervisor",
                "basic_client",
                "pro_client"
            ],
            "dev_junior": [
                "workspace_employee",
                "workspace_supervisor",
                "basic_client",
                "pro_client"
            ]
        }
    },
    "access": {
        "view_all_user_profiles": [
            "total",
            "dev_junior",
            "dev_senior",
            "dev_lead"
        ],
        "view_other_single_user": [
            "total",
            "workspace_admin",
            "workspace_supervisor",
            "workspace_employee"
        ],
        "view_other_users_bulk": [
            "total",
            "workspace_admin",
            "workspace_supervisor",
            "workspace_employee"
        ],
        "view_self_details": [
            "ALL"
        ],
        "extract_position_data": [
            "total",
            "workspace_admin",
            "workspace_supervisor",
            "workspace_employee",
            "pro_client",
            "dev_lead",
            "dev_senior",
            "dev_junior"
        ]
    }
};

export default defaultPermissions;

export const positions = {
    get all() {
        return Array.from(new Set(Object.keys(this).slice(1).reduce((acc, cur) => acc.concat(this[cur]), [])));
    },
    clients: [
        'pro_client',
        'basic_client'
    ],
    devs: [
        'dev_lead',
        'dev_junior',
        'dev_senior',
    ],
    internal_admins: [
        'dev_lead'
    ],
    workspace_admins: [
        'workspace_admin'
    ],
    workspace_users: [
        'workspace_admin',
        'workspace_supervisor',
        'workspace_employee'
    ]
};

Object.keys(positions).forEach(key => positions[key].push('total')); //adds 'total' to every category since total has all permissions.