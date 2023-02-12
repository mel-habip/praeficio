CREATE DATABASE stock_portfolio_db;
USE stock_portfolio_db;
CREATE TABLE Users (
  UserID int AUTO_INCREMENT PRIMARY KEY,
  Password varchar(255),
  Username varchar(255),
  LastName varchar(255),
  FirstName varchar(255),
  Email varchar(255),
  Permissions VARCHAR(100) DEFAULT 'client',
  Active BOOLEAN DEFAULT FALSE,
  CreatedOn DATETIME DEFAULT NOW(),
  UpdatedOn DATETIME DEFAULT NULL ON UPDATE NOW()
);
CREATE TABLE Positions (
	PositionID int auto_increment primary key,
	UserID Int NOT NULL,
	SecondaryUserID Int,
	TertiaryUserID Int,
  Ticker VARCHAR(10) NOT NULL,
  CreatedOn DATETIME DEFAULT NOW(),
  UpdatedOn DATETIME DEFAULT NULL ON UPDATE NOW(),
  AcquiredOn Date DEFAULT NULL,
  SoldOn Date DEFAULT NULL,
  Active BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (UserID) REFERENCES Users(UserID),
  FOREIGN KEY (SecondaryUserID) REFERENCES Users(UserID),
  FOREIGN KEY (TertiaryUserID) REFERENCES Users(UserID)
);
CREATE TABLE Workspaces (
	WorkspaceID int auto_increment primary key,
	Name VARCHAR(255) NOT NULL,
	CreatedOn DATETIME DEFAULT NOW()
);
CREATE TABLE Workspace_User_Associations (
  UserID Int NOT NULL,
  WorkspaceID Int NOT NULL,
  PRIMARY KEY(UserID, WorkspaceID),
  FOREIGN KEY (UserID) REFERENCES Users(UserID),
  FOREIGN KEY (WorkspaceID) REFERENCES Workspaces(WorkspaceID),
  CreatedOn DATETIME DEFAULT NOW()
);
CREATE TABLE Workspace_Position_Associations (
  PositionID Int NOT NULL,
  WorkspaceID Int NOT NULL,
  PRIMARY KEY(PositionID, WorkspaceID),
  FOREIGN KEY (PositionID) REFERENCES Positions(PositionID),
  FOREIGN KEY (WorkspaceID) REFERENCES Workspaces(WorkspaceID),
  CreatedOn DATETIME DEFAULT NOW()
);


