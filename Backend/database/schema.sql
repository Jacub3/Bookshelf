CREATE DATABASE bookshelf_app;
USE bookshelf_app;
CREATE TABLE books (
    id integer PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    contents TEXT NOT NULL,
    author VARCHAR(255) NOT NULL,
    created TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO books(title, contents, author)
VALUES ('The Great Gatsby', 'F. Scott Fitzgerald', 'A novel about the decadence and excess of the Jazz Age.');