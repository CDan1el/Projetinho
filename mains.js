// ==============================================
// VIDAPLUS - SISTEMA DE GESTÃO HOSPITALAR
// JavaScript Principal - Integração Completa
// ==============================================

// Variáveis globais para armazenamento de dados
let pacientes = [];
let profissionais = [];
let leitos = [];
let consultas = [];
let agendamentosTelemedicina = [];
let logsAuditoria = [];

// ==============================================
// FUNÇÕES PRINCIPAIS DE NAVEGAÇÃO
// ==============================================

function showTab(tabName) {
    // Remove classe active de todas as abas
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.content-section').forEach(section => section.classList.remove('active'));
    
    // Adiciona classe active à aba selecionada
    event.target.classList.add('active');
    document.getElementById(tabName).classList.add('active');
    
    // Atualiza dados específicos da aba
    if (tabName === 'dashboard') {
        atualizarDashboard();
    } else if (tabName === 'telemedicina') {
        carregarPacientesTelemedicina();
        carregarMedicosTelemedicina();
    }
    
    registrarLog('navegacao', `Acesso à aba: ${tabName}`);
}

// ==============================================
// DASHBOARD - FUNÇÕES
// ==============================================

function atualizarDashboard() {
    // Atualiza contadores do dashboard
    document.getElementById('total-pacientes').textContent = pacientes.length;
    document.getElementById('total-profissionais').textContent = profissionais.length;
    
    // Conta leitos ocupados
    const leitosOcupados = leitos.filter(leito => leito.status === 'ocupado').length;
    document.getElementById('leitos-ocupados').textContent = leitosOcupados;
    
    // Conta consultas de hoje
    const hoje = new Date().toDateString();
    const consultasHoje = consultas.filter(consulta => 
        new Date(consulta.data).toDateString() === hoje
    ).length;
    document.getElementById('consultas-hoje').textContent = consultasHoje;
    
    // Animação dos números
    animarContadores();
}

function animarContadores() {
    const contadores = document.querySelectorAll('.dashboard-number');
    contadores.forEach(contador => {
        const valor = parseInt(contador.textContent);
        contador.textContent = '0';
        
        let atual = 0;
        const incremento = Math.ceil(valor / 20);
        const timer = setInterval(() => {
            atual += incremento;
            if (atual >= valor) {
                contador.textContent = valor;
                clearInterval(timer);
            } else {
                contador.textContent = atual;
            }
        }, 50);
    });
}

// ==============================================
// PACIENTES - FUNÇÕES
// ==============================================

function cadastrarPaciente() {
    const nome = document.getElementById('paciente-nome').value;
    const cpf = document.getElementById('paciente-cpf').value;
    const nascimento = document.getElementById('paciente-nascimento').value;
    const telefone = document.getElementById('paciente-telefone').value;
    const email = document.getElementById('paciente-email').value;
    const plano = document.getElementById('paciente-plano').value;
    
    // Validações
    if (!nome || !cpf) {
        mostrarAlerta('alert-pacientes', 'Nome e CPF são obrigatórios!', 'error');
        return;
    }
    
    if (!validarCPF(cpf)) {
        mostrarAlerta('alert-pacientes', 'CPF inválido!', 'error');
        return;
    }
    
    // Verifica se CPF já existe
    if (pacientes.find(p => p.cpf === cpf)) {
        mostrarAlerta('alert-pacientes', 'CPF já cadastrado!', 'error');
        return;
    }
    
    // Cria novo paciente
    const novoPaciente = {
        id: Date.now(),
        nome,
        cpf,
        nascimento,
        telefone,
        email,
        plano: plano || 'Particular',
        dataCadastro: new Date().toISOString(),
        status: 'Ativo',
        ultimaConsulta: null
    };
    
    pacientes.push(novoPaciente);
    limparFormularioPaciente();
    atualizarTabelaPacientes();
    mostrarAlerta('alert-pacientes', 'Paciente cadastrado com sucesso!', 'success');
    
    registrarLog('cadastro', `Paciente cadastrado: ${nome} (CPF: ${cpf})`);
}

function limparFormularioPaciente() {
    document.getElementById('paciente-nome').value = '';
    document.getElementById('paciente-cpf').value = '';
    document.getElementById('paciente-nascimento').value = '';
    document.getElementById('paciente-telefone').value = '';
    document.getElementById('paciente-email').value = '';
    document.getElementById('paciente-plano').value = '';
}

