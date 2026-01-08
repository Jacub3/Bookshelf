CREATE DATABASE bookshelf_app;
USE bookshelf_app;
CREATE TABLE books (
    id integer PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    chapters INT NOT NULL,
    author VARCHAR(255) NOT NULL,
    created TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE TABLE wizards (
    id integer PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    level INT NOT NULL DEFAULT 1,
    experience INT NOT NULL DEFAULT 0,
    weapon_type VARCHAR(255) DEFAULT 'Grimoire'
);
INSERT INTO books(title, chapters, author)
INSERT INTO wizards (name, level, experience) VALUES ('Wiz', 1, 0);
VALUES ('The Great Gatsby', 11, 'F. Scott Fitzgerald');