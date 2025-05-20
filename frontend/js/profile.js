// Quando a página carregar, buscar dados atuais do usuário
window.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('token'); // supondo que armazene o JWT
  const res = await fetch('http://localhost:3000/api/user/me', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const user = await res.json();

  // Preenche campos e preview de foto
  document.getElementById('profileNameText').innerText = user.name;
  document.getElementById('profileEmailText').innerText = user.email;
  document.getElementById('nameInput').value = user.name;
  document.getElementById('emailInput').value = user.email;
  if (user.profile_img_url) {
    document.getElementById('profileImagePreview').src = user.profile_img_url;
  }
});

// Ao clicar em “Salvar alterações”, envia formData
document.getElementById('button-save-profile').addEventListener('click', async () => {
  const form = document.getElementById('profile-form');
  const formData = new FormData(form);
  const token = localStorage.getItem('token');

  try {
    const res = await fetch('http://localhost:3000/api/user/profile', {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    const data = await res.json();
    if (data.success) {
      alert('Perfil atualizado com sucesso!');
      // opcional: atualizar preview de imagem e texto
    } else {
      alert('Erro ao atualizar perfil: ' + data.message);
    }
  } catch (err) {
    console.error(err);
    alert('Erro de conexão ao servidor.');
  }
});