function atualizarTabelaPacientes() {
    const tbody = document.querySelector('#tabela-pacientes tbody');
    tbody.innerHTML = '';
    
    pacientes.forEach(paciente => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${paciente.nome}</td>
            <td>${formatarCPF(paciente.cpf)}</td>
            <td>${paciente.plano}</td>
            <td>${paciente.ultimaConsulta ? formatarData(paciente.ultimaConsulta) : 'Nunca'}</td>
            <td><span class="status ${paciente.status.toLowerCase()}">${paciente.status}</span></td>
            <td>
                <button class="btn-small" onclick="verProntuario(${paciente.id})">Prontuário</button>
                <button class="btn-small" onclick="editarPaciente(${paciente.id})">Editar</button>
                <button class="btn-small btn-danger" onclick="excluirPaciente(${paciente.id})">Excluir</button>
            </td>
        `;
    });
}

function agendarConsulta() {
    if (pacientes.length === 0) {
        mostrarAlerta('alert-pacientes', 'Cadastre um paciente primeiro!', 'warning');
        return;
    }
    
    // Simulação de agendamento - em um sistema real, abriria modal
    const pacienteAleatorio = pacientes[Math.floor(Math.random() * pacientes.length)];
    const dataConsulta = new Date();
    dataConsulta.setDate(dataConsulta.getDate() + Math.floor(Math.random() * 30) + 1);
    
    const novaConsulta = {
        id: Date.now(),
        pacienteId: pacienteAleatorio.id,
        data: dataConsulta.toISOString(),
        tipo: 'Consulta',
        status: 'Agendada'
    };
    
    consultas.push(novaConsulta);
    mostrarAlerta('alert-pacientes', `Consulta agendada para ${pacienteAleatorio.nome}`, 'success');
    
    registrarLog('agendamento', `Consulta agendada para paciente ID: ${pacienteAleatorio.id}`);
}

function verProntuario(pacienteId) {
    const paciente = pacientes.find(p => p.id === pacienteId);
    if (!paciente) return;
    
    const modal = document.getElementById('modal-prontuario');
    const content = document.getElementById('prontuario-content');
    
    content.innerHTML = `
        <div class="prontuario-info">
            <h4>${paciente.nome}</h4>
            <p><strong>CPF:</strong> ${formatarCPF(paciente.cpf)}</p>
            <p><strong>Data de Nascimento:</strong> ${formatarData(paciente.nascimento)}</p>
            <p><strong>Telefone:</strong> ${paciente.telefone}</p>
            <p><strong>Email:</strong> ${paciente.email}</p>
            <p><strong>Plano:</strong> ${paciente.plano}</p>
            <p><strong>Status:</strong> ${paciente.status}</p>
            <hr>
            <h5>Histórico de Consultas</h5>
            <p>Nenhuma consulta registrada ainda.</p>
        </div>
    `;
    
    modal.style.display = 'block';
    registrarLog('consulta', `Prontuário visualizado: ${paciente.nome}`);
}

function editarPaciente(pacienteId) {
    const paciente = pacientes.find(p => p.id === pacienteId);
    if (!paciente) return;
    
    // Preenche formulário com dados do paciente
    document.getElementById('paciente-nome').value = paciente.nome;
    document.getElementById('paciente-cpf').value = paciente.cpf;
    document.getElementById('paciente-nascimento').value = paciente.nascimento;
    document.getElementById('paciente-telefone').value = paciente.telefone;
    document.getElementById('paciente-email').value = paciente.email;
    document.getElementById('paciente-plano').value = paciente.plano;
    
    // Remove paciente da lista (será re-adicionado ao salvar)
    pacientes = pacientes.filter(p => p.id !== pacienteId);
    atualizarTabelaPacientes();
    
    mostrarAlerta('alert-pacientes', 'Paciente carregado para edição', 'info');
}

function excluirPaciente(pacienteId) {
    if (confirm('Tem certeza que deseja excluir este paciente?')) {
        const paciente = pacientes.find(p => p.id === pacienteId);
        pacientes = pacientes.filter(p => p.id !== pacienteId);
        atualizarTabelaPacientes();
        mostrarAlerta('alert-pacientes', 'Paciente excluído com sucesso!', 'success');
        
        registrarLog('exclusao', `Paciente excluído: ${paciente.nome}`);
    }
}

// ==============================================
// PROFISSIONAIS - FUNÇÕES
// ==============================================

function cadastrarProfissional() {
    const nome = document.getElementById('prof-nome').value;
    const registro = document.getElementById('prof-registro').value;
    const especialidade = document.getElementById('prof-especialidade').value;
    const telefone = document.getElementById('prof-telefone').value;
    const email = document.getElementById('prof-email').value;
    const unidade = document.getElementById('prof-unidade').value;
    
    // Validações
    if (!nome || !registro) {
        mostrarAlerta('alert-profissionais', 'Nome e registro são obrigatórios!', 'error');
        return;
    }
    
    // Verifica se registro já existe
    if (profissionais.find(p => p.registro === registro)) {
        mostrarAlerta('alert-profissionais', 'Registro já cadastrado!', 'error');
        return;
    }
    
    // Cria novo profissional
    const novoProfissional = {
        id: Date.now(),
        nome,
        registro,
        especialidade,
        telefone,
        email,
        unidade,
        dataCadastro: new Date().toISOString(),
        status: 'Ativo'
    };
    
    profissionais.push(novoProfissional);
    limparFormularioProfissional();
    atualizarTabelaProfissionais();
    mostrarAlerta('alert-profissionais', 'Profissional cadastrado com sucesso!', 'success');
    
    registrarLog('cadastro', `Profissional cadastrado: ${nome} (${registro})`);
}

function limparFormularioProfissional() {
    document.getElementById('prof-nome').value = '';
    document.getElementById('prof-registro').value = '';
    document.getElementById('prof-especialidade').value = 'clinico';
    document.getElementById('prof-telefone').value = '';
    document.getElementById('prof-email').value = '';
    document.getElementById('prof-unidade').value = 'hospital-central';
}

function atualizarTabelaProfissionais() {
    const tbody = document.querySelector('#tabela-profissionais tbody');
    tbody.innerHTML = '';
    
    profissionais.forEach(profissional => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${profissional.nome}</td>
            <td>${profissional.registro}</td>
            <td>${formatarEspecialidade(profissional.especialidade)}</td>
            <td>${formatarUnidade(profissional.unidade)}</td>
            <td><span class="status ${profissional.status.toLowerCase()}">${profissional.status}</span></td>
            <td>
                <button class="btn-small" onclick="editarProfissional(${profissional.id})">Editar</button>
                <button class="btn-small btn-danger" onclick="excluirProfissional(${profissional.id})">Excluir</button>
            </td>
        `;
    });
}

