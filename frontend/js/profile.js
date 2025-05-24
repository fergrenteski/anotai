function previewImage(event) {
  const input = event.target;
  const image = document.getElementById('profileImage');

  if (input.files && input.files[0]) {
    const reader = new FileReader();

    reader.onload = function(e) {
      image.src = e.target.result;
    };

    reader.readAsDataURL(input.files[0]);
  }
}

document.getElementById("file-input").addEventListener("change", (event) => previewImage(event));

async function salvarPerfil() {
  const nome = document.getElementById('bio-nome').value;
  const bio = document.getElementById('bio-texto').value;
  const profileImage = document.getElementById('profileImage').src;

  const token = sessionStorage.getItem('token');

  try {
    const response = await fetch('http://localhost:3000/api/user/perfil', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        nome,
        bio,
        profile_img_url: profileImage
      })
    });

    const result = await response.json();

    if (response.ok) {
      alert('Perfil atualizado com sucesso!');
    } else {
      alert(`Erro: ${result.message}`);
    }
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    alert('Erro ao atualizar perfil!');
  }
}

document.getElementById('salvarPerfil').addEventListener('click', salvarPerfil);

async function alterarSenha() {
  const senhaAtual = document.getElementById('senha-atual').value;
  const novaSenha = document.getElementById('nova-senha').value;
  const confirmarNovaSenha = document.getElementById('confirmar-nova-senha').value;

  const token = sessionStorage.getItem('token');

  if (novaSenha !== confirmarNovaSenha) {
    alert('As novas senhas não coincidem!');
    return;
  }

  document.getElementById('salvarNovaSenha').addEventListener('click', alterarSenha);

  try {
    const response = await fetch('http://localhost:3000/api/user/alterar-senha', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        senhaAtual,
        novaSenha,
        confirmarNovaSenha
      })
    });

    const result = await response.json();

    if (response.ok) {
      alert('Senha alterada com sucesso!');
      // Limpa os campos após sucesso
      document.getElementById('senha-atual').value = '';
      document.getElementById('nova-senha').value = '';
      document.getElementById('confirmar-nova-senha').value = '';
    } else {
      alert(`Erro: ${result.message}`);
    }
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    alert('Erro ao alterar senha!');
  }
}