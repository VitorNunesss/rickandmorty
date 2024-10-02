const characterGrid = document.getElementById('characterGrid');
const searchInput = document.getElementById('searchInput');
const favoriteFilterButton = document.getElementById('favoriteFilter');
const speciesFilter = document.getElementById('speciesFilter');
const statusFilter = document.getElementById('statusFilter');

let currentPage = 1;   
let isLoading = false;  
let favorites = JSON.parse(localStorage.getItem('favorites')) || []; 
let showFavoritesOnly = false;

function saveFavorites() {
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

function toggleFavorite(id) {
    const index = favorites.indexOf(id); 
    if (index > -1) {
        favorites.splice(index, 1); 
    } else {
        favorites.push(id); 
    }
    saveFavorites(); 
    renderCharacters(); 
}

function translateSpecies(species) {
    const speciesTranslation = {
        "Human": "Humano",
        "Alien": "Alienígena",
        // Adicione mais traduções de espécies conforme necessário
    };
    return speciesTranslation[species] || species; // Retorna a tradução ou a espécie original
}

function translateStatus(status) {
    const statusTranslation = {
        "Alive": "Vivo",
        "Dead": "Morto",
        "unknown": "Desconhecido"
    };
    return statusTranslation[status] || status; // Retorna a tradução ou o status original
}

function createCharacterCard(character) {
    const characterCard = document.createElement('div'); 
    characterCard.classList.add('character-card'); 

    const favoriteClass = favorites.includes(character.id) ? 'favorited' : '';

    characterCard.innerHTML = `
        <img src="${character.image}" alt="${character.name}">
        <h3>${character.name}</h3>
        <span class="favorite ${favoriteClass}" data-id="${character.id}">★</span>
        <div class="character-details">
            <p>Status: ${translateStatus(character.status)}</p>
            <p>Espécie: ${translateSpecies(character.species)}</p>
        </div>
    `;

    characterCard.querySelector('.favorite').onclick = () => toggleFavorite(character.id);
    
    characterGrid.appendChild(characterCard); 
}

function fetchCharacterById(id) {
    return fetch(`https://rickandmortyapi.com/api/character/${id}`)
        .then(response => response.json())
        .catch(error => {
            console.log('Erro ao buscar personagem:', error);
        });
}

function fetchCharacters(page) {
    if (isLoading) return; 
    isLoading = true; 

    fetch(`https://rickandmortyapi.com/api/character/?page=${page}`)
        .then(response => response.json())
        .then(data => {
            data.results.forEach(createCharacterCard); 
            isLoading = false;  
        })
        .catch(error => {
            console.log(error); 
            isLoading = false; 
        });
}

function fetchSearchedCharacters(query) {
    fetch(`https://rickandmortyapi.com/api/character/?name=${query}`)
        .then(response => response.json())
        .then(data => {
            characterGrid.innerHTML = ''; 
            data.results.forEach(createCharacterCard); 
        })
        .catch(error => {
            console.log('Nenhum personagem encontrado', error); 
            characterGrid.innerHTML = '<p>Nenhum personagem encontrado</p>';
        });
}

async function renderFilteredCharacters() {
    characterGrid.innerHTML = ''; 
    const filteredFavorites = await Promise.all(favorites.map(fetchCharacterById));

    // Renderiza os favoritos
    filteredFavorites.forEach(character => {
        createCharacterCard(character);
    });
}

function renderCharacters() {
    characterGrid.innerHTML = ''; 
    if (showFavoritesOnly) {
        renderFilteredCharacters(); // Renderiza apenas favoritos
    } else {
        fetchCharacters(currentPage); // Renderiza todos os personagens
    }
}

// Pesquisa
searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim(); 
    characterGrid.innerHTML = ''; 
    query.length ? fetchSearchedCharacters(query) : renderCharacters(); 
});

// Botão de filtro de favoritos
favoriteFilterButton.addEventListener('click', () => {
    showFavoritesOnly = !showFavoritesOnly; // Alterna entre mostrar favoritos e todos
    favoriteFilterButton.textContent = showFavoritesOnly ? 'Mostrar Todos' : 'Mostrar Favoritos';
    renderCharacters();
});

// Filtros de espécies e status
speciesFilter.addEventListener('change', () => {
    renderCharacters();
});

statusFilter.addEventListener('change', () => {
    renderCharacters();
});

// Rolagem infinita
window.addEventListener('scroll', () => {
    if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 100 && !isLoading) {
        currentPage++; 
        fetchCharacters(currentPage); 
    }
});

// Inicializa a exibição de personagens
renderCharacters();
