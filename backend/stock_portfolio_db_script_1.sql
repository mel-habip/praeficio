CREATE DATABASE `praeficio-database-1`;
USE `praeficio-database-1`;

SHOW EVENTS;
DROP EVENT expired_workspace_invitations_cleaning;
DROP EVENT positions_table_cleaning;
DROP EVENT soft_deleting_inactive_users;
DROP EVENT users_table_cleaning;
DROP EVENT workspaces_cleaning;

CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    password VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL,
    last_name VARCHAR(255),
    first_name VARCHAR(255),
    email VARCHAR(255),
    discovery_token VARCHAR(45) NOT NULL,
    use_beta_features BOOLEAN DEFAULT FALSE,
    to_do_categories JSON NULL,
    permissions VARCHAR(100) DEFAULT 'client',
    active BOOLEAN DEFAULT FALSE,
    deleted BOOLEAN DEFAULT FALSE,
    created_on DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_on DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY `username_UNIQUE` (`username`),

    INDEX idx_email (email),
    INDEX idx_username (username),
    INDEX idx_discovery_token (discovery_token),
    INDEX idx_active (active),
    INDEX idx_deleted (deleted),
    INDEX idx_active_deleted (active, deleted)
);

CREATE TABLE positions (
    position_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    secondary_user_id INT,
    tertiary_user_id INT,
    ticker VARCHAR(10) NOT NULL,
    size FLOAT NOT NULL DEFAULT 0,
    created_on DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_on DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    acquired_on DATE DEFAULT NULL,
    sold_on DATE DEFAULT NULL,
    active BOOLEAN DEFAULT TRUE,
    deleted BOOLEAN DEFAULT FALSE,
    notes JSON,
    FOREIGN KEY (user_id)
        REFERENCES users (user_id)
        ON DELETE CASCADE,
    FOREIGN KEY (secondary_user_id)
        REFERENCES users (user_id)
        ON DELETE CASCADE,
    FOREIGN KEY (tertiary_user_id)
        REFERENCES users (user_id)
        ON DELETE CASCADE
);

CREATE TABLE workspaces (
    workspace_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    publicity ENUM('private', 'public') DEFAULT 'public',
    discovery_token VARCHAR(45) DEFAULT NULL,
    who_can_accept_application ENUM('workspace_member', 'workspace_supervisor', 'workspace_admin', 'none') DEFAULT 'workspace_supervisor',
    who_can_invite_users ENUM('everyone','workspace_member', 'workspace_supervisor', 'workspace_admin', 'none') DEFAULT 'workspace_supervisor',
    who_can_edit_users ENUM('workspace_admin', 'workspace_supervisor') DEFAULT 'workspace_supervisor',
    who_can_edit_settings ENUM('workspace_admin', 'workspace_supervisor') DEFAULT 'workspace_supervisor', 
    who_can_edit_positions ENUM('workspace_admin', 'workspace_supervisor', 'workspace_member') DEFAULT 'workspace_supervisor',
    created_on DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_on DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE workspace_topics (
	workspace_topic_name VARCHAR(45) NOT NULL,
    workspace_id INT NOT NULL,
	created_on DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (workspace_topic_name , workspace_id),
    FOREIGN KEY (workspace_id)
        REFERENCES workspaces (workspace_id)
        ON DELETE CASCADE
);

CREATE TABLE workspace_user_associations (
    user_id INT NOT NULL,
    workspace_id INT NOT NULL,
    role VARCHAR(255) NOT NULL,
    starred BOOLEAN DEFAULT FALSE,
    method ENUM('application', 'invitation'),
    invitation_sent_by INT,
    application_accepted_by INT,
    joined BOOLEAN DEFAULT FALSE,
    joined_on DATETIME DEFAULT NULL,
    created_on DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_on DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id , workspace_id),
    FOREIGN KEY (user_id)
        REFERENCES users (user_id)
        ON DELETE CASCADE,
    FOREIGN KEY (workspace_id)
        REFERENCES workspaces (workspace_id)
        ON DELETE CASCADE,
	FOREIGN KEY (invitation_sent_by)
        REFERENCES users (user_id)
        ON DELETE SET NULL,
	FOREIGN KEY (application_accepted_by)
        REFERENCES users (user_id)
        ON DELETE SET NULL,

    INDEX idx_workspace_id (workspace_id),
    INDEX idx_user_id (user_id),
    INDEX idx_role (role)
);

