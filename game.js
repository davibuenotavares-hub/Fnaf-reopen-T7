const state = {
    doorClosed: false, windowClosed: false, monitorOpen: false,
    temperature: 25, currentCam: 1, hour: 0, power: 100,
    freddyPos: 6, babyPos: 6, springPos: 6,
    babyTimer: 0, isRecharging: false, extremeTempTimer: 0
};

// --- MECÂNICA DE ESPIAR (CONSERTADA) ---
function checkProximity(place) {
    const status = document.getElementById('office-status');
    if (place === 'door') {
        // Agora verifica explicitamente se a posição é 0 (Escritório)
        if (state.freddyPos === 0 || state.springPos === 0) {
            let quem = state.freddyPos === 0 ? "FREDDY" : "SPRINGBONNIE";
            status.innerText = "ALERTA: " + quem + " DETECTADO NA PORTA!";
            status.style.color = "red";
        } else {
            status.innerText = "NADA NA PORTA DIREITA";
            status.style.color = "#0f0";
        }
    }
    if (place === 'window') {
        if (state.babyPos === 0) {
            status.innerText = "ALERTA: BABY DETECTADA NA JANELA!";
            status.style.color = "red";
        } else {
            status.innerText = "NADA NA JANELA";
            status.style.color = "#0f0";
        }
    }
    setTimeout(() => { status.innerText = "SISTEMAS OK"; status.style.color = "white"; }, 2000);
}

// --- TEMPERATURA MANUAL (1 por 1) ---
document.getElementById('btn-temp-down').onclick = () => {
    state.temperature--;
    updateTempUI();
};
document.getElementById('btn-temp-up').onclick = () => {
    state.temperature++;
    updateTempUI();
};

function updateTempUI() {
    document.getElementById('temp-display').innerText = `TEMP: ${state.temperature}°C`;
}

// --- OUTROS CONTROLES ---
document.getElementById('btn-door-action').onclick = () => {
    state.doorClosed = !state.doorClosed;
    document.getElementById('door-right').classList.toggle('closed');
};
document.getElementById('btn-window-action').onclick = () => {
    state.windowClosed = !state.windowClosed;
    document.getElementById('window').classList.toggle('closed');
};
document.getElementById('btn-open-monitor').onclick = () => {
    state.monitorOpen = true;
    document.getElementById('camera-monitor').style.display = 'flex';
};
document.getElementById('btn-close-cam').onclick = () => {
    state.monitorOpen = false;
    state.isRecharging = false;
    document.getElementById('camera-monitor').style.display = 'none';
};

const audioBtn = document.getElementById('btn-audio-center');
const rechargeBtn = document.getElementById('btn-recharge');

audioBtn.onclick = () => {
    state.springPos = Math.min(6, state.currentCam + 1);
};
rechargeBtn.onpointerdown = () => { state.isRecharging = true; };
rechargeBtn.onpointerup = () => { state.isRecharging = false; };

document.querySelectorAll('.cam-btn').forEach(btn => {
    btn.onclick = (e) => {
        state.currentCam = parseInt(e.target.dataset.cam);
        document.getElementById('cam-name').innerText = "CAM 0" + state.currentCam;
        rechargeBtn.style.display = (state.currentCam === 4) ? "block" : "none";
        audioBtn.style.display = (state.currentCam !== 4) ? "block" : "none";
    };
});

// --- LOOP PRINCIPAL ---
setInterval(() => {
    // 1. Energia
    if (state.isRecharging && state.monitorOpen && state.currentCam === 4) {
        state.power = Math.min(100, state.power + 2.5);
    } else {
        let drain = 0.05 + (state.doorClosed ? 0.2 : 0) + (state.windowClosed ? 0.2 : 0);
        state.power -= drain;
    }
    document.getElementById('power-display').innerText = `BATERIA: ${Math.floor(state.power)}%`;
    if (state.power <= 0) gameOver("FALTA DE ENERGIA");

    // 2. Alerta de Temperatura Crítica
    if (state.temperature <= 0 || state.temperature >= 50) {
        state.extremeTempTimer++;
        if (state.extremeTempTimer >= 60) gameOver("COLAPSO TÉRMICO");
    } else {
        state.extremeTempTimer = 0;
    }

    // 3. IA Lenta (10% de chance de mover)
    if (Math.random() > 0.90) {
        state.freddyPos = state.freddyPos > 0 ? state.freddyPos - 1 : (state.doorClosed ? 4 : 0);
        if (state.freddyPos === 0 && !state.doorClosed && Math.random() > 0.8) gameOver("FREDDY");
    }

    if (Math.random() > 0.92) {
        state.springPos = state.springPos > 0 ? state.springPos - 1 : (state.doorClosed ? 5 : 0);
        if (state.springPos === 0 && !state.doorClosed && Math.random() > 0.8) gameOver("SPRINGBONNIE");
    }

    // 4. Baby (15s na janela)
    if (Math.random() > 0.95 && state.babyPos > 0) state.babyPos--;
    if (state.babyPos === 0) {
        state.babyTimer++;
        if (state.babyTimer >= 15) {
            if (state.temperature <= 10 || state.windowClosed) {
                state.babyPos = 4;
                state.babyTimer = 0;
            } else gameOver("CIRCUS BABY");
        }
    }
}, 1000);

// Relógio
setInterval(() => {
    state.hour++;
    document.getElementById('clock').innerText = state.hour + " AM";
    if (state.hour >= 6) { alert("VENCEU A NOITE!"); location.reload(); }
}, 60000);

function gameOver(m) { alert("JUMPSCARE: " + m); location.reload(); }
