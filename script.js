document.addEventListener('DOMContentLoaded', () => {
  carregarEstados();
  carregarAnos();
  configurarEventos();
});

function carregarEstados() {
  fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
    .then(response => response.json())
    .then(estados => {
      const estadoSelect = document.getElementById('estadoSelect');
      estados.sort((a, b) => a.nome.localeCompare(b.nome));
      estados.forEach(estado => {
        const option = document.createElement('option');
        option.value = estado.id;
        option.textContent = estado.nome;
        estadoSelect.appendChild(option);
      });
    })
    .catch(error => console.error('Erro ao carregar estados:', error));
}

function carregarCidades(estadoId) {
  fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estadoId}/municipios`)
    .then(response => response.json())
    .then(cidades => {
      const cidadeSelect = document.getElementById('cidadeSelect');
      cidadeSelect.innerHTML = '<option value="">Selecione</option>';
      cidades.sort((a, b) => a.nome.localeCompare(b.nome));
      cidades.forEach(cidade => {
        const option = document.createElement('option');
        option.value = cidade.id;
        option.textContent = cidade.nome;
        cidadeSelect.appendChild(option);
      });
      cidadeSelect.disabled = false;
    })
    .catch(error => console.error('Erro ao carregar cidades:', error));
}

function carregarAnos() {
  const anoSelect = document.getElementById('anoSelect');
  const anoAtual = new Date().getFullYear();
  for (let ano = anoAtual; ano >= 2000; ano--) {
    const option = document.createElement('option');
    option.value = ano;
    option.textContent = ano;
    anoSelect.appendChild(option);
  }
}

function configurarEventos() {
  document.getElementById('estadoSelect').addEventListener('change', (event) => {
    const estadoId = event.target.value;
    if (estadoId) {
      carregarCidades(estadoId);
    } else {
      const cidadeSelect = document.getElementById('cidadeSelect');
      cidadeSelect.innerHTML = '<option value="">Selecione</option>';
      cidadeSelect.disabled = true;
    }
  });

  document.getElementById('cidadeSelect').addEventListener('change', () => {
    buscarIndicadores();
  });

  document.getElementById('anoSelect').addEventListener('change', () => {
    buscarIndicadores();
  });

  document.querySelectorAll('input[name="indicador"]').forEach(checkbox => {
    checkbox.addEventListener('change', () => {
      buscarIndicadores();
    });
  });
}

function buscarIndicadores() {
  const cidadeId = document.getElementById('cidadeSelect').value;
  const ano = document.getElementById('anoSelect').value;
  const indicadoresSelecionados = Array.from(document.querySelectorAll('input[name="indicador"]:checked')).map(cb => cb.value);

  if (!cidadeId || !ano || indicadoresSelecionados.length === 0) {
    return;
  }

  // Exemplo de IDs de variáveis na API SIDRA:
  const variaveis = {
    populacao: '93',
    densidade: '94',
    escolarizacao: '95',
    salario: '96',
    pib: '97'
  };

  indicadoresSelecionados.forEach(indicador => {
    const variavelId = variaveis[indicador];
    if (variavelId) {
      fetch(`https://servicodados.ibge.gov.br/api/v3/agregados/${variavelId}/periodos/${ano}/variaveis/${variavelId}?localidades=N6[${cidadeId}]`)
        .then(response => response.json())
        .then(dados => {
          const resultado = dados[0]?.resultados[0]?.series[0]?.serie[ano];
          if (resultado) {
            document.getElementById(indicador).textContent = resultado;
          } else {
            document.getElementById(indicador).textContent = 'Dados não disponíveis';
          }
        })
        .catch(error => {
          console.error(`Erro ao buscar indicador ${indicador}:`, error);
          document.getElementById(indicador).textContent = 'Erro ao carregar';
        });
    }
  });
}
