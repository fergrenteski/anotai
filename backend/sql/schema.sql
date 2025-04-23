DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    password_hash VARCHAR(255) NOT NULL,
    profile_img BYTEA,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expired_at TIMESTAMP
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
   email TEXT NOT NULL,
   token TEXT NOT NULL,
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   expires_at TIMESTAMP NOT NULL,
   FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

DROP TABLE IF EXISTS user_email_verified_keys CASCADE;
CREATE TABLE user_email_verified_keys (
    email_verified_token_id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    email TEXT NOT NULL,
    token TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Tabela de categorias (ANT-31)
DROP TABLE IF EXISTS groups_category CASCADE;
CREATE TABLE groups_category (
    groups_category_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

INSERT INTO groups_category (name) VALUES
('Família'),
('Amigos'),
('Trabalho'),
('Comunidade'),
('Clube'),
('Escola'),
('Projeto'),
('Outros');

-- Tabela de grupos (ANT-15)
DROP TABLE IF EXISTS groups CASCADE;
CREATE TABLE groups (
    group_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    category_id  INT NOT NULL,
    user_admin_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expired_at TIMESTAMP,
    FOREIGN KEY (user_admin_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES groups_category(groups_category_id) ON DELETE CASCADE
);

-- View de Grupo (ANT-15)
CREATE OR REPLACE VIEW vw_groups AS
SELECT g.group_id,
       g.name  AS group_name,
       g.description,
       g.category_id,
       gc.name AS category_name,
       g.user_admin_id,
       u.name as user_admin_name,
       u.email,
       u.profile_img,
       g.created_at,
       g.updated_at,
       g.expired_at
FROM groups g
         JOIN groups_category gc
              ON g.category_id = gc.groups_category_id
         JOIN users u ON g.user_admin_id = u.user_id
WHERE g.expired_at IS NULL;

--Criação da tabela de Produtos/Categoria (ANT-33)
DROP TABLE IF EXISTS products_category CASCADE;
CREATE TABLE products_category(
    products_category_id SERIAL PRIMARY KEY, 
    name VARCHAR(100) NOT NULL 
);

INSERT INTO products_category (name) 
VALUES 
    ('Alimentos'),
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

--Criaçao da Tabela dos Produtos (ANT-32)
DROP TABLE IF EXISTS products CASCADE;
CREATE TABLE products(
    product_id SERIAL PRIMARY KEY, 
    name VARCHAR(100) NOT NULL,
    description TEXT, 
    category_id INT NOT NULL,
    price NUMERIC NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    added_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expired_at TIMESTAMP,
    FOREIGN KEY (added_by)
    REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES products_category(products_category_id) ON DELETE CASCADE
);

-- Criação da view para visualizar produtos e suas categorias
CREATE OR REPLACE VIEW vw_products AS
SELECT 
    p.product_id,
    p.name AS product_name,
    p.category_id,
    pc.name AS category_name,
    p.description,
    p.price,
    p.quantity,
    p.added_by,
    u.name as user_added_name,
    u.email, 
    u.profile_img,
    p.created_at,
    p.updated_at,
    p.expired_at
FROM 
    products p
JOIN 
    products_category pc
ON 
    p.category_id = pc.products_category_id
JOIN
    users u
on p.added_by = u.user_id
WHERE p.expired_at IS NULL;

