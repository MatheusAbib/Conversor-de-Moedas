const API_BASE = "https://api.exchangerate-api.com/v4/latest";
    
    const baseSel = document.getElementById("base");
    const targetSel = document.getElementById("target");
    const amountInp = document.getElementById("amount");
    const rateCard = document.getElementById("rateCard");
    const updateCard = document.getElementById("updateCard");
    const resultCard = document.querySelector("#resultCard .card-value");
    const errorBox = document.getElementById("error");
    const autoRefreshChk = document.getElementById("autoRefresh");
    const intervalSel = document.getElementById("interval");
    const refreshBtn = document.getElementById("refresh");
    const baseFlag = document.getElementById("baseFlag");
    const refreshText = document.getElementById("refreshText");
    
    let base = "USD";
    let target = "BRL";
    let rate = null;
    let timer = null;
    let lastUpdate = null;
    let isLoading = false;
    
    const currencyFlags = {
      'USD': '🇺🇸', 'EUR': '🇪🇺', 'GBP': '🇬🇧', 'JPY': '🇯🇵',
      'BRL': '🇧🇷', 'CAD': '🇨🇦', 'AUD': '🇦🇺', 'CHF': '🇨🇭',
      'CNY': '🇨🇳', 'INR': '🇮🇳', 'MXN': '🇲🇽', 'RUB': '🇷🇺',
      'ZAR': '🇿🇦', 'SGD': '🇸🇬', 'HKD': '🇭🇰', 'NZD': '🇳🇿',
      'SEK': '🇸🇪', 'NOK': '🇳🇴', 'DKK': '🇩🇰', 'TRY': '🇹🇷'
    };
    
  async function loadCurrencies() {
  try {
    const res = await fetch(`${API_BASE}/USD`);
    const data = await res.json();
    
    const sortedCurrencies = Object.keys(data.rates).sort();
    if (!sortedCurrencies.includes('USD')) sortedCurrencies.unshift('USD');
    
    baseSel.innerHTML = '';
    sortedCurrencies.forEach(code => {
      const opt = document.createElement("option");
      opt.value = code;
      opt.textContent = `${code}`;
      if (code === base) opt.selected = true;
      baseSel.appendChild(opt);
    });
    
    targetSel.innerHTML = '';
    sortedCurrencies.forEach(code => {
      const opt = document.createElement("option");
      opt.value = code;
      opt.textContent = `${code}`;
      if (code === target) opt.selected = true;
      targetSel.appendChild(opt);
    });
    
    updateFlag();
    
  } catch (error) {
    showError("Erro ao carregar lista de moedas");
  }
}
    
    function updateFlag() {
      baseFlag.textContent = currencyFlags[base] || '💵';
    }
    
    async function fetchRate() {
  if (isLoading) return;
  
  isLoading = true;
  refreshBtn.disabled = true;
  refreshText.innerHTML = '<span class="spinner"></span> Atualizando...';
  
  errorBox.style.display = 'none';
  
  if (base === target) {
    rate = 1;
    lastUpdate = new Date();
    updateUI();
    isLoading = false;
    refreshBtn.disabled = false;
    refreshText.innerHTML = '<i class="fas fa-sync-alt"></i> Atualizar Agora';
    return;
  }
  
  try {
    // Nova URL para a API alternativa
    const res = await fetch(`${API_BASE}/${base}`);
    
    if (!res.ok) throw new Error('Network response was not ok');
    
    const data = await res.json();
    rate = data.rates[target];
    lastUpdate = new Date();
    
    updateUI(data.date);
    
  } catch (error) {
    showError("Erro ao buscar cotação. Verifique sua conexão.");
    console.error("Erro detalhado:", error);
  } finally {
    isLoading = false;
    refreshBtn.disabled = false;
    refreshText.innerHTML = '<i class="fas fa-sync-alt"></i> Atualizar Agora';
  }
}
    
    function updateUI(dateStr) {
      const formattedRate = rate.toFixed(4);
      rateCard.textContent = `1 ${base} = ${formattedRate} ${target}`;
      
      const updateTime = dateStr || lastUpdate.toLocaleTimeString('pt-BR');
      updateCard.textContent = updateTime;
      
      const amount = parseFloat(amountInp.value) || 0;
      const result = (amount * rate).toFixed(2);
      resultCard.textContent = `${result} ${target}`;
      
      resultCard.parentElement.classList.add('pulse');
      setTimeout(() => {
        resultCard.parentElement.classList.remove('pulse');
      }, 1000);
    }
    
    function showError(message) {
      errorBox.innerHTML = `<i class="fas fa-exclamation-triangle"></i> <span>${message}</span>`;
      errorBox.style.display = 'flex';
    }
    
    function startAutoRefresh() {
      clearInterval(timer);
      
      if (autoRefreshChk.checked) {
        const interval = parseInt(intervalSel.value);
        timer = setInterval(fetchRate, interval);
        
        updateNextUpdateTime(interval);
      }
    }
    
    function updateNextUpdateTime(interval) {
      const nextUpdate = new Date(Date.now() + interval);
      refreshText.innerHTML = `<i class="fas fa-clock"></i> Próxima: ${nextUpdate.getHours().toString().padStart(2, '0')}:${nextUpdate.getMinutes().toString().padStart(2, '0')}`;
    }
    
    function swapCurrencies() {
      [base, target] = [target, base];
      baseSel.value = base;
      targetSel.value = target;
      updateFlag();
      fetchRate();
    }
    
    baseSel.addEventListener('change', () => {
      base = baseSel.value;
      updateFlag();
      fetchRate();
    });
    
    targetSel.addEventListener('change', () => {
      target = targetSel.value;
      fetchRate();
    });
    
    amountInp.addEventListener('input', () => {
      if (rate) updateUI();
    });
    
    refreshBtn.addEventListener('click', fetchRate);
    document.getElementById('swap').addEventListener('click', swapCurrencies);
    autoRefreshChk.addEventListener('change', startAutoRefresh);
    intervalSel.addEventListener('change', startAutoRefresh);
    
    loadCurrencies().then(() => {
      fetchRate();
      startAutoRefresh();
    });
    
    setInterval(() => {
      if (lastUpdate) {
        updateCard.textContent = lastUpdate.toLocaleTimeString('pt-BR');
      }
    }, 60000);