function editarProfissional(profissionalId) {
    const profissional = profissionais.find(p => p.id === profissionalId);
    if (!profissional) return;
    
    // Preenche formulário
    document.getElementById('prof-nome').value = profissional.nome;
    document.getElementById('prof-registro').value = profissional.registro;
    document.getElementById('prof-especialidade').value = profissional.especialidade;
    document.getElementById('prof-telefone').value = profissional.telefone;
    document.getElementById('prof-email').value = profissional.email;
    document.getElementById('prof-unidade').value = profissional.unidade;
    
    // Remove da lista
    profissionais = profissionais.filter(p => p.id !== profissionalId);
    atualizarTabelaProfissionais();
    
    mostrarAlerta('alert-profissionais', 'Profissional carregado para edição', 'info');
}

function excluirProfissional(profissionalId) {
    if (confirm('Tem certeza que deseja excluir este profissional?')) {
        const profissional = profissionais.find(p => p.id === profissionalId);
        profissionais = profissionais.filter(p => p.id !== profissionalId);
        atualizarTabelaProfissionais();
        mostrarAlerta('alert-profissionais', 'Profissional excluído com sucesso!', 'success');
        
        registrarLog('exclusao', `Profissional excluído: ${profissional.nome}`);
    }
}

// ==============================================
// ADMINISTRAÇÃO - FUNÇÕES
// ==============================================

function cadastrarLeito() {
    const numero = document.getElementById('leito-numero').value;
    const setor = document.getElementById('leito-setor').value;
    const status = document.getElementById('leito-status').value;
    
    if (!numero) {
        mostrarAlerta('alert-administracao', 'Número do leito é obrigatório!', 'error');
        return;
    }
    
    // Verifica se número já existe
    if (leitos.find(l => l.numero === numero)) {
        mostrarAlerta('alert-administracao', 'Número de leito já cadastrado!', 'error');
        return;
    }
    
    const novoLeito = {
        id: Date.now(),
        numero,
        setor,
        status,
        paciente: null,
        dataCadastro: new Date().toISOString()
    };
    
    leitos.push(novoLeito);
    limparFormularioLeito();
    atualizarTabelaLeitos();
    mostrarAlerta('alert-administracao', 'Leito cadastrado com sucesso!', 'success');
    
    registrarLog('cadastro', `Leito cadastrado: ${numero} - ${setor}`);
}

function limparFormularioLeito() {
    document.getElementById('leito-numero').value = '';
    document.getElementById('leito-setor').value = 'enfermaria';
    document.getElementById('leito-status').value = 'disponivel';
}

