CREATE DATABASE bookshelf_app;
USE bookshelf_app;
CREATE TABLE books (
    id integer PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    chapters INT NOT NULL,
    author VARCHAR(255) NOT NULL,
    created TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO books(title, chapters, author)
VALUES ('The Great Gatsby', 11, 'F. Scott Fitzgerald');