// Importa bibliotecas e funçöes:
const UserService = require("../services/UserService");
const EmailService = require("../services/EmailService");
const GroupService = require("../services/GroupService");
const MemberService = require("../services/MemberService");
const NotificationService = require("../services/NotificationService");
const ListService = require("../services/ListService");
const {gerarTokenEmail} = require("../utils/validators");
const {runQuery} = require("../utils/queryHelper");
const path = require("path");
const fs = require("fs");

class UserController {
    constructor() {
        this.userService = new UserService();
        this.emailService = new EmailService();
        this.groupService = new GroupService();
        this.memberService = new MemberService();
        this.notificationService = new NotificationService();
        this.listService = new ListService();
    }

    /**
     * Cadastra um novo usuário e envia um e-mail de confirmação.
     * @param {Object} req - Requisição HTTP.
     * @param {Object} res - Resposta HTTP.
     */
    async cadastro(req, res) {

        // Extrai dados da requisição
        const {nome, email, senha} = req.body;

        // Identifica os campos obrigatórios e caso não foram preenchidos retorna erro
        if (!nome || !email || !senha) return res.status(400).json({
            success: false,
            message: "Todos os campos são obrigatórios!"
        });

        try {
            const {email: emailRow, emailToken} = await this.userService.cadastrarUsuario(nome, email, senha);
            await this.emailService.enviarConfirmacaoEmail(emailRow, emailToken);

            return res.status(200).json({success: true, message: "Cadastro Realizado! Verifique seu Email"});
        } catch (error) {
            console.error("Erro no cadastro:", error);
            return res.status(500).json({success: false, message: error.message});
        }
    }

    /**
     * Realiza o login do usuário e retorna um token.
     * @param {Object} req - Requisição HTTP.
     * @param {Object} res - Resposta HTTP.
     */
    async login(req, res) {

        // Extrai dados da requisição
        const {email, senha} = req.body;

        if (!email || !senha) return res.status(400).json({
            success: false,
            message: "E-mail e senha são obrigatórios!"
        });

        try {

            // Chama serviço de autenticação (login) que precisa  email e senha
            const {name, token} = await this.userService.loginUsuario(email, senha);

            // Retorna token para o cliente
            return res.status(200).json({success: true, name, token});
        } catch (error) {
            return res.status(error.status || 500)
                .json({success: false, status: error.status, message: error.message});
        }
    }

    /**
     * Verifica se o token de autenticação é válido.
     * @param {Object} req - Requisição HTTP.
     * @param {Object} res - Resposta HTTP.
     */
    async verificarToken(req, res) {
        return res.status(200).json({success: true, message: "Usuário Autenticado", user: req.usuario});
    }

    /**
     * Solicita a redefinição de senha e envia um e-mail com o token de redefinição.
     * @param {Object} req - Requisição HTTP.
     * @param {Object} res - Resposta HTTP.
     */
    async redefinirSenha(req, res) {
        const {email} = req.body;

        //função e retorno na mesma linha:
        if (!email) return res.status(400).json({message: "E-mail é obrigatório!"});

        // Gera token de reset e envia por e-mail
        try {
            const rows = await this.userService.getUserByEmail(email);

            if(!rows) return res.status(400).json({success: false, message: "Usuário não encontrado!"})

            const user = rows;

            if(!user.email_verified) return res.status(400).json({success: false, message: "Usuário não Verificado!"})

            const { emailToken } = await this.userService.redefinirSenha(user.user_id, email);
            await this.emailService.enviarRedefinicaoEmail(email, emailToken);
            return res.status(200).json({success: true, message: "Redefinicão de senha enviada! Verifique seu Email"});
        } catch (error) {
            console.error("Erro ao redefinir senha:", error);
            return res.status(500).json({success: false, message: "Erro ao redefinir senha."});
        }
    }

    /**
     * Verifica a senha criada pelo usuário e atualiza o usuário
     * @param {Object} req - Requisição HTTP.
     * @param {Object} res - Resposta HTTP.
     */
    async alterarSenha(req, res) {
        const {email, token, senha, confirmacaoSenha} = req.body;

        if (senha !== confirmacaoSenha) return res.status(400).json({
            success: false,
            message: "As senhas não são iguais!"
        });

        try {

            // Recupera o e-mail associado ao token
            const {email: emailRows} = await this.userService.verificarTokenResetPass(token);

            // Verifica o e-mail informado.
            if (email !== emailRows) return res.status(400).json({
                success: false,
                message: "O e-mail fornecido não corresponde ao e-mail vinculado ao token."
            });

            // Atualiza senha no banco
            await this.userService.alterarSenha(email, senha);
            //
            await this.userService.deletarTokenResetPass(token);
            return res.status(200).json({success: true, message: "Senha alterada com sucesso!"});
        } catch (error) {
            console.error("Erro ao alterar senha:", email, error);
            return res.status(500).json({success: false, message: error.message});
        }
    }

