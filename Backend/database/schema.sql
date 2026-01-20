CREATE DATABASE bookshelf_app;
USE bookshelf_app;
CREATE TABLE books (
    id integer PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    chapters INT NOT NULL,
    author VARCHAR(255) NOT NULL,
    created TIMESTAMP NOT NULL DEFAULT NOW(),
    genre VARCHAR(255) NOT NULL
);
CREATE TABLE wizards (
    id integer PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    level INT NOT NULL DEFAULT 1,
    experience INT NOT NULL DEFAULT 0,
    weapon_type VARCHAR(255) DEFAULT 'Grimoire'
);
CREATE TABLE spells(
    id integer PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL,
    dmgMod INT NOT NULL DEFAULT 1,
    dmg INT NOT NULL DEFAULT 0,
    effect BOOLEAN NOT NULL DEFAULT false
)
INSERT INTO spells(name, type, dmgMod, dmg, effect) VALUES ('Fire wall', 'destruction', 2, 11, true)
INSERT INTO books(title, chapters, author, genre) VALUES ('The Great Gatsby', 11, 'F. Scott Fitzgerald', 'Classic');
INSERT INTO wizards (name, level, experience) VALUES ('Wiz', 1, 0);