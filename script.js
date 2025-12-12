    // API Configuration
    const API_BASE = "https://api.frankfurter.app";
    
    // DOM Elements
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
    
    // State variables
    let base = "USD";
    let target = "BRL";
    let rate = null;
    let timer = null;
    let lastUpdate = null;
    let isLoading = false;
    
    // Currency flags mapping
    const currencyFlags = {
      'USD': '🇺🇸', 'EUR': '🇪🇺', 'GBP': '🇬🇧', 'JPY': '🇯🇵',
      'BRL': '🇧🇷', 'CAD': '🇨🇦', 'AUD': '🇦🇺', 'CHF': '🇨🇭',
      'CNY': '🇨🇳', 'INR': '🇮🇳', 'MXN': '🇲🇽', 'RUB': '🇷🇺',
      'ZAR': '🇿🇦', 'SGD': '🇸🇬', 'HKD': '🇭🇰', 'NZD': '🇳🇿',
      'SEK': '🇸🇪', 'NOK': '🇳🇴', 'DKK': '🇩🇰', 'TRY': '🇹🇷'
    };
    
    // Load available currencies
    async function loadCurrencies() {
      try {
        const res = await fetch(`${API_BASE}/currencies`);
        const data = await res.json();
        
        // Sort currencies by code
        const sortedCurrencies = Object.keys(data).sort();
        
        // Fill base select
        baseSel.innerHTML = '';
        sortedCurrencies.forEach(code => {
          const opt = document.createElement("option");
          opt.value = code;
          opt.textContent = `${code} - ${data[code]}`;
          if (code === base) opt.selected = true;
          baseSel.appendChild(opt);
        });
        
        // Fill target select
        targetSel.innerHTML = '';
        sortedCurrencies.forEach(code => {
          const opt = document.createElement("option");
          opt.value = code;
          opt.textContent = `${code} - ${data[code]}`;
          if (code === target) opt.selected = true;
          targetSel.appendChild(opt);
        });
        
        // Update flag
        updateFlag();
        
      } catch (error) {
        showError("Erro ao carregar lista de moedas");
      }
    }
    
    // Update currency flag
    function updateFlag() {
      baseFlag.textContent = currencyFlags[base] || '💵';
    }
    
    // Fetch exchange rate
    async function fetchRate() {
      if (isLoading) return;
      
      isLoading = true;
      refreshBtn.disabled = true;
      refreshText.innerHTML = '<span class="spinner"></span> Atualizando...';
      
      errorBox.style.display = 'none';
      
      // Same currency check
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
        const res = await fetch(`${API_BASE}/latest?from=${base}&to=${target}`);
        
        if (!res.ok) throw new Error('Network response was not ok');
        
        const data = await res.json();
        rate = data.rates[target];
        lastUpdate = new Date();
        
        updateUI(data.date);
        
      } catch (error) {
        showError("Erro ao buscar cotação. Verifique sua conexão.");
      } finally {
        isLoading = false;
        refreshBtn.disabled = false;
        refreshText.innerHTML = '<i class="fas fa-sync-alt"></i> Atualizar Agora';
      }
    }
    
    // Update UI with new data
    function updateUI(dateStr) {
      // Format rate with proper decimals
      const formattedRate = rate.toFixed(4);
      rateCard.textContent = `1 ${base} = ${formattedRate} ${target}`;
      
      // Format update time
      const updateTime = dateStr || lastUpdate.toLocaleTimeString('pt-BR');
      updateCard.textContent = updateTime;
      
      // Calculate and format result
      const amount = parseFloat(amountInp.value) || 0;
      const result = (amount * rate).toFixed(2);
      resultCard.textContent = `${result} ${target}`;
      
      // Add animation to result
      resultCard.parentElement.classList.add('pulse');
      setTimeout(() => {
        resultCard.parentElement.classList.remove('pulse');
      }, 1000);
    }
    
    // Show error message
    function showError(message) {
      errorBox.innerHTML = `<i class="fas fa-exclamation-triangle"></i> <span>${message}</span>`;
      errorBox.style.display = 'flex';
    }
    
    // Start/stop auto-refresh
    function startAutoRefresh() {
      clearInterval(timer);
      
      if (autoRefreshChk.checked) {
        const interval = parseInt(intervalSel.value);
        timer = setInterval(fetchRate, interval);
        
        // Update button text to show next update
        updateNextUpdateTime(interval);
      }
    }
    
    // Update next update time display
    function updateNextUpdateTime(interval) {
      const nextUpdate = new Date(Date.now() + interval);
      refreshText.innerHTML = `<i class="fas fa-clock"></i> Próxima: ${nextUpdate.getHours().toString().padStart(2, '0')}:${nextUpdate.getMinutes().toString().padStart(2, '0')}`;
    }
    
    // Swap currencies
    function swapCurrencies() {
      [base, target] = [target, base];
      baseSel.value = base;
      targetSel.value = target;
      updateFlag();
      fetchRate();
    }
    
    // Event Listeners
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
    
    // Initialize
    loadCurrencies().then(() => {
      fetchRate();
      startAutoRefresh();
    });
    
    // Update time every minute
    setInterval(() => {
      if (lastUpdate) {
        updateCard.textContent = lastUpdate.toLocaleTimeString('pt-BR');
      }
    }, 60000);