CREATE TABLE workspace_position_associations (
    position_id INT NOT NULL,
    workspace_id INT NOT NULL,
    created_on DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (position_id , workspace_id),
    FOREIGN KEY (position_id)
        REFERENCES positions (position_id)
        ON DELETE CASCADE,
    FOREIGN KEY (workspace_id)
        REFERENCES workspaces (workspace_id)
        ON DELETE CASCADE
);

CREATE TABLE workspace_messages (
	workspace_message_id INT AUTO_INCREMENT PRIMARY KEY,
    workspace_id INT NOT NULL,
    content VARCHAR(400),
    sent_by INT NOT NULL,
    deleted BOOLEAN DEFAULT FALSE,
    starred BOOLEAN DEFAULT FALSE,
    parent_workspace_message_id INT,
    created_on DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_on DATETIME DEFAULT NULL ON UPDATE current_timestamp,
    FOREIGN KEY (workspace_id)
        REFERENCES workspaces (workspace_id)
        ON DELETE CASCADE,
	FOREIGN KEY (parent_workspace_message_id)
		REFERENCES workspace_messages (workspace_message_id)
        ON DELETE CASCADE,
	FOREIGN KEY (sent_by)
		REFERENCES users (user_id)
        ON DELETE CASCADE
);

CREATE TABLE workspace_message_likes (
	workspace_message_id INT NOT NULL,
    user_id INT NOT NULL,
    created_on DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (workspace_message_id, user_id),
    FOREIGN KEY (workspace_message_id)
		REFERENCES workspace_messages (workspace_message_id)
        ON DELETE CASCADE,
	FOREIGN KEY (user_id)
		REFERENCES users (user_id)
        ON DELETE CASCADE
);

CREATE TABLE alerts (
	alert_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type VARCHAR(255),
    frequency VARCHAR(255),
    notes JSON,
    active BOOLEAN DEFAULT TRUE,
    created_on DATETIME DEFAULT current_timestamp,
    updated_on DATETIME DEFAULT NULL ON UPDATE current_timestamp,
    FOREIGN KEY (user_id)
        REFERENCES users (user_id)
        ON DELETE CASCADE
);

CREATE TABLE todos (
	to_do_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    content VARCHAR(255),
    category VARCHAR(255) DEFAULT "General",
    completed BOOLEAN DEFAULT FALSE,
    archived BOOLEAN DEFAULT FALSE,
    due_on DATETIME DEFAULT NULL,
    created_on DATETIME DEFAULT current_timestamp,
    completed_on DATETIME DEFAULT NULL,
    updated_on DATETIME DEFAULT NULL ON UPDATE current_timestamp,
    FOREIGN KEY (user_id)
        REFERENCES users (user_id)
        ON DELETE CASCADE,

    INDEX idx_user_id (user_id),
    INDEX idx_archived (archived),
    INDEX idx_completed (archived),
    INDEX idx_user_id_archived (user_id, archived),
    INDEX idx_user_id_completed (user_id, completed),
    INDEX idx_user_id_archived_completed (user_id, archived, completed)
);

CREATE TABLE feedback_logs (
	feedback_log_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    archived BOOLEAN DEFAULT FALSE,
    notes JSON,
    default_filter_id INT,
    created_on DATETIME DEFAULT current_timestamp,
    updated_on DATETIME DEFAULT NULL ON UPDATE current_timestamp,
    FOREIGN KEY (default_filter_id) 
		REFERENCES feedback_log_filters (feedback_log_filter_id)
        ON DELETE SET NULL,

    INDEX idx_archived (archived)
);

