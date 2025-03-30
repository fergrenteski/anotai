# **🛠️ Passo a Passo para Clonar um Repositório Privado do Bitbucket via SSH**

### **1️⃣ Gerar uma chave SSH (caso ainda não tenha)**
Abra o terminal e rode:

```sh
ssh-keygen -t rsa -b 4096 -C "seu-email@example.com"
```

- Quando pedir um local para salvar, pressione **Enter** (usa o padrão `~/.ssh/id_rsa`).
- Se pedir uma senha, pode deixar em branco e pressionar **Enter**.

---

### **2️⃣ Adicionar a chave ao SSH-Agent**
Ative o SSH-Agent e adicione sua chave SSH:

```sh
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_rsa
```

---

### **3️⃣ Copiar a chave pública**
Pegue o conteúdo da chave pública para adicionar no Bitbucket:

```sh
cat ~/.ssh/id_rsa.pub
```

Copie o texto inteiro que aparece.

---

### **4️⃣ Adicionar a chave ao Bitbucket**
1. Vá para o [Bitbucket](https://bitbucket.org/account/settings/).
2. No menu esquerdo, clique em **SSH Keys**.
3. Clique em **Add key**.
4. Cole a chave copiada no campo e clique em **Add Key**.

---

### **5️⃣ Testar a conexão com o Bitbucket**
No terminal, execute:

```sh
ssh -T git@bitbucket.org
```

Se estiver tudo certo, você verá uma mensagem como:

```
authenticated via ssh key
```

Se der erro, siga para o **Passo 6**.

---

### **6️⃣ Configurar o arquivo SSH (se necessário)**
Se o Bitbucket ainda pedir senha ao clonar, edite o arquivo de configuração SSH:

```sh
nano ~/.ssh/config
```

Adicione as seguintes linhas (ou crie o arquivo se não existir):

```
Host bitbucket.org
  IdentityFile ~/.ssh/id_rsa
  User git
  PreferredAuthentications publickey
```

Salve (`CTRL + X`, `Y`, `Enter`).

Reinicie o SSH-Agent e tente novamente:

```sh
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_rsa
ssh -T git@bitbucket.org
```

---

### **7️⃣ Clonar o repositório**
Agora, clone o repositório com SSH:

```sh
git clone git@bitbucket.org:seu-time/repositorio.git
```

Se ainda pedir senha, rode:

```sh
GIT_SSH_COMMAND="ssh -i ~/.ssh/id_rsa" git clone git@bitbucket.org:seu-time/repositorio.git
```

---

### **🛠️ Debug (se o erro continuar)**
Se ainda não funcionar, ative o modo debug para ver detalhes do erro:

```sh
ssh -vvv git@bitbucket.org
```

Me mande as últimas linhas do erro para analisarmos juntos. 🚀