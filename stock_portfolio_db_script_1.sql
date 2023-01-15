CREATE DATABASE stock_portfolio_db;
CREATE TABLE Users (
  UserID int AUTO_INCREMENT PRIMARY KEY,
  Password varchar(255),
  Username varchar(255),
  LastName varchar(255),
  FirstName varchar(255),
  Permissions VARCHAR(100) DEFAULT 'client',
  Active TINYINT DEFAULT '1',
  CreatedOn DATETIME DEFAULT NOW(),
);
CREATE TABLE Positions (
	PositionID int auto_increment primary key,
	UserID Int NOT NULL,
  Ticker VARCHAR(10) NOT NULL,
  CreatedOn DATETIME DEFAULT NOW(),
  AcquiredOn Date,
  SoldOn Date,
  Active TINYINT DEFAULT '1',
  FOREIGN KEY (UserID) REFERENCES Users(UserID)
)
