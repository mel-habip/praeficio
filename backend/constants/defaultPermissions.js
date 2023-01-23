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
                "FirstName",
                "LastName",
                "Username",
                "CreatedOn",
                "UpdatedOn",
                "Email",
                "Active"
            ],
            "workspace_admin": [
                "FirstName",
                "LastName",
                "Username",
                "Email",
                "Active"
            ],
            "workspace_supervisor": [
                "FirstName",
                "LastName",
                "Username",
                "Email",
                "Active"
            ],
            "workspace_employee": [
                "FirstName",
                "LastName",
                "Username",
                "Email",
                "Active"
            ],
            "dev_lead": [
                "FirstName",
                "LastName",
                "Username",
                "Email",
                "Active"
            ],
            "dev_senior": [
                "FirstName",
                "LastName",
                "Username",
                "Email",
                "Active"
            ],
            "dev_junior": [
                "FirstName",
                "LastName",
                "Username",
                "Email",
                "Active"
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