CREATE TABLE feedback_log_user_associations (
	feedback_log_id INT NOT NULL,
    user_id INT NOT NULL,
    created_on DATETIME DEFAULT current_timestamp,
    PRIMARY KEY (feedback_log_id , user_id),
    FOREIGN KEY (user_id)
        REFERENCES users (user_id)
        ON DELETE CASCADE,
	FOREIGN KEY (feedback_log_id)
        REFERENCES feedback_logs (feedback_log_id)
        ON DELETE CASCADE,

    INDEX idx_user_id (user_id)
);

CREATE TABLE feedback_log_items (
	feedback_log_item_id INT AUTO_INCREMENT PRIMARY KEY,
	feedback_log_id INT NOT NULL,
    status VARCHAR(255) DEFAULT "submitted",
    header VARCHAR(100),
    content VARCHAR(800),
    created_by INT,
    notes JSON,
    internal_notes JSON,
    created_on DATETIME DEFAULT current_timestamp,
    updated_on DATETIME DEFAULT NULL ON UPDATE current_timestamp,
    FOREIGN KEY (feedback_log_id)
        REFERENCES feedback_logs (feedback_log_id)
        ON DELETE CASCADE,
	FOREIGN KEY (created_by)
        REFERENCES users (user_id)
        ON DELETE SET NULL
);

CREATE TABLE feedback_log_filters (
	feedback_log_filter_id INT AUTO_INCREMENT PRIMARY KEY,
    publicity ENUM ("global", "user_all_logs", "user_one_log", "all_users_one_log" ),
    parent_log_id INT,
    created_by INT,
    name VARCHAR(100),
    description VARCHAR(200),
    method JSON,
    created_on DATETIME DEFAULT current_timestamp,
    updated_on DATETIME DEFAULT NULL ON UPDATE current_timestamp,
    FOREIGN KEY (parent_log_id)
        REFERENCES feedback_logs (feedback_log_id)
        ON DELETE SET NULL,
	FOREIGN KEY (created_by)
        REFERENCES users (user_id)
        ON DELETE SET NULL
);

CREATE TABLE feedback_log_item_messages (
	feedback_log_item_message_id INT AUTO_INCREMENT PRIMARY KEY,
	feedback_log_item_id INT NOT NULL,
    content VARCHAR(800),
    sent_by INT,
    created_on DATETIME DEFAULT current_timestamp,
    updated_on DATETIME DEFAULT NULL ON UPDATE current_timestamp,
    FOREIGN KEY (feedback_log_item_id)
        REFERENCES feedback_log_items (feedback_log_item_id)
        ON DELETE CASCADE,
	FOREIGN KEY (sent_by)
        REFERENCES users (user_id)
        ON DELETE SET NULL
);

CREATE TRIGGER update_feedback_log_item_last_activity_date
AFTER INSERT ON feedback_log_item_messages
FOR EACH ROW
UPDATE feedback_log_items SET updated_on = NOW()
WHERE feedback_log_items.feedback_log_item_id = NEW.feedback_log_item_id;

CREATE TRIGGER update_feedback_log_item_last_activity_date_2
AFTER UPDATE ON feedback_log_item_messages
FOR EACH ROW
UPDATE feedback_log_items SET updated_on = NOW()
WHERE feedback_log_items.feedback_log_item_id = NEW.feedback_log_item_id OR feedback_log_items.feedback_log_item_id = OLD.feedback_log_item_id;

CREATE TRIGGER update_feedback_log_item_last_activity_date_3
AFTER DELETE ON feedback_log_item_messages
FOR EACH ROW
UPDATE feedback_log_items SET updated_on = NOW()
WHERE feedback_log_items.feedback_log_item_id = OLD.feedback_log_item_id;

CREATE TABLE subscribers (
	email VARCHAR(100) PRIMARY KEY,
    name VARCHAR(100),
    related_user_id INT,
    updates_to_receive ENUM('all') DEFAULT 'all',
    created_on DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_on DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (related_user_id)
        REFERENCES users (user_id)
        ON DELETE SET NULL
);

