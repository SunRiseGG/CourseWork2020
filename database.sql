CREATE TABLE Users (
  Id serial,
  Email varchar(64) NOT NULL,
  Password varchar(512) NOT NULL,
  Service varchar(64) NOT NULL,
  Salt varchar(64) NOT NULL
);

ALTER TABLE Users ADD CONSTRAINT pkUsers PRIMARY KEY (Id);

CREATE UNIQUE INDEX akUsersEmail ON Users (Email);