    /**
     * Confirma a verificação do e-mail do usuário.
     * @param {Object} req - Requisição HTTP.
     * @param {Object} res - Resposta HTTP.
     */
    async confirmarEmail(req, res) {

        // Extrai dados da requisição
        const {email, token} = req.body;

        if (!email || !token) return res.status(400).json({success: false, message: "Verificação de e-mail inválida!"});

        try {
            const {email: emailRow} = await this.userService.verificarTokenEmail(token);

            // Verifica se o e-mail fornecido corresponde ao e-mail associado ao token
            if (email !== emailRow) return res.status(400).json({
                success: false,
                message: "O e-mail fornecido não corresponde ao e-mail vinculado ao token."
            });

            // Marca usuário como verificado
            await this.userService.confirmarEmail(email, token);
            return res.status(200).json({success: true, message: "Email verificado!"});
        } catch (error) {
            console.error("Erro na verificação de e-mail:", error);
            return res.status(500).json({success: false, message: error.message});
        }
    }

    // Função para reconfirmar email de usuário
    async reconfirmarEmail(req, res) {
        const email = req.params.email;
        // Email Inexistente
        if (!email) return res.status(400).json({success: false, message: "Email não informado!"})

        try {
            // Busca o email do usuário
            const rows = await this.userService.getUserByEmail(email);
            // Verfica se o Email Existe
            if (!rows) return res.status(400).json({success: false, message: "Email não existe no Sistema!"})
            // Deleta a chave de e-mail antiga
            await runQuery("delete_token_email_by_email", [email]);
            // Gera um Token de Email
            const {emailToken, expiresAt} = gerarTokenEmail();
            // Insere chave de confirmação de e-mail
            await runQuery("insert_user_email_confirm_keys", [rows.user_id, email, emailToken, expiresAt]);
            // Envia o e-mail para o usuário
            await this.emailService.enviarConfirmacaoEmail(email, emailToken);
            // Mensagem de Sucesso
            return res.status(200).json({success: true, message: "Email reenviado com sucesso!"});
        } catch (error) {
            console.error("Erro ao confirmar email:", error);
            return res.status(500).json({success: false, message: "Erro ao reenviar email!",});
        }
    }

    // Obter perfil do usuário
    async getProfile(req, res) {
        const userId = req.usuario.id;

        try {
            const { rows } = await this.userService.getProfile(userId);
            const user = rows[0];
            const imagePath = user?.image_path;

            // Existência de arquivo
            let filePath = null;
            if (imagePath) {
                filePath = path.join(__dirname, '..', 'uploads', imagePath);
            }

            // Converter arquivo
            let fileBuffer = null;
            let ext = null;

            if(filePath) {
                // Lê o arquivo e converte para base64
                fileBuffer = fs.readFileSync(filePath);
                ext = path.extname(imagePath).toLowerCase().replace('.', '') || 'jpeg'; // ex: jpg, png
            }

            // Constrói Objeto de retorno
            const data = {
                userId: user.user_id,
                name: user.name,
                bio: user.bio,
                image: fileBuffer ? `data:image/${ext};base64,${fileBuffer.toString('base64')}` : null,
                genero: user.genero,
            }

            res.status(200).json({ success: true, message: 'Imagem em base64', data: data
            });
        } catch (error) {
            console.error("Erro ao buscar imagem:", error);
            res.status(500).json({ success: false, message: 'Erro ao buscar imagem.' });
        }
    }

    // atualizar imagem de perfil
    async updateProfile(req, res) {
        const userId = req.usuario.id;
        const { name, bio, genero } = req.body;

        const haveImg = req.file;

        let relativePath = null;

        // Usuário possui imagem?
        if (haveImg) {
            const filename = req.file.filename;
            relativePath = `profiles/${filename}`; // caminho que será usado via /api/profile
        }

        try {
            await this.userService.updateProfile(userId, name, bio, relativePath, genero);
            res.status(200).json({ success: true, message: 'Perfil Salvo com sucesso.'});
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'Erro ao salvar Perfil.' });
        }
    }

    async deleteProfile(req, res) {
        const userDeleted = req.usuario;
        try {
            // Busca todos os grupos do usuário
            const { rows: groups } = await this.groupService.getAllGroupsByUserId(userDeleted.id);
            // Verifica se ele possui grupos
            if(groups && groups.length > 0){
                for (const group of groups) {
                    // Coloca algum membro como admin
                    const { rows } = await this.memberService.getAll(group.group_id)
                    if( rows && rows.length > 0){
                        // Usuarios disponiveis
                        const availableUsers = rows.filter((user) => user.user_id !== userDeleted.id);
                        const user = availableUsers[0];

                        // atualiza o Admin
                        await this.groupService.updateAdmin(user.user_id, group.group_id);
                        const { rows: groupRows } = await this.groupService.getById(group.group_id);
                        const groupName = groupRows[0].group_name;

                        await this.notificationService.create(user.user_id, 1, `Você se tornou lider do grupo ${groupName}, pois o usuário ${userDeleted.name} excluíu sua conta`);

                        // Pega todas as listas de Grupo
                        const { rows: listRows } = await this.listService.getAllListsByGroupId(group.group_id);
                        // Filtra a que são do usuário
                        const listsUserDeleted = listRows.filter((list) => list.created_by === userDeleted.id);
                        // Percorre as listas
                        for(const list of listsUserDeleted) {
                            await this.listService.updateAdmin(user.user_id, list.list_id);
                        }

                    }
                }
            }

            await this.userService.delete(userDeleted.id);
            res.status(200).json({ success: true, message: 'Perfil Deletado com sucesso.'});
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, message: 'Erro ao deletar Perfil.' });
        }
    }
}

// Exporta o UserController
module.exports = new UserController();
