# Arquitetura — Edição de Perfil de Usuário

**JIRA:** ANT-57

## Visão Geral
- Permitir ao usuário editar seu nome, e-mail e foto de perfil.
- Frontend: página estática servida pelo NGINX + interações em vanilla JS.
- Backend: novo endpoint REST `PUT /api/user/profile`.

## Componentes
1. **Frontend**  
   - `frontend/html/profile.html` — markup do formulário.  
   - `frontend/css/profile.css` — estilo do card, botões, inputs.  
   - `frontend/js/profile.js` — lógica de captura de dados, fetch e feedback ao usuário.

2. **Backend**  
   - **Controller**:  
     - `controllers/userController.js` → função `updateProfile(req, res)`.  
   - **Service**:  
     - `services/userService.js` → método `updateUserProfile(userId, { name, email, profileImg })`.  
   - **SQL/ORM**:  
     - Query SQL ou chamada do ORM para salvar `name`, `email`, `profile_img` na tabela `users`.

3. **Banco de dados**  
   - Tabela `users` já possui colunas `name`, `email`, `profile_img`.  
   - Sem alteração necessária no schema.

4. **Segurança & validações**  
   - Autenticação via JWT → `userId` do token.  
   - Validação de e-mail e tamanho de nome (<=100 chars).  
   - Upload de imagem via form-data (max 2 MB).

5. **Fluxo de Deploy**  
   - Frontend → rebuild do container NGINX (`docker-compose up --build`).  
   - Backend → rebuild do container Node.

## Diagramas (opcional)
_(coloque aqui um link para um esboço ou draw.io, se desejar)_
