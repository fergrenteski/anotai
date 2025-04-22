Claro! Aqui está o passo a passo atualizado para **clonar um repositório privado do GitHub via SSH**:

---

# **🛠️ Passo a Passo para Clonar um Repositório Privado do GitHub via SSH**

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
Pegue o conteúdo da chave pública para adicionar no GitHub:

```sh
cat ~/.ssh/id_rsa.pub
```

Copie o texto inteiro que aparece.

---

### **4️⃣ Adicionar a chave ao GitHub**
1. Vá para [https://github.com/settings/keys](https://github.com/settings/keys).
2. Clique em **New SSH key**.
3. Dê um nome para a chave (ex: "Meu Notebook").
4. Cole a chave no campo **Key** e clique em **Add SSH key**.

---

### **5️⃣ Testar a conexão com o GitHub**
No terminal, execute:

```sh
ssh -T git@github.com
```

Se estiver tudo certo, verá uma mensagem como:

```
Hi seu-usuario! You've successfully authenticated, but GitHub does not provide shell access.
```