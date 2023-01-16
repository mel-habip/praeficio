CREATE DATABASE stock_portfolio_db;
CREATE TABLE Users (
  UserID int AUTO_INCREMENT PRIMARY KEY,
  Password varchar(255),
  Username varchar(255),
  LastName varchar(255),
  FirstName varchar(255),
  Email varchar(255),
  Permissions VARCHAR(100) DEFAULT 'client',
  Active TINYINT DEFAULT '1',
  CreatedOn DATETIME DEFAULT NOW(),
  UpdatedOn DATETIME DEFAULT NULL ON UPDATE NOW(),
);
CREATE TABLE Positions (
	PositionID int auto_increment primary key,
	UserID Int NOT NULL,
	SecondaryUserID Int,
	TertiaryUserID Int,
  Ticker VARCHAR(10) NOT NULL,
  CreatedOn DATETIME DEFAULT NOW(),
  AcquiredOn Date,
  SoldOn Date,
  Active TINYINT DEFAULT '1',
  FOREIGN KEY (UserID) REFERENCES Users(UserID)
  FOREIGN KEY (SecondaryUserID) REFERENCES Users(UserID)
  FOREIGN KEY (TertiaryUserID) REFERENCES Users(UserID)
);
CREATE TABLE Workspaces (
	WorkspaceID int auto_increment primary key,
  Name VARCHAR(255) NOT NULL,
  CreatedOn DATETIME DEFAULT NOW(),
  FOREIGN KEY (UserID) REFERENCES Users(UserID)
);
CREATE TABLE Workspace_User_Associations (
  UserID Int NOT NULL,
  WorkspaceID Int NOT NULL,
  PRIMARY KEY('UserID', 'WorkspaceID'),
  FOREIGN KEY (UserID) REFERENCES Users(UserID)
  FOREIGN KEY (WorkspaceID) REFERENCES Workspaces(WorkspaceID)
)
CREATE TABLE User_User_Associations ()
