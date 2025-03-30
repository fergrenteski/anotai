DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL
);

DROP TABLE IF EXISTS request_logs CASCADE;
CREATE TABLE request_logs (
    request_id SERIAL PRIMARY KEY,
    method VARCHAR(10) NOT NULL,
    endpoint TEXT NOT NULL,
    status_code INT NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS user_logs CASCADE;
CREATE TABLE user_logs (
    log_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    action TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

DROP TABLE IF EXISTS user_reset_password_keys CASCADE;
CREATE TABLE user_reset_password_keys (
   reset_pass_token_id SERIAL PRIMARY KEY,
   user_id INT NOT NULL,
   token TEXT NOT NULL,
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   expires_at TIMESTAMP NOT NULL,
   FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);