CREATE TABLE newsletters (
	newsletter_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255),
    description VARCHAR(800),
    content LONGTEXT,
    read_length INT,
    written_by INT,
    deleted BOOLEAN DEFAULT FALSE,
    pinned BOOLEAN DEFAULT FALSE,
    handled_externally BOOLEAN DEFAULT FALSE,
    created_on DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_on DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (written_by)
        REFERENCES users (user_id)
        ON DELETE SET NULL
);

CREATE TABLE debt_accounts (
	debt_account_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),
    borrower_id INT,
    lender_id INT,
    -- balance is always calculated fresh
    who_can_add_transactions ENUM('borrower', 'lender', 'both') DEFAULT 'both',
    archived BOOLEAN DEFAULT FALSE,
    created_on DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_on DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (borrower_id)
        REFERENCES users (user_id)
        ON DELETE CASCADE,
	FOREIGN KEY (lender_id)
        REFERENCES users (user_id)
        ON DELETE CASCADE,

    INDEX idx_borrower_id (borrower_id),
    INDEX idx_lender_id (lender_id),
    INDEX idx_archived (archived),
    INDEX idx_lender_borrower_id (lender_id, borrower_id)
);

CREATE TABLE debt_account_transactions (
	debt_account_transaction_id INT PRIMARY KEY AUTO_INCREMENT,
    debt_account_id INT,
    header VARCHAR(100),
    details VARCHAR(800) DEFAULT "-",
    entered_by INT,
    amount DECIMAL(10,2),
    posted_on DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_on DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_on DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (entered_by)
        REFERENCES users (user_id)
        ON DELETE CASCADE,
	FOREIGN KEY (debt_account_id)
        REFERENCES debt_accounts (debt_account_id)
        ON DELETE CASCADE,

    INDEX idx_debt_account_id (debt_account_id),
    INDEX idx_entered_by (entered_by),
    INDEX idx_posted_on (posted_on)
);

CREATE TABLE friendships (
	user_1_id INT NOT NULL,
    user_2_id INT NOT NULL,
    created_on DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_1_id , user_2_id),
    FOREIGN KEY (user_1_id)
        REFERENCES users (user_id)
        ON DELETE CASCADE,
	FOREIGN KEY (user_2_id)
        REFERENCES users (user_id)
        ON DELETE CASCADE,

    INDEX idx_user_1_id (user_1_id),
    INDEX idx_user_2_id (user_2_id),
    INDEX idx_user_1_2_id (user_1_id, user_2_id)
);

CREATE TABLE voting_sessions (
	voting_session_id INT PRIMARY KEY AUTO_INCREMENT,
    voter_key VARCHAR(50),
	name VARCHAR(100) NOT NULL,
    created_by INT,
    completed BOOLEAN DEFAULT FALSE,
    completed_on DATETIME,
    deleted BOOLEAN DEFAULT FALSE,
    details JSON, -- contains voting method, options and constraints, and once completed the results too
    created_on DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_on DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by)
        REFERENCES users (user_id)
        ON DELETE SET NULL
);

CREATE TABLE votes (
	vote_id INT PRIMARY KEY AUTO_INCREMENT,
    voting_session_id INT NOT NULL,
    voter_ip_address VARCHAR(40) NOT NULL,
    deleted BOOLEAN DEFAULT FALSE,
    details JSON, -- a hash detailing who they voted for
    created_on DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_on DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
	FOREIGN KEY (voting_session_id)
        REFERENCES voting_sessions (voting_session_id)
        ON DELETE CASCADE
);