function atualizarTabelaLeitos() {
    const tbody = document.querySelector('#tabela-leitos tbody');
    tbody.innerHTML = '';
    
    leitos.forEach(leito => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${leito.numero}</td>
            <td>${formatarSetor(leito.setor)}</td>
            <td><span class="status ${leito.status}">${formatarStatusLeito(leito.status)}</span></td>
            <td>${leito.paciente || '-'}</td>
            <td>
                <button class="btn-small" onclick="alterarStatusLeito(${leito.id})">Alterar Status</button>
                <button class="btn-small btn-danger" onclick="excluirLeito(${leito.id})">Excluir</button>
            </td>
        `;
    });
}

function alterarStatusLeito(leitoId) {
    const leito = leitos.find(l => l.id === leitoId);
    if (!leito) return;
    
    const statusOptions = ['disponivel', 'ocupado', 'manutencao'];
    const currentIndex = statusOptions.indexOf(leito.status);
    const nextIndex = (currentIndex + 1) % statusOptions.length;
    
    leito.status = statusOptions[nextIndex];
    atualizarTabelaLeitos();
    
    registrarLog('alteracao', `Status do leito ${leito.numero} alterado para: ${leito.status}`);
}

function excluirLeito(leitoId) {
    if (confirm('Tem certeza que deseja excluir este leito?')) {
        const leito = leitos.find(l => l.id === leitoId);
        leitos = leitos.filter(l => l.id !== leitoId);
        atualizarTabelaLeitos();
        mostrarAlerta('alert-administracao', 'Leito excluído com sucesso!', 'success');
        
        registrarLog('exclusao', `Leito excluído: ${leito.numero}`);
    }
}

// ==============================================
// TELEMEDICINA - FUNÇÕES
// ==============================================

function carregarPacientesTelemedicina() {
    const select = document.getElementById('tele-paciente');
    select.innerHTML = '<option value="">Selecione um paciente</option>';
    
    pacientes.forEach(paciente => {
        const option = document.createElement('option');
        option.value = paciente.id;
        option.textContent = paciente.nome;
        select.appendChild(option);
    });
}

function carregarMedicosTelemedicina() {
    const select = document.getElementById('tele-medico');
    select.innerHTML = '<option value="">Selecione um médico</option>';
    
    const medicos = profissionais.filter(p => 
        ['clinico', 'cardiologia', 'pediatria', 'ginecologia', 'ortopedia'].includes(p.especialidade)
    );
    
    medicos.forEach(medico => {
        const option = document.createElement('option');
        option.value = medico.id;
        option.textContent = `${medico.nome} - ${formatarEspecialidade(medico.especialidade)}`;
        select.appendChild(option);
    });
}

function agendarTelemedicina() {
    const pacienteId = document.getElementById('tele-paciente').value;
    const medicoId = document.getElementById('tele-medico').value;
    const datetime = document.getElementById('tele-datetime').value;
    const tipo = document.getElementById('tele-tipo').value;
    const observacoes = document.getElementById('tele-observacoes').value;
    
    if (!pacienteId || !medicoId || !datetime) {
        mostrarAlerta('alert-telemedicina', 'Paciente, médico e data/hora são obrigatórios!', 'error');
        return;
    }
    
    const paciente = pacientes.find(p => p.id == pacienteId);
    const medico = profissionais.find(p => p.id == medicoId);
    
    const novoAgendamento = {
        id: Date.now(),
        pacienteId,
        medicoId,
        pacienteNome: paciente.nome,
        medicoNome: medico.nome,
        datetime,
        tipo,
        observacoes,
        status: 'Agendada',
        dataAgendamento: new Date().toISOString()
    };
    
    agendamentosTelemedicina.push(novoAgendamento);
    limparFormularioTelemedicina();
    atualizarTabelaTelemedicina();
    mostrarAlerta('alert-telemedicina', 'Telemedicina agendada com sucesso!', 'success');
    
    registrarLog('agendamento', `Telemedicina agendada: ${paciente.nome} com ${medico.nome}`);
}

function limparFormularioTelemedicina() {
    document.getElementById('tele-paciente').value = '';
    document.getElementById('tele-medico').value = '';
    document.getElementById('tele-datetime').value = '';
    document.getElementById('tele-tipo').value = 'consulta';
    document.getElementById('tele-observacoes').value = '';
}

function atualizarTabelaTelemedicina() {
    const tbody = document.querySelector('#tabela-telemedicina tbody');
    tbody.innerHTML = '';
    
    agendamentosTelemedicina.forEach(agendamento => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${formatarDataHora(agendamento.datetime)}</td>
            <td>${agendamento.pacienteNome}</td>
            <td>${agendamento.medicoNome}</td>
            <td>${formatarTipoConsulta(agendamento.tipo)}</td>
            <td><span class="status ${agendamento.status.toLowerCase()}">${agendamento.status}</span></td>
            <td>
                <button class="btn-small" onclick="iniciarConsultaEspecifica(${agendamento.id})">Iniciar</button>
                <button class="btn-small btn-danger" onclick="cancelarTelemedicina(${agendamento.id})">Cancelar</button>
            </td>
        `;
    });
}

function iniciarConsulta() {
    mostrarAlerta('alert-telemedicina', 'Funcionalidade de videochamada seria integrada aqui (WebRTC)', 'info');
    registrarLog('telemedicina', 'Tentativa de iniciar consulta online');
}

function iniciarConsultaEspecifica(agendamentoId) {
    const agendamento = agendamentosTelemedicina.find(a => a.id === agendamentoId);
    if (!agendamento) return;
    
    agendamento.status = 'Em andamento';
    atualizarTabelaTelemedicina();
    mostrarAlerta('alert-telemedicina', `Consulta iniciada: ${agendamento.pacienteNome}`, 'success');
    
    registrarLog('telemedicina', `Consulta iniciada: ${agendamento.pacienteNome} com ${agendamento.medicoNome}`);
}

function cancelarTelemedicina(agendamentoId) {
    if (confirm('Tem certeza que deseja cancelar este agendamento?')) {
        const agendamento = agendamentosTelemedicina.find(a => a.id === agendamentoId);
        agendamentosTelemedicina = agendamentosTelemedicina.filter(a => a.id !== agendamentoId);
        atualizarTabelaTelemedicina();
        mostrarAlerta('alert-telemedicina', 'Agendamento cancelado!', 'success');
        
        registrarLog('cancelamento', `Telemedicina cancelada: ${agendamento.pacienteNome}`);
    }
}

