INSERT INTO users (name, email, email_verified, password_hash)
VALUES
    ('Ana Silva', 'ana@example.com', TRUE, '$2a$10$qsHt.rPpn35fyWUc6WTi5eqZaRg1KL1Q5S9jl4E2eOhIAy719Ihli'),
    ('Bruno Costa', 'bruno@example.com', TRUE, '$2a$10$qsHt.rPpn35fyWUc6WTi5eqZaRg1KL1Q5S9jl4E2eOhIAy719Ihli'),
    ('Carla Oliveira', 'carla@example.com', TRUE, '$2a$10$qsHt.rPpn35fyWUc6WTi5eqZaRg1KL1Q5S9jl4E2eOhIAy719Ihli'),
    ('Daniel Souza', 'daniel@example.com', TRUE, '$2a$10$qsHt.rPpn35fyWUc6WTi5eqZaRg1KL1Q5S9jl4E2eOhIAy719Ihli'),
    ('Eduarda Lima', 'eduarda@example.com', TRUE, '$2a$10$qsHt.rPpn35fyWUc6WTi5eqZaRg1KL1Q5S9jl4E2eOhIAy719Ihli'),
    ('Felipe Rocha', 'felipe@example.com', TRUE, '$2a$10$qsHt.rPpn35fyWUc6WTi5eqZaRg1KL1Q5S9jl4E2eOhIAy719Ihli'),
    ('Gabriela Martins', 'gabriela@example.com', TRUE, '$2a$10$qsHt.rPpn35fyWUc6WTi5eqZaRg1KL1Q5S9jl4E2eOhIAy719Ihli'),
    ('Henrique Alves', 'henrique@example.com', TRUE, '$2a$10$qsHt.rPpn35fyWUc6WTi5eqZaRg1KL1Q5S9jl4E2eOhIAy719Ihli'),
    ('Isabela Ferreira', 'isabela@example.com', TRUE, '$2a$10$qsHt.rPpn35fyWUc6WTi5eqZaRg1KL1Q5S9jl4E2eOhIAy719Ihli'),
    ('João Mendes', 'joao@example.com', TRUE, '$2a$10$qsHt.rPpn35fyWUc6WTi5eqZaRg1KL1Q5S9jl4E2eOhIAy719Ihli');


-- Criar grupo
INSERT INTO groups (name, description, category_id, user_admin_id)
VALUES ('Grupo Teste', 'Grupo de teste inicial', 1, 1);

-- Adicionar todos os usuários ao grupo como verificados
INSERT INTO group_users (user_id, group_id, verified)
SELECT user_id, 1, TRUE FROM users;

INSERT INTO lists (name, description, category_id, created_by, group_id)
VALUES ('Lista Inicial', 'Lista de teste com produtos aleatórios', 1, 1, 1);

-- Assumindo que temos 10 usuários com IDs de 1 a 10 e uma lista com ID 1
-- Usaremos categorias com IDs de 1 a 40, que foram inseridas anteriormente
DO $$
    DECLARE
        i INT;
        cat_id INT;
        user_id INT;
        price NUMERIC;
        name TEXT;
        description TEXT;
    BEGIN
        FOR i IN 1..50 LOOP
                cat_id := (SELECT FLOOR(RANDOM() * 40 + 1)); -- Categoria aleatória entre 1 e 40
                user_id := ((i - 1) % 10) + 1; -- Distribui de 1 a 10 ciclicamente
                price := ROUND((RANDOM() * 90 + 10)::NUMERIC, 2); -- Preço entre 10 e 100
                name := 'Produto ' || i;
                description := 'Descrição do produto ' || i;

                INSERT INTO products (
                    name, description, category_id, price, quantity,
                    purchased_by, added_by, list_id
                )
                VALUES (
                           name, description, cat_id, price, 1,
                           user_id, user_id, 1
                       );
            END LOOP;
    END $$;
