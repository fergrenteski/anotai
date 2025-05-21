-- Primeiro, apagamos todas as views
DROP VIEW IF EXISTS vw_invites;
DROP VIEW IF EXISTS vw_top3_categoria_por_usuario_lista;
DROP VIEW IF EXISTS vw_total_categoria_lista;
DROP VIEW IF EXISTS vw_total_gasto_por_usuario_lista;
DROP VIEW IF EXISTS vw_lists;
DROP VIEW IF EXISTS vw_user_groups;
DROP VIEW IF EXISTS vw_products;
DROP VIEW IF EXISTS vw_groups;

-- Tabelas que dependem de outras
DROP TABLE IF EXISTS group_users;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS lists;
DROP TABLE IF EXISTS user_group_invite_keys;
DROP TABLE IF EXISTS user_reset_password_keys;
DROP TABLE IF EXISTS user_email_verified_keys;
DROP TABLE IF EXISTS user_logs;

-- Tabelas de referência
DROP TABLE IF EXISTS groups;
DROP TABLE IF EXISTS products_category;
DROP TABLE IF EXISTS groups_category;
DROP TABLE IF EXISTS lists_category;

-- Tabelas independentes (raízes)
DROP TABLE IF EXISTS request_logs;
DROP TABLE IF EXISTS users;


-- Recriação das tabelas
CREATE TABLE users
(
    user_id        SERIAL PRIMARY KEY,
    name           VARCHAR(100)        NOT NULL,
    email          VARCHAR(100) UNIQUE NOT NULL,
    email_verified BOOLEAN             NOT NULL DEFAULT FALSE,
    password_hash  VARCHAR(255)        NOT NULL,
    profile_img    BYTEA,
    created_at     TIMESTAMP                    DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP                    DEFAULT CURRENT_TIMESTAMP,
    expired_at     TIMESTAMP
);