// ==============================================
// AUDITORIA - FUNÇÕES
// ==============================================

function buscarLogs() {
    const dataInicio = document.getElementById('audit-data-inicio').value;
    const dataFim = document.getElementById('audit-data-fim').value;
    const tipo = document.getElementById('audit-tipo').value;
    const usuario = document.getElementById('audit-usuario').value;
    
    let logsFiltrados = [...logsAuditoria];
    
    // Filtros
    if (dataInicio) {
        logsFiltrados = logsFiltrados.filter(log => 
            new Date(log.timestamp) >= new Date(dataInicio)
        );
    }
    
    if (dataFim) {
        logsFiltrados = logsFiltrados.filter(log => 
            new Date(log.timestamp) <= new Date(dataFim + 'T23:59:59')
        );
    }
    
    if (tipo) {
        logsFiltrados = logsFiltrados.filter(log => log.acao === tipo);
    }
    
    if (usuario) {
        logsFiltrados = logsFiltrados.filter(log => 
            log.usuario.toLowerCase().includes(usuario.toLowerCase())
        );
    }
    
    atualizarTabelaAuditoria(logsFiltrados);
}

function atualizarTabelaAuditoria(logs = logsAuditoria) {
    const tbody = document.querySelector('#tabela-auditoria tbody');
    tbody.innerHTML = '';
    
    logs.forEach(log => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${formatarDataHora(log.timestamp)}</td>
            <td>${log.usuario}</td>
            <td>${log.acao}</td>
            <td>${log.detalhes}</td>
            <td>${log.ip}</td>
        `;
    });
}

function exportarRelatorio() {
    if (logsAuditoria.length === 0) {
        mostrarAlerta('alert-auditoria', 'Nenhum log para exportar!', 'warning');
        return;
    }
    
    // Simula exportação (em um sistema real, geraria CSV/PDF)
    const dados = logsAuditoria.map(log => 
        `${formatarDataHora(log.timestamp)},${log.usuario},${log.acao},"${log.detalhes}",${log.ip}`
    ).join('\n');
    
    const csvContent = 'data:text/csv;charset=utf-8,Data/Hora,Usuário,Ação,Detalhes,IP\n' + dados;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `relatorio_auditoria_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    mostrarAlerta('alert-auditoria', 'Relatório exportado com sucesso!', 'success');
    registrarLog('export', 'Relatório de auditoria exportado');
}

// ==============================================
// FUNÇÕES UTILITÁRIAS
// ==============================================

function mostrarAlerta(elementId, mensagem, tipo) {
    const elemento = document.getElementById(elementId);
    elemento.innerHTML = `<div class="alert alert-${tipo}">${mensagem}</div>`;
    
    // Remove alerta após 5 segundos
    setTimeout(() => {
        elemento.innerHTML = '';
    }, 5000);
}

function registrarLog(acao, detalhes) {
    const novoLog = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        usuario: 'Sistema', // Em um sistema real, seria o usuário logado
        acao,
        detalhes,
        ip: '127.0.0.1' // Em um sistema real, seria o IP real
    };
    
    logsAuditoria.push(novoLog);
}

function fecharModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Funções de formatação
function formatarCPF(cpf) {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

function formatarData(data) {
    if (!data) return '';
    return new Date(data).toLocaleDateString('pt-BR');
}

function formatarDataHora(data) {
    if (!data) return '';
    return new Date(data).toLocaleString('pt-BR');
}

function formatarEspecialidade(especialidade) {
    const especialidades = {
        'clinico': 'Clínico Geral',
        'cardiologia': 'Cardiologia',
        'pediatria': 'Pediatria',
        'ginecologia': 'Ginecologia',
        'ortopedia': 'Ortopedia',
        'enfermagem': 'Enfermagem',
        'tecnico': 'Técnico'
    };
    return especialidades[especialidade] || especialidade;
}

function formatarUnidade(unidade) {
    const unidades = {
        'hospital-central': 'Hospital Central',
        'clinica-norte': 'Clínica Norte',
        'clinica-sul': 'Clínica Sul',
        'laboratorio': 'Laboratório',
        'home-care': 'Home Care'
    };
    return unidades[unidade] || unidade;
}

function formatarSetor(setor) {
    const setores = {
        'enfermaria': 'Enfermaria',
        'uti': 'UTI',
        'pediatria': 'Pediatria',
        'maternidade': 'Maternidade'
    };
    return setores[setor] || setor;
}

function formatarStatusLeito(status) {
    const statusMap = {
        'disponivel': 'Disponível',
        'ocupado': 'Ocupado',
        'manutencao': 'Manutenção'
    };
    return statusMap[status] || status;
}

function formatarTipoConsulta(tipo) {
    const tipos = {
        'consulta': 'Consulta',
        'retorno': 'Retorno',
        'emergencia': 'Emergência'
    };
    return tipos[tipo] || tipo;
}

function validarCPF(cpf) {
    // Remove caracteres não numéricos
    cpf = cpf.replace(/[^\d]+/g, '');
    
    // Verifica se tem 11 dígitos
    if (cpf.length !== 11) return false;
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cpf)) return false;
    
    // Validação dos dígitos verificadores
    let soma = 0;
    let resto;
    
    // Primeiro dígito verificador
    for (let i = 1; i <= 9; i++) {
        soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;
    
    // Segundo dígito verificador
    soma = 0;
    for (let i = 1; i <= 10; i++) {
        soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(10, 11))) return false;
    
    return true;
}

