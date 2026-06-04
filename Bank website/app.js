const gebruikers = [
    { username: 'Ahmed', password: '12' },
    { username: 'Sara', password: '34' },
    { username: 'Jan', password: '56' }
];

let rekeningen = [
    { id: 1, type: 'Betaalrekening', number: 'NL20 BVDT 0208 1265 70', balance: 1500.00 },
    { id: 2, type: 'Spaarrekening', number: 'NL20 BVDT 0208 1265 71', balance: 3200.50 }
];

const transacties = [
    { id: 1, type: 'inkomend', datum: '20-11-2025', bedrag: 2600.00, omschrijving: 'Salaris' },
    { id: 2, type: 'uitgaand', datum: '22-11-2025', bedrag: -68.75, omschrijving: 'Hoogvliet' },
    { id: 3, type: 'uitgaand', datum: '25-11-2025', bedrag: -182.45, omschrijving: 'Zorgverzekering' },
    { id: 4, type: 'uitgaand', datum: '27-11-2025', bedrag: -720.00, omschrijving: 'Huurwoning' },
    { id: 5, type: 'inkomend', datum: '20-12-2025', bedrag: 2600.00, omschrijving: 'Salaris' },
    { id: 6, type: 'uitgaand', datum: '21-12-2025', bedrag: -56.00, omschrijving: 'NS Reiskosten' }
];

let beleggingPrijzen = {
    'Tesla inc': 750,
    'Ayden N.V': 1200,
    'GreenEnergy': 45
};

let gebruikerBeleggingen = {
    'Tesla inc': 5,
    'Ayden N.V': 10,
    'GreenEnergy': 20
};

let cryptoPrijzen = {
    'Bitcoin': 76540,
    'Ethereum': 8700,
    'Litecoin': 980
};

let gebruikerCryptoPortefeuille = {
    'Bitcoin': 0.05,
    'Ethereum': 0.5,
    'Litecoin': 2
};

let vorigePrijzenStocks = { ...beleggingPrijzen };
let vorigePrijzenCrypto = { ...cryptoPrijzen };

function toonPagina(naam) {
    document.querySelectorAll('.page').forEach(p => p.classList.add('verborgen'));
    const doelPagina = document.getElementById(naam + 'Page');
    if (doelPagina) doelPagina.classList.remove('verborgen');

    const ingelogdeGebruiker = localStorage.getItem('loggedInUser');
    const beveiligdePaginas = ['dashboard', 'rekeningen', 'overschrijvingen', 'beleggingen', 'crypto'];

    if (beveiligdePaginas.includes(naam) && !ingelogdeGebruiker) {
        toonPagina('login');
        return;
    }

    updateNavigatie(ingelogdeGebruiker, naam);

    if (naam === 'dashboard' && ingelogdeGebruiker) {
        document.getElementById('userName').textContent = ingelogdeGebruiker;
        toonTransacties(transacties);
    }
    if (naam === 'rekeningen') toonRekeningen();
    if (naam === 'overschrijvingen') vulSelects();
    if (naam === 'beleggingen') {
        updateInvesteringenUI('aandeel');
        startLiveUpdates('aandeel');
    }
    if (naam === 'crypto') {
        updateInvesteringenUI('crypto');
        startLiveUpdates('crypto');
    }

    window.scrollTo(0, 0);
}

function updateNavigatie(ingelogdeGebruiker, actievePagina) {
    const navLinks = ['homeLink', 'rekeningenLink', 'overschrijvingenLink', 'beleggingenLink', 'cryptoLink', 'dashboardLink'];

    navLinks.forEach(id => {
        const link = document.getElementById(id);
        if (!link) return;
        link.classList.remove('active');
        if (id === actievePagina + 'Link') link.classList.add('active');
        link.classList.toggle('verborgen', !ingelogdeGebruiker);
    });

    document.getElementById('loginBtn').classList.toggle('verborgen', !!ingelogdeGebruiker);
    document.getElementById('logoutBtn').classList.toggle('verborgen', !ingelogdeGebruiker);
}

function toonRekeningen() {
    const html = rekeningen.map(r => `
        <div class="account-item">
            <span class="account-type">${r.type}</span>
            <span class="account-number">${r.number}</span>
            <span class="account-balance">€${r.balance.toFixed(2)}</span>
        </div>`).join('');
    document.getElementById('accountsList').innerHTML = html;
}

function maakNieuweRekening() {
    const keuze = prompt('Kies een type:\n1. Betaalrekening\n2. Spaarrekening\n3. Zakelijke Rekening');
    if (!keuze || keuze < 1 || keuze > 3) return alert('Ongeldige keuze!');

    const types = ['Betaalrekening', 'Spaarrekening', 'Zakelijke Rekening'];
    rekeningen.push({
        id: rekeningen.length + 1,
        type: types[keuze - 1],
        number: 'NL20 BVDT 0208 1265 ' + (70 + rekeningen.length),
        balance: Math.random() * 5000 + 500
    });
    toonRekeningen();
    vulSelects();
}

