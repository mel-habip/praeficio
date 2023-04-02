CREATE DATABASE stock_portfolio_db;
USE stock_portfolio_db;

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
    use_beta_features BOOLEAN DEFAULT FALSE,
    permissions VARCHAR(100) DEFAULT 'client',
    active BOOLEAN DEFAULT FALSE,
    deleted BOOLEAN DEFAULT FALSE,
    created_on DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_on DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY `username_UNIQUE` (`username`)
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
    created_on DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_on DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
);
CREATE TABLE workspace_user_associations (
    user_id INT NOT NULL,
    workspace_id INT NOT NULL,
    role VARCHAR(255) NOT NULL,
    invitation_accepted BOOLEAN DEFAULT FALSE,
    created_on DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_on DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id , workspace_id),
    FOREIGN KEY (user_id)
        REFERENCES users (user_id)
        ON DELETE CASCADE,
    FOREIGN KEY (workspace_id)
        REFERENCES workspaces (workspace_id)
        ON DELETE CASCADE
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
    created_on DATETIME DEFAULT current_timestamp,
    updated_on DATETIME DEFAULT NULL ON UPDATE current_timestamp,
    FOREIGN KEY (user_id)
        REFERENCES users (user_id)
        ON DELETE CASCADE
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
        ON DELETE SET NULL
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
        ON DELETE CASCADE
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


SET GLOBAL event_scheduler = ON;

-- soft-deletes inactive users after 3 months
CREATE EVENT soft_deleting_inactive_users ON SCHEDULE EVERY 1 WEEK ENABLE
  DO 
  UPDATE users SET deleted = TRUE 
  WHERE active = FALSE AND `updated_on` < CURRENT_TIMESTAMP - INTERVAL 3 MONTH;
  
-- deletes soft-deleted users & positions after 3 months
CREATE EVENT users_table_cleaning ON SCHEDULE EVERY 1 WEEK ENABLE
  DO 
  DELETE FROM users
  WHERE deleted = TRUE AND `updated_on` < CURRENT_TIMESTAMP - INTERVAL 3 MONTH;

CREATE EVENT positions_table_cleaning ON SCHEDULE EVERY 3 DAY ENABLE
  DO 
  DELETE FROM positions
  WHERE deleted = TRUE AND `updated_on` < CURRENT_TIMESTAMP - INTERVAL 1 WEEK;
  
CREATE EVENT expired_workspace_invitations_cleaning ON SCHEDULE EVERY 1 WEEK ENABLE
	DO
    DELETE FROM workspace_user_associations
    WHERE invitation_accepted = FALSE AND `updated_on` < CURRENT_TIMESTAMP - INTERVAL 2 MONTH;

-- deletes empty workspaces
CREATE EVENT workspaces_cleaning ON SCHEDULE EVERY 1 WEEK ENABLE 
  DO 
  DELETE workspaces FROM workspaces LEFT JOIN workspace_user_associations ON workspaces.workspace_id = workspace_user_associations.workspace_id WHERE user_id IS NULL;
  
