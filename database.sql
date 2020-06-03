CREATE TABLE Users (
  Id serial,
  Email varchar(64) NOT NULL,
  Password varchar(64) NOT NULL,
  Service varchar(64) NOT NULL
);

ALTER TABLE Users ADD CONSTRAINT pkUsers PRIMARY KEY (Id);

CREATE UNIQUE INDEX akUsersEmail ON Users (Email);

CREATE TABLE Session (
  Id serial,
  UserId integer NOT NULL,
  Token varchar(64) NOT NULL,
  Data text
);

ALTER TABLE Session ADD CONSTRAINT pkSession PRIMARY KEY (Id);

CREATE UNIQUE INDEX akSession ON Session (Token);

ALTER TABLE Session ADD CONSTRAINT fkSessionUserId FOREIGN KEY (UserId) REFERENCES Session (Id) ON DELETE CASCADE;
