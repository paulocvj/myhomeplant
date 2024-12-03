document.addEventListener('DOMContentLoaded', () => {
  let humidityChart = null; // Inicialize o gráfico como null.
  const statusIndicator = document.getElementById('status-indicator');

  // Inicializa o gráfico com os dados existentes
  async function initializeChart() {
    try {
      const response = await fetch('/api/humidity');
      if (!response.ok) {
        throw new Error(`Erro na conexão: ${response.statusText}`);
      }

      const data = await response.json();

      // Atualizar o status para online
      updateStatusIndicator(true);

      // Pegar os últimos 20 valores do banco de dados
      const last20 = data.slice(0, 20).reverse();
      const labels = last20.map((entry) => formatTimestamp(entry.timestamp));
      const values = last20.map((entry) => entry.humidity);

      updateChart(labels, values);
    } catch (error) {
      console.error('Erro ao buscar umidade inicial:', error);
      updateStatusIndicator(false); // Atualizar o status para erro
    }
  }

  // Conexão com WebSocket para atualizações em tempo real
  const ws = new WebSocket(`ws://${window.location.host}`);

  ws.onopen = () => {
    console.log('WebSocket conectado.');
    updateStatusIndicator(true); // Atualiza o status para online
  };

  ws.onclose = () => {
    console.error('WebSocket desconectado.');
    updateStatusIndicator(false); // Atualiza o status para erro
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);

      // Atualizar o gráfico com os novos dados
      const labels = humidityChart?.data?.labels || [];
      const values = humidityChart?.data?.datasets[0]?.data || [];

      labels.push(formatTimestamp(data.timestamp));
      values.push(data.humidity);

      // Limita o gráfico aos últimos 20 pontos
      if (labels.length > 20) labels.shift();
      if (values.length > 20) values.shift();

      updateChart(labels, values);
    } catch (error) {
      console.error('Erro ao processar mensagem do WebSocket:', error);
    }
  };

  // Formata o timestamp para o formato desejado
  function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }).format(date);
  }

  // Atualiza o gráfico (cria ou atualiza)
  function updateChart(labels, values) {
    const ctx = document.getElementById('humidityChart').getContext('2d');

    if (!humidityChart) {
      // Inicialize o gráfico apenas uma vez
      humidityChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Umidade (%)',
              data: values,
              borderColor: 'blue',
              backgroundColor: 'rgba(0, 0, 255, 0.1)',
              borderWidth: 1,
            },
          ],
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
              max: 100,
            },
          },
        },
      });
    } else {
      // Atualizar o gráfico existente
      humidityChart.data.labels = labels;
      humidityChart.data.datasets[0].data = values;
      humidityChart.update();
    }
  }

  // Atualiza o status do indicador
  function updateStatusIndicator(isOnline) {
    if (isOnline) {
      statusIndicator.textContent = 'Online';
      statusIndicator.classList.remove('error');
      statusIndicator.style.display = 'block';
    } else {
      statusIndicator.textContent = 'Erro de conexão';
      statusIndicator.classList.add('error');
      statusIndicator.style.display = 'block';
    }
  }

  // Inicializa o gráfico com dados existentes
  initializeChart();
});