function vulSelects() {
    const opties = rekeningen.map(r => `<option value="${r.id}">${r.type} - ${r.number} - €${r.balance.toFixed(2)}</option>`).join('');
    const optiesNaar = rekeningen.map(r => `<option value="${r.id}">${r.type} - ${r.number}</option>`).join('');

    document.getElementById('vanRekening').innerHTML = '<option value="">kies een rekening</option>' + opties;
    document.getElementById('naarRekening').innerHTML = '<option value="">kies een rekening</option>' + optiesNaar;
}

function updateInvesteringenUI(type) {
    const listId = type === 'aandeel' ? 'beleggingen-overzicht' : 'crypto-status-list';
    const dataHouding = type === 'aandeel' ? gebruikerBeleggingen : gebruikerCryptoPortefeuille;
    const prijzen = type === 'aandeel' ? beleggingPrijzen : cryptoPrijzen;
    const vorigePrijzen = type === 'aandeel' ? vorigePrijzenStocks : vorigePrijzenCrypto;
    const eenheid = type === 'aandeel' ? 'stuks' : 'per eenheid';

    const list = document.getElementById(listId);
    list.innerHTML = '';

    for (const item in dataHouding) {
        const aantal = dataHouding[item];
        const waarde = aantal * prijzen[item];
        const div = document.createElement('div');
        div.className = type === 'aandeel' ? 'aandeel-item' : 'crypto-status-item';

        const oudePrijs = vorigePrijzen[item];
        const nieuwePrijs = prijzen[item];

        if (nieuwePrijs > oudePrijs) div.classList.add('prijs-omhoog');
        if (nieuwePrijs < oudePrijs) div.classList.add('prijs-omlaag');

        if (type === 'aandeel') {
            div.textContent = `${item}: ${aantal} stuks (€${waarde.toFixed(2)})`;
        } else {
            div.textContent = `${item}: €${waarde.toFixed(2)} (${nieuwePrijs.toFixed(2)} ${eenheid})`;
        }
        list.appendChild(div);
    }

    if (type === 'aandeel') vorigePrijzenStocks = { ...beleggingPrijzen };
    else vorigePrijzenCrypto = { ...cryptoPrijzen };
}

function startLiveUpdates(type) {
    const prijzenObj = type === 'aandeel' ? beleggingPrijzen : cryptoPrijzen;
    const intervalTime = type === 'aandeel' ? 4000 : 3000;
    const fluctuatieMax = type === 'aandeel' ? 0.02 : 0.05;
    const listId = type === 'aandeel' ? 'beleggingen-overzicht' : 'crypto-status-list';

    setInterval(() => {
        for (const key in prijzenObj) {
            const fluctuatie = 1 + (Math.random() - 0.5) * fluctuatieMax;
            prijzenObj[key] *= fluctuatie;
        }

        const listElement = document.getElementById(listId);
        if (listElement && !listElement.classList.contains('verborgen')) {
            updateInvesteringenUI(type);
        }
    }, intervalTime);
}

function verwerkTransactie(type, actie) {
    const itemId = type === 'aandeel' ? 'aandeel' : 'crypto-select';
    const amountId = type === 'aandeel' ? 'aandeel-amount' : 'crypto-amount';
    const messageElId = type === 'aandeel' ? 'belegging-message' : 'crypto-message';

    const item = document.getElementById(itemId).value;
    const euro = parseFloat(document.getElementById(amountId).value);
    const mainRekening = rekeningen[0];
    const feedbackElement = document.getElementById(messageElId);

    if (isNaN(euro) || euro <= 0) return;

    const prijzen = type === 'aandeel' ? beleggingPrijzen : cryptoPrijzen;
    const portfolio = type === 'aandeel' ? gebruikerBeleggingen : gebruikerCryptoPortefeuille;

    if (actie === 'koop') {
        if (mainRekening.balance < euro) return toonFout(feedbackElement, 'Je hebt onvoldoende saldo!');
        mainRekening.balance -= euro;
        portfolio[item] += euro / prijzen[item];
        feedbackElement.innerHTML = `<img src="https://cdn-icons-png.flaticon.com/512/190/190411.png" alt="Success" class="success-icon"><p>Je hebt €${euro.toFixed(2)} in ${item} geïnvesteerd!</p>`;
    } else {
        const nodig = euro / prijzen[item];
        if (portfolio[item] < nodig) return toonFout(feedbackElement, `Je hebt onvoldoende ${type === 'aandeel' ? 'aandelen' : 'cryptovaluta'} saldo!`);
        portfolio[item] -= nodig;
        mainRekening.balance += euro;
        feedbackElement.innerHTML = `<img src="https://cdn-icons-png.flaticon.com/512/190/190411.png" alt="Success" class="success-icon"><p>Je hebt €${euro.toFixed(2)} ${item} verkocht!</p>`;
    }

    feedbackElement.className = 'feedback success';
    feedbackElement.classList.remove('verborgen');

    updateInvesteringenUI(type);
    toonRekeningen();
}

