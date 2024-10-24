CREATE TABLE IF NOT EXISTS user
(
    id         VARCHAR(36)       PRIMARY KEY,
    device_id  VARCHAR(255)      UNIQUE NOT NULL,
    last_login TIMESTAMP         DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP         DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS game_end
(
    id         VARCHAR(36)       PRIMARY KEY,
    user_id    VARCHAR(36)       NOT NULL,
    start_time TIMESTAMP         DEFAULT CURRENT_TIMESTAMP,
    end_time   TIMESTAMP         DEFAULT CURRENT_TIMESTAMP,
    x          FLOAT             DEFAULT 0,
    y          FLOAT             DEFAULT 0,
    score      INT               DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES user (id)
);