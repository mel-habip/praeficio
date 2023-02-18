CREATE DATABASE stock_portfolio_db;
USE stock_portfolio_db;
CREATE TABLE users (
  user_id int AUTO_INCREMENT PRIMARY KEY,
  password varchar(255),
  username varchar(255),
  last_name varchar(255),
  first_name varchar(255),
  email varchar(255),
  permissions VARCHAR(100) DEFAULT 'client',
  active BOOLEAN DEFAULT FALSE,
  deleted BOOLEAN DEFAULT FALSE,
  created_on DATETIME DEFAULT NOW(),
  updated_on DATETIME DEFAULT NULL ON UPDATE NOW()
);
CREATE TABLE positions (
	position_id int auto_increment primary key,
	user_id Int NOT NULL,
	secondary_user_id Int,
	tertiary_user_id Int,
  ticker VARCHAR(10) NOT NULL,
  created_on DATETIME DEFAULT NOW(),
  updated_on DATETIME DEFAULT NULL ON UPDATE NOW(),
  acquired_on Date DEFAULT NULL,
  sold_on Date DEFAULT NULL,
  active BOOLEAN DEFAULT TRUE,
  deleted BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (secondary_user_id) REFERENCES users(user_id),
  FOREIGN KEY (tertiary_user_id) REFERENCES users(user_id)
);
CREATE TABLE workspaces (
	workspace_id int auto_increment primary key,
	name VARCHAR(255) NOT NULL,
	created_on DATETIME DEFAULT NOW(),
    updated_on DATETIME DEFAULT NULL ON UPDATE NOW()
);
CREATE TABLE workspace_user_associations (
  user_id Int NOT NULL,
  workspace_id Int NOT NULL,
  PRIMARY KEY(user_id, workspace_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (workspace_id) REFERENCES workspaces(workspace_id),
  created_on DATETIME DEFAULT NOW()
);
CREATE TABLE workspace_position_associations (
  position_id Int NOT NULL,
  workspace_id Int NOT NULL,
  PRIMARY KEY(position_id, workspace_id),
  FOREIGN KEY (position_id) REFERENCES positions(position_id),
  FOREIGN KEY (workspace_id) REFERENCES workspaces(workspace_id),
  created_on DATETIME DEFAULT NOW()
);
SET GLOBAL event_scheduler = ON;
CREATE EVENT users_table_cleaning ON SCHEDULE EVERY 2 WEEK ENABLE
  DO 
  DELETE FROM users
  WHERE deleted = 1 AND `updated_on` < CURRENT_TIMESTAMP - INTERVAL 3 MONTH;

CREATE EVENT positions_table_cleaning ON SCHEDULE EVERY 1 WEEK ENABLE
  DO 
  DELETE FROM positions
  WHERE deleted = 1 AND `updated_on` < CURRENT_TIMESTAMP - INTERVAL 3 MONTH;