document.getElementById('loginForm').onsubmit = function (e) {
    e.preventDefault();
    const gebruiker = document.getElementById('username').value;
    const wachtwoord = document.getElementById('password').value;
    const errorEl = document.getElementById('errorMessage');

    if (gebruikers.find(u => u.username === gebruiker && u.password === wachtwoord)) {
        localStorage.setItem('loggedInUser', gebruiker);
        toonPagina('dashboard');
    } else {
        toonFout(errorEl, 'Onjuiste gebruikersnaam of wachtwoord!');
    }
};

document.getElementById('overschrijvingForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const vanId = parseInt(document.getElementById('vanRekening').value);
    const naarId = parseInt(document.getElementById('naarRekening').value);
    const bedrag = parseFloat(document.getElementById('bedrag').value);
    const feedback = document.getElementById('feedbackMessage');

    if (!vanId || !naarId) return toonFout(feedback, 'Selecteer beide rekeningen!');
    if (vanId === naarId) return toonFout(feedback, 'Je kunt niet naar dezelfde rekening overschrijven!');
    if (!bedrag || bedrag <= 0) return toonFout(feedback, 'Voer een geldig bedrag in!');

    const vanRekening = rekeningen.find(r => r.id === vanId);
    const naarRekening = rekeningen.find(r => r.id === naarId);

    if (vanRekening.balance < bedrag) return toonFout(feedback, 'Onvoldoende saldo op de geselecteerde rekening!');

    vanRekening.balance -= bedrag;
    naarRekening.balance += bedrag;

    feedback.innerHTML = `<img src="https://cdn-icons-png.flaticon.com/512/190/190411.png" alt="Success" class="success-icon"><p>€${bedrag.toFixed(2)} is succesvol overgeschreven van ${vanRekening.type} naar ${naarRekening.type}.</p>`;
    feedback.className = 'feedback success';
    feedback.classList.remove('verborgen');

    vulSelects();
    document.getElementById('bedrag').value = '';
});

function toonFout(element, boodschap) {
    element.innerHTML = `<img src="https://cdn-icons-png.flaticon.com/512/753/753345.png" alt="Error" class="error-icon"><p>${boodschap}</p>`;
    element.className = 'feedback error';
    element.classList.remove('verborgen');
}

function uitloggen() {
    localStorage.removeItem('loggedInUser');
    toonPagina('home');
}

function toonTransacties(lijst) {
    const container = document.getElementById('transaction-list');
    if (lijst.length === 0) {
        return container.innerHTML = `
        <div class="feedback error">
            <img src="https://cdn-icons-png.flaticon.com/512/753/753345.png" alt="Error" class="error-icon">
            <p>Geen transacties gevonden!</p>
        </div>`;
    }

    container.innerHTML = lijst.map(t => {
        const klasse = t.bedrag >= 0 ? 'positief' : 'negatief';
        return `
        <div class="transaction">
            <p style="display: flex; justify-content: space-between; margin-bottom:5px; font-size: 14px; color: #000;">
                <span><strong>Type:</strong> ${t.type}</span><span class="omschrijving">${t.omschrijving}</span>
            </p>
            <p style="margin-bottom: 5px; font-size: 14px; color: #000;"><strong>Datum:</strong> ${t.datum}</p>
            <p style="font-size: 14px; color: #000;"><strong>Bedrag:</strong> <span class="${klasse}">€${t.bedrag.toFixed(2)}</span></p>
        </div>`;
    }).join('');
}

function filterTransacties() {
    const type = document.getElementById('filter-type').value;
    const datumInput = document.getElementById('filter-datum').value;
    let resultaat = transacties;

    if (type !== 'all') resultaat = resultaat.filter(t => t.type === type);

    if (datumInput) {
        const [jaar, maand, dag] = datumInput.split('-');
        resultaat = resultaat.filter(t => t.datum === `${dag}-${maand}-${jaar}`);
    }

    toonTransacties(resultaat);
}

if (localStorage.getItem('loggedInUser')) {
    toonPagina('dashboard');
} else {
    toonPagina('home');
}