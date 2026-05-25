 const API_BASE = "https://api.exchangerate-api.com/v4/latest";
    
    const baseSel = document.getElementById("base");
    const targetSel = document.getElementById("target");
    const amountInp = document.getElementById("amount");
    const rateCard = document.getElementById("rateCard");
    const updateCard = document.getElementById("updateCard");
    const convertedValue = document.getElementById("convertedValue");
    const rateDetail = document.getElementById("rateDetail");
    const errorBox = document.getElementById("error");
    const autoRefreshChk = document.getElementById("autoRefresh");
    const intervalSel = document.getElementById("interval");
    const refreshBtn = document.getElementById("refresh");
    const baseFlag = document.getElementById("baseFlag");
    const refreshText = document.getElementById("refreshText");
    const resultItem = document.getElementById("resultItem");
    
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
      'KRW': '🇰🇷', 'SGD': '🇸🇬', 'NZD': '🇳🇿', 'SEK': '🇸🇪',
      'NOK': '🇳🇴', 'DKK': '🇩🇰', 'TRY': '🇹🇷', 'AED': '🇦🇪',
      'ARS': '🇦🇷', 'CLP': '🇨🇱', 'COP': '🇨🇴', 'PEN': '🇵🇪'
    };
    
async function loadCurrencies() {
  try {
    const res = await fetch(`${API_BASE}/USD`);
    const data = await res.json();
    
    const currencies = Object.keys(data.rates);
    currencies.unshift('USD');
    const sortedCurrencies = [...new Set(currencies)].sort();
    
    const getIconClass = (code) => {
      const icons = {
        'USD': 'fa-dollar-sign',
        'EUR': 'fa-euro-sign',
        'GBP': 'fa-pound-sign',
        'JPY': 'fa-yen-sign',
        'BRL': 'fa-brazilian-real',
        'CAD': 'fa-dollar-sign',
        'AUD': 'fa-dollar-sign',
        'CHF': 'fa-franc-sign',
        'CNY': 'fa-yen-sign',
        'INR': 'fa-rupee-sign',
        'MXN': 'fa-peso-sign',
        'RUB': 'fa-ruble-sign',
        'KRW': 'fa-won-sign',
        'SGD': 'fa-dollar-sign',
        'NZD': 'fa-dollar-sign',
        'SEK': 'fa-krona-sign',
        'NOK': 'fa-krona-sign',
        'DKK': 'fa-krone-sign',
        'TRY': 'fa-lira-sign',
        'AED': 'fa-money-bill-wave',
        'ARS': 'fa-peso-sign',
        'CLP': 'fa-peso-sign',
        'COP': 'fa-peso-sign',
        'PEN': 'fa-money-bill-wave'
      };
      return icons[code] || 'fa-money-bill-wave';
    };
    
    baseSel.innerHTML = '';
    sortedCurrencies.forEach(code => {
      const opt = document.createElement("option");
      opt.value = code;
      const iconClass = getIconClass(code);
      opt.textContent = `${code}`;
      opt.innerHTML = `<i class="fas ${iconClass}" style="margin-right: 8px;"></i> ${code}`;
      if (code === base) opt.selected = true;
      baseSel.appendChild(opt);
    });
    
    targetSel.innerHTML = '';
    sortedCurrencies.forEach(code => {
      const opt = document.createElement("option");
      opt.value = code;
      const iconClass = getIconClass(code);
      opt.innerHTML = `<i class="fas ${iconClass}" style="margin-right: 8px;"></i> ${code}`;
      if (code === target) opt.selected = true;
      targetSel.appendChild(opt);
    });
    
    updateFlag();
    
  } catch (error) {
    showError("Erro ao carregar lista de moedas");
  }
}
function updateFlag() {
  const iconMap = {
    'USD': 'fa-dollar-sign',
    'EUR': 'fa-euro-sign',
    'GBP': 'fa-pound-sign',
    'JPY': 'fa-yen-sign',
    'BRL': 'fa-brazilian-real',
    'BTC': 'fa-bitcoin',
    'ETH': 'fa-ethereum'
  };
  const iconClass = iconMap[base] || 'fa-money-bill-wave';
  baseFlag.innerHTML = `<i class="fas ${iconClass}"></i>`;
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
        const res = await fetch(`${API_BASE}/${base}`);
        
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
    
    function updateUI(dateStr) {
      const formattedRate = rate.toFixed(4);
      rateCard.textContent = `1 ${base} = ${formattedRate} ${target}`;
      
      const updateTime = dateStr ? new Date(dateStr).toLocaleTimeString('pt-BR') : lastUpdate.toLocaleTimeString('pt-BR');
      updateCard.textContent = updateTime;
      
      const amount = parseFloat(amountInp.value) || 0;
      const result = (amount * rate).toFixed(2);
      convertedValue.textContent = `${result} ${target}`;
      rateDetail.textContent = `1 ${base} = ${formattedRate} ${target} | 1 ${target} = ${(1/rate).toFixed(4)} ${base}`;
      
      resultItem.classList.add('pulse');
      setTimeout(() => {
        resultItem.classList.remove('pulse');
      }, 600);
    }
    
    function showError(message) {
      errorBox.innerHTML = `<i class="fas fa-exclamation-triangle"></i> <span>${message}</span>`;
      errorBox.style.display = 'flex';
      setTimeout(() => {
        errorBox.style.display = 'none';
      }, 5000);
    }
    
    function startAutoRefresh() {
      clearInterval(timer);
      
      if (autoRefreshChk.checked) {
        const interval = parseInt(intervalSel.value);
        timer = setInterval(fetchRate, interval);
      }
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