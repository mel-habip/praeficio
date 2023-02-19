CREATE DATABASE stock_portfolio_db;
USE stock_portfolio_db;
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    password VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL,
    last_name VARCHAR(255),
    first_name VARCHAR(255),
    email VARCHAR(255),
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
    created_on DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_on DATETIME DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    acquired_on DATE DEFAULT NULL,
    sold_on DATE DEFAULT NULL,
    active BOOLEAN DEFAULT TRUE,
    deleted BOOLEAN DEFAULT FALSE,
    notes JSON,
    FOREIGN KEY (user_id)
        REFERENCES users (user_id),
    FOREIGN KEY (secondary_user_id)
        REFERENCES users (user_id),
    FOREIGN KEY (tertiary_user_id)
        REFERENCES users (user_id)
);
CREATE TABLE workspaces (
    workspace_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_on DATETIME DEFAULT current_timestamp,
    updated_on DATETIME DEFAULT NULL ON UPDATE current_timestamp
);
CREATE TABLE workspace_user_associations (
    user_id INT NOT NULL,
    workspace_id INT NOT NULL,
    PRIMARY KEY (user_id , workspace_id),
    FOREIGN KEY (user_id)
        REFERENCES users (user_id),
    FOREIGN KEY (workspace_id)
        REFERENCES workspaces (workspace_id),
    created_on DATETIME DEFAULT current_timestamp
);
CREATE TABLE workspace_position_associations (
    position_id INT NOT NULL,
    workspace_id INT NOT NULL,
    PRIMARY KEY (position_id , workspace_id),
    FOREIGN KEY (position_id)
        REFERENCES positions (position_id),
    FOREIGN KEY (workspace_id)
        REFERENCES workspaces (workspace_id),
    created_on DATETIME DEFAULT current_timestamp
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
);


SET GLOBAL event_scheduler = ON;
CREATE EVENT users_table_cleaning ON SCHEDULE EVERY 2 WEEK ENABLE
  DO 
  DELETE FROM users
  WHERE deleted = TRUE AND `updated_on` < CURRENT_TIMESTAMP - INTERVAL 3 MONTH;

CREATE EVENT positions_table_cleaning ON SCHEDULE EVERY 1 WEEK ENABLE
  DO 
  DELETE FROM positions
  WHERE deleted = TRUE AND `updated_on` < CURRENT_TIMESTAMP - INTERVAL 3 MONTH;

