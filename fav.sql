DROP TABLE IF EXISTS favlist;

CREATE TABLE IF NOT EXISTS favlist (
    id  SERIAL unique,
    title VARCHAR(255),
    release_date VARCHAR(255),
    overview VARCHAR(500),
    comment  VARCHAR(255)
);