CREATE TABLE business_contact_forms (
	business_contact_form_id INT PRIMARY KEY AUTO_INCREMENT,
	sender_ip_address VARCHAR(40) NOT NULL,
    stage VARCHAR(100) DEFAULT 'SUBMITTED',
    deleted BOOLEAN DEFAULT FALSE,
    details JSON, -- a hash detailing who they voted for
    updated_on DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    created_on DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tiddles_photos (
	photo_id INT PRIMARY KEY AUTO_INCREMENT,
    description VARCHAR(400),
    file_name VARCHAR(200) NOT NULL,
    mime_type VARCHAR(100),
    tags VARCHAR (400),
    updated_on DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    created_on DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sylvester_photos (
	photo_id INT PRIMARY KEY AUTO_INCREMENT,
    description VARCHAR(400),
    file_name VARCHAR(200) NOT NULL,
    mime_type VARCHAR(100),
    tags VARCHAR (400),
    updated_on DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    created_on DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE movies (
	movie_id INT PRIMARY KEY AUTO_INCREMENT,
    file_name VARCHAR(200) NOT NULL,
    name VARCHAR(200) NOT NULL,
    description VARCHAR(400),
    updated_on DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    created_on DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE movie_ratings (
	movie_id INT NOT NULL,
    user_id INT NOT NULL,
    value INT,
    updated_on DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    created_on DATETIME DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (movie_id , user_id),

    FOREIGN KEY (user_id)
        REFERENCES users (user_id)
        ON DELETE CASCADE,
    FOREIGN KEY (movie_id)
        REFERENCES movies (movie_id)
        ON DELETE CASCADE
);

CREATE TABLE stored_files (
    stored_file_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    file_name VARCHAR(200) NOT NULL,
    retrieval_key VARCHAR(200) NOT NULL,
    useCount INT NOT NULL DEFAULT 1,
    updated_on DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    created_on DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users (user_id)
        ON DELETE SET NULL,
    UNIQUE KEY `retrieval_key_UNIQUE` (`retrieval_key`),

    INDEX idx_retrieval_key (retrieval_key),
    INDEX idx_user_id (user_id),
    INDEX idx_created_on (created_on)
);

CREATE TABLE plants (
    plant_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    name VARCHAR(200) NOT NULL,
    description VARCHAR(400),
    file_name VARCHAR(200),
    schedule JSON,
    active BOOLEAN DEFAULT TRUE,
    updated_on DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    created_on DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
        REFERENCES users (user_id)
        ON DELETE CASCADE,

    INDEX idx_user_id (user_id)
);

-- SET GLOBAL event_scheduler = ON;

-- -- soft-deletes inactive users after 3 months
-- CREATE EVENT soft_deleting_inactive_users ON SCHEDULE EVERY 1 WEEK ENABLE
--   DO 
--   UPDATE users SET deleted = TRUE 
--   WHERE active = FALSE AND `updated_on` < CURRENT_TIMESTAMP - INTERVAL 3 MONTH;
  
-- -- deletes soft-deleted users & positions after 3 months
-- CREATE EVENT users_table_cleaning ON SCHEDULE EVERY 1 WEEK ENABLE
--   DO 
--   DELETE FROM users
--   WHERE deleted = TRUE AND `updated_on` < CURRENT_TIMESTAMP - INTERVAL 3 MONTH;

-- CREATE EVENT positions_table_cleaning ON SCHEDULE EVERY 3 DAY ENABLE
--   DO 
--   DELETE FROM positions
--   WHERE deleted = TRUE AND `updated_on` < CURRENT_TIMESTAMP - INTERVAL 1 WEEK;
  
-- CREATE EVENT expired_workspace_invitations_cleaning ON SCHEDULE EVERY 1 WEEK ENABLE
-- 	DO
--     DELETE FROM workspace_user_associations
--     WHERE invitation_accepted = FALSE AND `updated_on` < CURRENT_TIMESTAMP - INTERVAL 2 MONTH;

-- -- deletes empty workspaces
-- CREATE EVENT workspaces_cleaning ON SCHEDULE EVERY 1 WEEK ENABLE 
--   DO 
--   DELETE workspaces FROM workspaces LEFT JOIN workspace_user_associations ON workspaces.workspace_id = workspace_user_associations.workspace_id WHERE user_id IS NULL;
  