function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// ==============================================
// FUNCIONALIDADES AVANÇADAS
// ==============================================

// Busca inteligente de pacientes
function buscarPaciente(termo) {
    if (!termo) return pacientes;
    
    termo = termo.toLowerCase();
    return pacientes.filter(paciente => 
        paciente.nome.toLowerCase().includes(termo) ||
        paciente.cpf.includes(termo) ||
        paciente.email.toLowerCase().includes(termo)
    );
}

// Estatísticas do sistema
function calcularEstatisticas() {
    const stats = {
        totalPacientes: pacientes.length,
        totalProfissionais: profissionais.length,
        totalLeitos: leitos.length,
        leitosOcupados: leitos.filter(l => l.status === 'ocupado').length,
        leitosDisponiveis: leitos.filter(l => l.status === 'disponivel').length,
        leitosManutencao: leitos.filter(l => l.status === 'manutencao').length,
        consultasAgendadas: agendamentosTelemedicina.filter(a => a.status === 'Agendada').length,
        consultasEmAndamento: agendamentosTelemedicina.filter(a => a.status === 'Em andamento').length,
        ocupacaoLeitos: leitos.length > 0 ? 
            Math.round((leitos.filter(l => l.status === 'ocupado').length / leitos.length) * 100) : 0
    };
    
    return stats;
}

// Notificações do sistema
function verificarNotificacoes() {
    const notificacoes = [];
    const hoje = new Date();
    
    // Verifica consultas próximas (próximas 2 horas)
    const duasHoras = new Date(hoje.getTime() + (2 * 60 * 60 * 1000));
    const consultasProximas = agendamentosTelemedicina.filter(a => {
        const dataConsulta = new Date(a.datetime);
        return dataConsulta >= hoje && dataConsulta <= duasHoras && a.status === 'Agendada';
    });
    
    if (consultasProximas.length > 0) {
        notificacoes.push({
            tipo: 'consulta',
            mensagem: `Você tem ${consultasProximas.length} consulta(s) nas próximas 2 horas`,
            quantidade: consultasProximas.length
        });
    }
    
    // Verifica leitos em manutenção
    const leitosManutencao = leitos.filter(l => l.status === 'manutencao').length;
    if (leitosManutencao > 0) {
        notificacoes.push({
            tipo: 'manutencao',
            mensagem: `${leitosManutencao} leito(s) em manutenção`,
            quantidade: leitosManutencao
        });
    }
    
    // Verifica ocupação alta (acima de 90%)
    const stats = calcularEstatisticas();
    if (stats.ocupacaoLeitos > 90) {
        notificacoes.push({
            tipo: 'ocupacao',
            mensagem: `Ocupação alta: ${stats.ocupacaoLeitos}%`,
            quantidade: stats.ocupacaoLeitos
        });
    }
    
    return notificacoes;
}

