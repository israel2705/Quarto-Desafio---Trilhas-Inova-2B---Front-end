let graficoLinha, graficoBarra;

async function buscarCidade() {
  const cidadeInput = document.getElementById('buscaCidade').value.trim().toLowerCase();
  const indicadoresSelecionados = Array.from(document.querySelectorAll('#filtrosForm input:checked')).map(el => el.value);

  if (!cidadeInput) {
    alert('Digite o nome de uma cidade.');
    return;
  }

  try {
    const municipios = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/municipios')
      .then(res => res.json());
    const cidade = municipios.find(m => m.nome.toLowerCase() === cidadeInput);

    if (!cidade) {
      alert('Cidade não encontrada.');
      return;
    }

    const cidadeId = cidade.id;
    document.getElementById('mapa').innerText = `Cidade selecionada: ${cidade.nome}`;

    const anos = ['2018', '2019', '2020', '2021', '2022'];
    const valoresRenda = [1200, 1300, 1350, 1400, 1500]; 
    const valoresEducacao = [8.5, 8.7, 9.0, 9.1, 9.3];

    if (graficoLinha) graficoLinha.destroy();
    if (graficoBarra) graficoBarra.destroy();

    const ctxLinha = document.createElement('canvas');
    document.getElementById('grafico-linha').innerHTML = '';
    document.getElementById('grafico-linha').appendChild(ctxLinha);

    graficoLinha = new Chart(ctxLinha, {
      type: 'line',
      data: {
        labels: anos,
        datasets: [{
          label: 'Renda Média per capita (R$)',
          data: valoresRenda,
          borderColor: 'blue',
          backgroundColor: 'lightblue',
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          title: { display: true, text: 'Evolução da Renda Média' }
        }
      }
    });

    const ctxBarra = document.createElement('canvas');
    document.getElementById('grafico-barra').innerHTML = '';
    document.getElementById('grafico-barra').appendChild(ctxBarra);

    graficoBarra = new Chart(ctxBarra, {
      type: 'bar',
      data: {
        labels: ['Renda', 'Educação'],
        datasets: [{
          label: cidade.nome,
          data: [valoresRenda.at(-1), valoresEducacao.at(-1)],
          backgroundColor: ['green', 'orange']
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: 'Indicadores Comparativos' }
        }
      }
    });

    document.getElementById('tabela').innerHTML = `
      <p><strong>Última Renda:</strong> R$ ${valoresRenda.at(-1)}</p>
      <p><strong>Escolaridade Média:</strong> ${valoresEducacao.at(-1)} anos</p>
    `;

  } catch (err) {
    console.error('Erro ao buscar dados:', err);
    alert('Erro ao buscar dados.');
  }
}
