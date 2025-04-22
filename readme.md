# 🛒 Anota Aí – Sistema de Lista de Compras Compartilhado

**Anota Aí** é uma aplicação voltada para o gerenciamento de listas de compras compartilhadas, desenvolvida com foco em colaboração e praticidade. O sistema utiliza **Node.js** no backend, **PostgreSQL** para persistência de dados e **Docker** para gerenciamento de ambiente.

---

## 🚀 Tecnologias Utilxizadas

- **Backend:** Node.js com Express.js
- **Banco de Dados:** PostgreSQL
- **Autenticação:** JWT (JSON Web Token)
- **Gerenciamento de Ambiente:** Docker e Docker Compose
- **Envio de E-mails:** SendGrid

---

## ⚙️ Pré-requisitos

Antes de iniciar, certifique-se de ter as seguintes ferramentas instaladas no seu ambiente:

- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

---

## 🧭 Como Executar o Projeto

### 1. Configurar Chave SSH

Caso ainda não possua uma chave SSH configurada no GitHub, siga as instruções contidas no arquivo [`./ssh.md`](./ssh.md).

---

### 2. Clonar o Repositório

```bash
git clone git@github.com:fergrenteski/anotai.git
cd anotaai
```

---

### 3. Configurar as Variáveis de Ambiente

Crie um arquivo `.env` com base nas seguintes configurações:

| Variável                    | Descrição                                               | Exemplo                                                                 |
|-----------------------------|---------------------------------------------------------|-------------------------------------------------------------------------|
| `PORT`                      | Porta de execução do servidor backend                   | `3000`                                                                  |
| `JWT_SECRET`                | Chave secreta para geração e verificação dos tokens JWT | `5fb9fivsnv1pawi46hjb`                                                  |
| `POSTGRES_USER`             | Usuário do banco de dados                               | `anotaai_user`                                                          |
| `POSTGRES_PASSWORD`         | Senha do banco de dados                                 | `2wsx3edc`                                                              |
| `POSTGRES_DB`               | Nome do banco de dados                                  | `postgres`                                                              |
| `DB_HOST`                   | Host do banco de dados                                  | `anotaai_db`                                                            |
| `DB_PORT`                   | Porta do banco de dados                                 | `5432`                                                                  |
| `SENDGRID_API_KEY`          | Chave de API do SendGrid                                | `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` |
| `SENDER_EMAIL`              | E-mail remetente para envio via SendGrid                | `luizgrenfer@gmail.com`                                                 |
| `TEMPLATE_ID_RESET_EMAIL`   | Template para e-mail de redefinição de senha (SendGrid) | `d-cfa7d200e0f6408a9d00ee4cd4275f9a`                                    |
| `TEMPLATE_ID_CONFIRM_EMAIL` | Template para confirmação de e-mail (SendGrid)          | `d-ab335a1887b740e3bb9c1212946d3537`                                    |
| `FRONTEND_URL`              | URL do frontend que se comunica com o backend           | `http://localhost:8080`                                                 |

---

### 4. Ajustar Configurações SSL (opcional)

Caso não utilize SSL localmente, comente ou remova as seguintes linhas no arquivo `docker-compose.yml`:

```yaml
volumes:
  - ./ssl/server.crt:/var/lib/postgresql/server.crt
  - ./ssl/server.key:/var/lib/postgresql/server.key

command: >
  postgres -c ssl=on
           -c ssl_cert_file=/var/lib/postgresql/server.crt
           -c ssl_key_file=/var/lib/postgresql/server.key
```

---

### 5. Desabilitar Configurações SSL no `database.js`

No backend, localize o arquivo responsável pela configuração do banco de dados (geralmente `database.js`) e comente o trecho abaixo:

```js
ssl: {
    rejectUnauthorized: false
}
```

---

### 6. Configurar URLs no Frontend

Verifique se os endpoints do backend estão corretos no frontend, dentro do arquivo `./frontend/js/utils/env.js`:

```js
const API_URLS = {
    AUTH_URL: "https://anotaai-backend.vercel.app/api/user",
    EMAIL_URL: "https://anotaai-backend.vercel.app/api/user",
};

export default API_URLS;
```

Altere os valores conforme necessário para apontar para sua instância local:

```js
AUTH_URL: "http://localhost:3000/api/user"
```

---

### 7. Inicializar os Containers

Execute o seguinte comando para iniciar todos os serviços:

```bash
docker-compose up -d
```

---

### 8. Acessar a Aplicação

- **Frontend:** [http://localhost:8080](http://localhost:8080)
- **Backend:** [http://localhost:3000](http://localhost:3000)

---

## ❗ Atenção: Arquivos Sensíveis

**Não inclua os seguintes arquivos no controle de versão (Git):**

- `.env`
- `frontend/js/utils/env.js`
- `src/config/database.js` *(ou onde estiver na configuração de banco de dados)*
- `docker-compose.yml` *(se estiver com dados sensíveis ou credenciais)*

Adicione essas entradas no seu `.gitignore` se ainda não estiverem listadas.

---

## 🔧 Personalização

Caso deseje modificar as credenciais ou outras configurações, edite o arquivo `.env` antes de iniciar os containers.