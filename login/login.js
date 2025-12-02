document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Impede o envio padrão do formulário
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const message = document.getElementById('login-message');
    
    // Validação básica
    if (!email || !password) {
        message.textContent = 'Por favor, preencha todos os campos!';
        message.style.color = 'red';
        return;
    }
    
    // Simulação de login (substitua por lógica real, ex.: fetch para API)
    if (email === 'admin@vidaplus.com' && password === '123456') {
        message.textContent = 'Login realizado com sucesso! Redirecionando...';
        message.style.color = 'green';
        // Comando de redirecionamento para a página principal
        setTimeout(() => {
            window.location.href = '/index.html'; // Redireciona para index.html após 1 segundo
        }, 1000);
    } else {
        message.textContent = 'Email ou senha incorretos!';
        message.style.color = 'red';
    }
});