const button = document.getElementById('email-send');
const message = document.getElementById('message');


button.addEventListener('click', async (e) => {
    e.preventDefault();
    // Busca de Parâmetros
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const email = urlParams.get('email');

    // Requisição
    const response = await fetch(`http://localhost:3000/api/user/reconfirmar-email/${email}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
    })

    // Transforma em json
    const data = await response.json();

    // Verifica sucesso
    if(data.success) {
        message.innerText = data.message;
        message.style.color = "green";
        // Desabilita o botão e inicia o timer de 30 segundos
        button.disabled = true;
        button.style.opacity = "0.5";
        let timeLeft = 30;
        button.textContent = `Aguarde (${timeLeft}s)`;

        const countdown = setInterval(() => {
            timeLeft--;
            button.textContent = `Aguarde (${timeLeft}s)`;

            if (timeLeft <= 0) {
                clearInterval(countdown);
                button.disabled = false;
                button.textContent = 'Reenviar E-mail';
                button.style.opacity = "1";
            }
        }, 1000);
    } else {
        message.innerText = data.message;
        message.style.color = "red";
    }
})