// Backup de dados
function fazerBackup() {
    const dadosBackup = {
        pacientes,
        profissionais,
        leitos,
        consultas,
        agendamentosTelemedicina,
        logsAuditoria,
        timestamp: new Date().toISOString(),
        versao: '1.0'
    };
    
    const backup = JSON.stringify(dadosBackup, null, 2);
    const blob = new Blob([backup], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `vidaplus_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    registrarLog('backup', 'Backup do sistema realizado');
    return true;
}

// Restaurar backup
function restaurarBackup(arquivo) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const dados = JSON.parse(e.target.result);
            
            // Validação básica
            if (!dados.versao || !dados.timestamp) {
                throw new Error('Arquivo de backup inválido');
            }
            
            // Restaura os dados
            pacientes = dados.pacientes || [];
            profissionais = dados.profissionais || [];
            leitos = dados.leitos || [];
            consultas = dados.consultas || [];
            agendamentosTelemedicina = dados.agendamentosTelemedicina || [];
            logsAuditoria = dados.logsAuditoria || [];
            
            // Atualiza as tabelas
            atualizarTabelaPacientes();
            atualizarTabelaProfissionais();
            atualizarTabelaLeitos();
            atualizarTabelaTelemedicina();
            atualizarTabelaAuditoria();
            atualizarDashboard();
            
            registrarLog('restauracao', `Backup restaurado: ${dados.timestamp}`);
            alert('Backup restaurado com sucesso!');
            
        } catch (error) {
            alert('Erro ao restaurar backup: ' + error.message);
            registrarLog('erro', `Erro na restauração: ${error.message}`);
        }
    };
    reader.readAsText(arquivo);
}

// ==============================================
// RELATÓRIOS E ANÁLISES
// ==============================================

function gerarRelatorioOcupacao() {
    const stats = calcularEstatisticas();
    const relatorio = {
        dataGeracao: new Date().toISOString(),
        totalLeitos: stats.totalLeitos,
        leitosOcupados: stats.leitosOcupados,
        leitosDisponiveis: stats.leitosDisponiveis,
        leitosManutencao: stats.leitosManutencao,
        percentualOcupacao: stats.ocupacaoLeitos,
        detalhePorSetor: {}
    };
    
    // Agrupa por setor
    const setores = ['enfermaria', 'uti', 'pediatria', 'maternidade'];
    setores.forEach(setor => {
        const leitosSetor = leitos.filter(l => l.setor === setor);
        const ocupadosSetor = leitosSetor.filter(l => l.status === 'ocupado').length;
        
        relatorio.detalhePorSetor[setor] = {
            total: leitosSetor.length,
            ocupados: ocupadosSetor,
            disponveis: leitosSetor.filter(l => l.status === 'disponivel').length,
            manutencao: leitosSetor.filter(l => l.status === 'manutencao').length,
            percentual: leitosSetor.length > 0 ? 
                Math.round((ocupadosSetor / leitosSetor.length) * 100) : 0
        };
    });
    
    return relatorio;
}

function gerarRelatorioConsultas(dataInicio, dataFim) {
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    
    const consultasPeriodo = agendamentosTelemedicina.filter(a => {
        const dataConsulta = new Date(a.datetime);
        return dataConsulta >= inicio && dataConsulta <= fim;
    });
    
    const relatorio = {
        periodo: { inicio: dataInicio, fim: dataFim },
        totalConsultas: consultasPeriodo.length,
        consultasRealizadas: consultasPeriodo.filter(c => c.status === 'Realizada').length,
        consultasAgendadas: consultasPeriodo.filter(c => c.status === 'Agendada').length,
        consultasCanceladas: consultasPeriodo.filter(c => c.status === 'Cancelada').length,
        consultasPorTipo: {},
        consultasPorMedico: {}
    };
    
    // Agrupa por tipo
    const tipos = ['consulta', 'retorno', 'emergencia'];
    tipos.forEach(tipo => {
        relatorio.consultasPorTipo[tipo] = consultasPeriodo.filter(c => c.tipo === tipo).length;
    });
    
    // Agrupa por médico
    consultasPeriodo.forEach(consulta => {
        const medico = consulta.medicoNome;
        if (!relatorio.consultasPorMedico[medico]) {
            relatorio.consultasPorMedico[medico] = 0;
        }
        relatorio.consultasPorMedico[medico]++;
    });
    
    return relatorio;
}

// ==============================================
// INTEGRAÇÃO E APIs
// ==============================================

// Simulação de integração com API externa (SUS, ANS, etc.)
function validarPacienteSUS(cpf) {
    // Simula consulta à API do SUS
    return new Promise((resolve) => {
        setTimeout(() => {
            // Simula resposta
            const dadosSUS = {
                encontrado: Math.random() > 0.3, // 70% de chance de encontrar
                nome: 'Nome do Paciente SUS',
                cartaoSUS: '123456789012345',
                planoSaude: 'SUS'
            };
            resolve(dadosSUS);
        }, 1000);
    });
}

// Simulação de integração com laboratório
function enviarExameLaboratorio(pacienteId, tipoExame) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const resultado = {
                protocolo: 'LAB' + Date.now(),
                pacienteId,
                tipoExame,
                status: 'Enviado',
                previsaoResultado: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            };
            resolve(resultado);
        }, 500);
    });
}

// ==============================================
// EVENTOS E INICIALIZAÇÃO
// ==============================================

// Event listeners para modais
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
};

// Formatação automática de CPF
document.addEventListener('DOMContentLoaded', function() {
    const cpfInputs = document.querySelectorAll('input[id*="cpf"]');
    cpfInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
            e.target.value = value;
        });
    });
    
    // Formatação automática de telefone
    const telefoneInputs = document.querySelectorAll('input[type="tel"]');
    telefoneInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length <= 10) {
                value = value.replace(/(\d{2})(\d)/, '($1) $2');
                value = value.replace(/(\d{4})(\d)/, '$1-$2');
            } else {
                value = value.replace(/(\d{2})(\d)/, '($1) $2');
                value = value.replace(/(\d{5})(\d)/, '$1-$2');
            }
            e.target.value = value;
        });
    });
});

// Inicialização do sistema
function inicializarSistema() {
    // Dados de exemplo para demonstração
    const dadosExemplo = {
        pacientes: [
            {
                id: 1,
                nome: 'Maria da Silva',
                cpf: '12345678901',
                nascimento: '1980-05-15',
                telefone: '(11) 98765-4321',
                email: 'maria@email.com',
                plano: 'Unimed',
                dataCadastro: new Date().toISOString(),
                status: 'Ativo',
                ultimaConsulta: null
            },
            {
                id: 2,
                nome: 'João Santos',
                cpf: '98765432100',
                nascimento: '1975-12-03',
                telefone: '(11) 91234-5678',
                email: 'joao@email.com',
                plano: 'SUS',
                dataCadastro: new Date().toISOString(),
                status: 'Ativo',
                ultimaConsulta: null
            }
        ],
        profissionais: [
            {
                id: 1,
                nome: 'Dr. Carlos Oliveira',
                registro: 'CRM12345',
                especialidade: 'cardiologia',
                telefone: '(11) 99999-8888',
                email: 'carlos@hospital.com',
                unidade: 'hospital-central',
                dataCadastro: new Date().toISOString(),
                status: 'Ativo'
            }
        ],
        leitos: [
            {
                id: 1,
                numero: '101',
                setor: 'enfermaria',
                status: 'disponivel',
                paciente: null,
                dataCadastro: new Date().toISOString()
            },
            {
                id: 2,
                numero: '102',
                setor: 'enfermaria',
                status: 'ocupado',
                paciente: 'Maria da Silva',
                dataCadastro: new Date().toISOString()
            }
        ]
    };
    
    // Carrega dados de exemplo apenas se não existirem dados
    if (pacientes.length === 0) {
        pacientes.push(...dadosExemplo.pacientes);
        profissionais.push(...dadosExemplo.profissionais);
        leitos.push(...dadosExemplo.leitos);
    }
    
    // Atualiza todas as tabelas
    atualizarTabelaPacientes();
    atualizarTabelaProfissionais();
    atualizarTabelaLeitos();
    atualizarDashboard();
    
    // Registra inicialização
    registrarLog('sistema', 'Sistema VidaPlus inicializado');
    
    console.log('Sistema VidaPlus inicializado com sucesso!');
}

// Auto-salvar dados no localStorage (simulação de persistência)
function autoSalvar() {
    try {
        const dadosSistema = {
            pacientes,
            profissionais,
            leitos,
            consultas,
            agendamentosTelemedicina,
            logsAuditoria,
            ultimoSalvamento: new Date().toISOString()
        };
        
        localStorage.setItem('vidaplus_dados', JSON.stringify(dadosSistema));
        console.log('Dados salvos automaticamente');
    } catch (error) {
        console.warn('Erro ao salvar dados:', error);
    }
}

// Carregar dados salvos
function carregarDadosSalvos() {
    try {
        const dadosSalvos = localStorage.getItem('vidaplus_dados');
        if (dadosSalvos) {
            const dados = JSON.parse(dadosSalvos);
            
            pacientes = dados.pacientes || [];
            profissionais = dados.profissionais || [];
            leitos = dados.leitos || [];
            consultas = dados.consultas || [];
            agendamentosTelemedicina = dados.agendamentosTelemedicina || [];
            logsAuditoria = dados.logsAuditoria || [];
            
            console.log('Dados carregados do armazenamento local');
            return true;
        }
    } catch (error) {
        console.warn('Erro ao carregar dados salvos:', error);
    }
    return false;
}

// Inicialização quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    // Tenta carregar dados salvos primeiro
    if (!carregarDadosSalvos()) {
        // Se não há dados salvos, inicializa com dados de exemplo
        inicializarSistema();
    } else {
        // Atualiza as interfaces com os dados carregados
        atualizarTabelaPacientes();
        atualizarTabelaProfissionais();
        atualizarTabelaLeitos();
        atualizarTabelaTelemedicina();
        atualizarTabelaAuditoria();
        atualizarDashboard();
    }
    
    // Configura auto-salvamento a cada 30 segundos
    setInterval(autoSalvar, 30000);
    
    // Verifica notificações a cada minuto
    setInterval(() => {
        const notificacoes = verificarNotificacoes();
        if (notificacoes.length > 0) {
            console.log('Notificações pendentes:', notificacoes);
            // Aqui poderia mostrar notificações na interface
        }
    }, 60000);
});

// ==============================================
// EXPORT PARA USO GLOBAL
// ==============================================

// Disponibiliza funções principais no escopo global
window.VidaPlus = {
    // Funções principais
    cadastrarPaciente,
    cadastrarProfissional,
    cadastrarLeito,
    agendarTelemedicina,
    
    // Utilitários
    calcularEstatisticas,
    verificarNotificacoes,
    fazerBackup,
    restaurarBackup,
    
    // Relatórios
    gerarRelatorioOcupacao,
    gerarRelatorioConsultas,
    
    // Dados (para debug/desenvolvimento)
    get dados() {
        return {
            pacientes,
            profissionais,
            leitos,
            consultas,
            agendamentosTelemedicina,
            logsAuditoria
        };
    }
};

console.log('VidaPlus Sistema de Gestão Hospitalar - Versão 1.0');
console.log('Desenvolvido para gerenciamento completo de instituições de saúde');