CREATE TABLE request_logs
(
    request_id  SERIAL PRIMARY KEY,
    method      VARCHAR(10) NOT NULL,
    endpoint    TEXT        NOT NULL,
    status_code INT         NOT NULL,
    ip_address  VARCHAR(45) NOT NULL,
    user_agent  TEXT,
    timestamp   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_logs
(
    log_id    SERIAL PRIMARY KEY,
    user_id   INT  NOT NULL,
    action    TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE
);

CREATE TABLE user_reset_password_keys
(
    reset_pass_token_id SERIAL PRIMARY KEY,
    user_id             INT       NOT NULL,
    email               TEXT      NOT NULL,
    token               TEXT      NOT NULL,
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at          TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE
);

CREATE TABLE user_email_verified_keys
(
    email_verified_token_id SERIAL PRIMARY KEY,
    user_id                 INT       NOT NULL,
    email                   TEXT      NOT NULL,
    token                   TEXT      NOT NULL,
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at              TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE
);


CREATE TABLE groups_category
(
    groups_category_id SERIAL PRIMARY KEY,
    name               VARCHAR(100) NOT NULL
);

INSERT INTO groups_category (name)
VALUES ('Família'),
       ('Amigos'),
       ('Trabalho'),
       ('Comunidade'),
       ('Clube'),
       ('Escola'),
       ('Projeto'),
       ('Outros');

CREATE TABLE groups
(
    group_id      SERIAL PRIMARY KEY,
    name          VARCHAR(100) NOT NULL,
    description   TEXT         NOT NULL,
    category_id   INT          NOT NULL,
    user_admin_id INT          NOT NULL,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expired_at    TIMESTAMP,
    FOREIGN KEY (user_admin_id) REFERENCES users (user_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES groups_category (groups_category_id) ON DELETE CASCADE
);

CREATE TABLE user_group_invite_keys
(
    group_invite_token_id SERIAL PRIMARY KEY,
    user_id               INT       NOT NULL,
    group_id              INT       NOT NULL,
    email                 TEXT      NOT NULL,
    token                 TEXT      NOT NULL,
    created_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at            TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES groups (group_id) ON DELETE CASCADE
);

CREATE TABLE products_category
(
    products_category_id SERIAL PRIMARY KEY,
    name                 VARCHAR(100) NOT NULL
);

INSERT INTO products_category (name)
VALUES ('Alimentos'),
       ('Bebidas'),
       ('Limpeza'),
       ('Higiene Pessoal'),
       ('Papelaria'),
       ('Vestuário'),
       ('Calçados'),
       ('Eletrônicos'),
       ('Eletrodomésticos'),
       ('Móveis'),
       ('Decoração'),
       ('Produtos de Beleza'),
       ('Pet Shop'),
       ('Automotivos'),
       ('Ferramentas'),
       ('Material de Construção'),
       ('Brinquedos'),
       ('Esporte e Lazer'),
       ('Livros e Revistas'),
       ('Artesanato'),
       ('Itens para Festas'),
       ('Jardinagem'),
       ('Produtos Naturais e Orgânicos'),
       ('Cama, Mesa e Banho'),
       ('Produtos Gourmet'),
       ('Roupas Íntimas'),
       ('Malas e Mochilas'),
       ('Instrumentos Musicais'),
       ('Energia Sustentável'),
       ('Artigos de Colecionador'),
       ('Camping e Aventura'),
       ('Material Escolar'),
       ('Segurança e Vigilância'),
       ('Suplementos e Vitaminas'),
       ('Produtos de Panificação'),
       ('Produtos Digitais'),
       ('Games e Consoles'),
       ('Produtos de Bebê'),
       ('Itens de Escritório'),
       ('Diversos');

CREATE TABLE group_users
(
    user_id  INTEGER NOT NULL,
    group_id INTEGER NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    CONSTRAINT group_users_unique UNIQUE (user_id, group_id),
    FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES groups (group_id) ON DELETE CASCADE
);


CREATE TABLE lists_category
(
    lists_category_id SERIAL PRIMARY KEY,
    name               VARCHAR(100) NOT NULL
);

CREATE TABLE lists
(
    list_id     SERIAL PRIMARY KEY,
    name        TEXT NOT NULL,
    description TEXT NOT NULL,
    category_id INT  NOT NULL,
    created_by  INT  NOT NULL,
    group_id    INT  NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expired_at  TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users (user_id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES groups (group_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES lists_category (lists_category_id) ON DELETE CASCADE
);

INSERT INTO lists_category (name)
VALUES ('Família'),
       ('Amigos'),
       ('Trabalho'),
       ('Comunidade'),
       ('Clube'),
       ('Escola'),
       ('Projeto'),
       ('Outros');

CREATE TABLE products
(
    product_id   SERIAL PRIMARY KEY,
    name         VARCHAR(100) NOT NULL,
    description  TEXT,
    category_id  INT          NOT NULL,
    price        NUMERIC      NOT NULL,
    quantity     INT          NOT NULL DEFAULT 0,
    purchased_by INT                   DEFAULT NULL,
    added_by     INT          NOT NULL,
    list_id      INT          NOT NULL,
    created_at   TIMESTAMP             DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP             DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (purchased_by) REFERENCES users (user_id) ON DELETE CASCADE,
    FOREIGN KEY (added_by) REFERENCES users (user_id) ON DELETE CASCADE,
    FOREIGN KEY (list_id) REFERENCES lists (list_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES products_category (products_category_id) ON DELETE CASCADE
);


-- Agora recriamos as Views
CREATE OR REPLACE VIEW vw_groups AS
SELECT g.group_id,
       g.name  AS group_name,
       g.description,
       g.category_id,
       gc.name AS category_name,
       g.user_admin_id,
       u.name  as user_admin_name,
       u.email,
       u.profile_img,
       g.created_at,
       g.updated_at,
       g.expired_at
FROM groups g
         JOIN groups_category gc ON g.category_id = gc.groups_category_id
         JOIN users u ON g.user_admin_id = u.user_id
WHERE g.expired_at IS NULL;

CREATE OR REPLACE VIEW vw_products AS
SELECT p.product_id,
       p.name   AS product_name,
       p.category_id,
       pc.name  AS category_name,
       p.description,
       p.price,
       p.quantity,
       p.added_by,
       u.name   AS added_name,
       u.email  AS added_email,
       p.purchased_by,
       up.name  AS purchased_name,
       up.email AS purchased_email,
       p.list_id,
       u.profile_img,
       p.created_at,
       p.updated_at
FROM products p
         JOIN products_category pc ON p.category_id = pc.products_category_id
         JOIN users u ON p.added_by = u.user_id
         LEFT JOIN users up ON p.purchased_by = up.user_id;

CREATE OR REPLACE VIEW vw_user_groups AS
SELECT gu.user_id,
       u.name                                                   AS user_name,
       u.email                                                  AS user_email,
       gu.verified                                              AS user_verified,
       u.profile_img,
       g.group_id,
       g.name,
       g.description,
       gc.name                                                  as category_name,
       CASE WHEN g.user_admin_id = gu.user_id THEN 1 ELSE 0 END AS is_admin
FROM group_users gu
         LEFT JOIN groups g ON g.group_id = gu.group_id
         LEFT JOIN groups_category gc ON gc.groups_category_id = g.category_id
         LEFT JOIN users u ON gu.user_id = u.user_id AND u.expired_at IS NULL
WHERE g.expired_at IS NULL;

CREATE OR REPLACE VIEW vw_lists AS
SELECT l.list_id,
       l.name as list_name,
       l.description,
       l.created_by,
       l.group_id,
       g.name as group_name,
       l.category_id,
       pc.name as category_name,
       l.created_at
FROM lists l
         LEFT JOIN groups g ON g.group_id = l.group_id
         LEFT JOIN groups_category gc ON gc.groups_category_id = g.category_id
         LEFT JOIN products_category pc ON pc.products_category_id = l.category_id
WHERE g.expired_at IS NULL
  AND l.expired_at IS NULL;

-- View de Total gasto por usuário (ANT-67)
CREATE OR REPLACE VIEW vw_total_gasto_por_usuario_lista AS
SELECT p.list_id,
       p.purchased_by,
       u.name                    AS purchased_name,
       u.email                   AS user_email,
       SUM(p.price * p.quantity) AS total_gasto
FROM products p
         JOIN users u ON p.purchased_by = u.user_id
WHERE p.purchased_by IS NOT NULL
GROUP BY p.list_id, p.purchased_by, u.name, u.email;

-- View Gasto por categoria
CREATE OR REPLACE VIEW vw_total_categoria_lista AS
SELECT p.list_id,
       p.category_id,
       c.name                    AS category_name,
       SUM(p.price * p.quantity) AS total_categoria
FROM products p
         JOIN products_category c ON p.category_id = c.products_category_id
GROUP BY p.list_id, p.category_id, c.name;

-- View Gasto por categoria por usuário.
CREATE OR REPLACE VIEW vw_top3_categoria_por_usuario_lista AS
WITH gastos_categoria AS (SELECT p.list_id,
                                 p.purchased_by,
                                 u.name                    AS purchased_name,
                                 c.products_category_id,
                                 c.name                    AS category_name,
                                 SUM(p.price * p.quantity) AS total_categoria_usuario
                          FROM products p
                                   JOIN users u ON p.purchased_by = u.user_id
                                   JOIN products_category c ON p.category_id = c.products_category_id
                          WHERE p.purchased_by IS NOT NULL
                          GROUP BY p.list_id, p.purchased_by, u.name, c.products_category_id, c.name),
     ranked AS (SELECT *,
                       ROW_NUMBER()
                       OVER (PARTITION BY list_id, purchased_by ORDER BY total_categoria_usuario DESC) AS categoria_rank
                FROM gastos_categoria)
SELECT *
FROM ranked
WHERE categoria_rank <= 3;

CREATE OR REPLACE VIEW vw_invites AS
SELECT
    ugik.group_invite_token_id AS id,
    ugik.user_id as user_id,
    ugik.group_id as group_id,
    ugik.token as invite,
    vg.group_name as group_name,
    vg.category_name as group_type,
    vg.user_admin_name as invited_by
FROM user_group_invite_keys ugik
LEFT JOIN vw_groups vg on ugik.group_id = vg.group_id