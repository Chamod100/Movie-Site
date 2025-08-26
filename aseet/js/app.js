const API_KEY = '1c768e4f';
const API_BASE_URL = 'http://www.omdbapi.com/';

const POPULAR_MOVIES = [
    'Inception', 'The Dark Knight', 'Interstellar', 'Pulp Fiction',
    'The Shawshank Redemption', 'Fight Club', 'The Matrix', 'Goodfellas',
    'The Godfather', 'Forrest Gump', 'The Avengers', 'Spider-Man',
    'Iron Man', 'Batman Begins', 'Joker', 'Parasite'
];

let currentMovies = [];
let allMovies = []; 
let currentFilter = 'all';

document.addEventListener('DOMContentLoaded', function() {
    init();
});

function init() {
    showSection('home');
    loadPopularMovies();
    
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(0, 0, 0, 0.95)';
            navbar.style.padding = '0.8rem 5%';
        } else {
            navbar.style.background = 'rgba(0, 0, 0, 0.9)';
            navbar.style.padding = '1rem 5%';
        }
    });
}

async function fetchMovieByTitle(title) {
    try {
        const response = await fetch(`${API_BASE_URL}?apikey=${API_KEY}&t=${encodeURIComponent(title)}`);
        const data = await response.json();
        
        if (data.Response === 'True') {
            return normalizeMovieData(data);
        }
        return null;
    } catch (error) {
        console.error('Error fetching movie:', error);
        return null;
    }
}

async function searchMoviesByKeyword(keyword) {
    try {
        const response = await fetch(`${API_BASE_URL}?apikey=${API_KEY}&s=${encodeURIComponent(keyword)}`);
        const data = await response.json();
        
        if (data.Response === 'True') {
            return data.Search.map(movie => normalizeMovieData(movie));
        }
        return [];
    } catch (error) {
        console.error('Error searching movies:', error);
        return [];
    }
}

async function fetchMovieByIMDbID(imdbId) {
    try {
        const response = await fetch(`${API_BASE_URL}?apikey=${API_KEY}&i=${imdbId}`);
        const data = await response.json();
        
        if (data.Response === 'True') {
            return normalizeMovieData(data);
        }
        return null;
    } catch (error) {
        console.error('Error fetching movie by ID:', error);
        return null;
    }
}

function normalizeMovieData(apiData) {
    const genreMap = {
        'Action': 'action',
        'Comedy': 'comedy', 
        'Drama': 'drama',
        'Horror': 'horror',
        'Sci-Fi': 'sci-fi',
        'Science Fiction': 'sci-fi',
        'Thriller': 'action',
        'Adventure': 'action',
        'Romance': 'drama',
        'Crime': 'action'
    };

    const primaryGenre = apiData.Genre ? apiData.Genre.split(',')[0].trim() : 'drama';
    const normalizedGenre = genreMap[primaryGenre] || 'drama';
    
    const rating = apiData.imdbRating && apiData.imdbRating !== 'N/A' 
        ? parseFloat(apiData.imdbRating) / 2
        : 4.0;

    return {
        id: apiData.imdbID,
        title: apiData.Title,
        genre: normalizedGenre,
        rating: Math.round(rating * 10) / 10,
        year: apiData.Year,
        description: apiData.Plot || 'No description available.',
        poster: apiData.Poster && apiData.Poster !== 'N/A' ? apiData.Poster : getGenreEmoji(normalizedGenre),
        duration: apiData.Runtime || 'N/A',
        director: apiData.Director || 'Unknown',
        cast: apiData.Actors ? apiData.Actors.split(', ') : ['Unknown'],
        imdbId: apiData.imdbID,
        imdbRating: apiData.imdbRating
    };
}

function getGenreEmoji(genre) {
    const emojiMap = {
        'action': '💥',
        'comedy': '😂',
        'drama': '🎭',
        'horror': '👻',
        'sci-fi': '🚀'
    };
    return emojiMap[genre] || '🎬';
}

async function loadPopularMovies() {
    showLoader();
    allMovies = [];
    
    for (const movieTitle of POPULAR_MOVIES.slice(0, 8)) { // Load first 8 movies
        const movie = await fetchMovieByTitle(movieTitle);
        if (movie) {
            allMovies.push(movie);
        }
    }
    
    currentMovies = [...allMovies];
    displayMovies(currentMovies);
    hideLoader();
}

function showLoader() {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.style.display = 'block';
    }
}

function hideLoader() {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.style.display = 'none';
    }
}

function showSection(sectionName) {
    const sections = ['home', 'movies', 'genres', 'about'];
    sections.forEach(section => {
        const element = document.getElementById(section);
        if (element) {
            element.style.display = 'none';
        }
    });

    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
        targetSection.style.display = 'block';
        targetSection.style.animation = 'fadeIn 0.5s ease-in-out';
        
        if (sectionName === 'movies') {
            displayMovies(currentMovies);
        }
    }

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.style.background = 'none';
    });
    
    const activeLink = document.querySelector(`[href="#${sectionName}"]`);
    if (activeLink) {
        activeLink.style.background = 'linear-gradient(45deg, #e50914, #ff6b35)';
    }
}

function displayMovies(movieList) {
    const movieGrid = document.getElementById('movieGrid');
    
    if (!movieGrid) return;
    
    movieGrid.innerHTML = '';
    
    if (movieList.length === 0) {
        movieGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                <h3 style="color: #e50914; margin-bottom: 1rem;">No Movies Found</h3>
                <p style="opacity: 0.7;">Try searching for a different movie or genre.</p>
            </div>
        `;
        return;
    }
    
    movieList.forEach((movie, index) => {
        setTimeout(() => {
            const movieCard = createMovieCard(movie);
            movieGrid.appendChild(movieCard);
        }, index * 100);
    });
}

function createMovieCard(movie) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.onclick = () => showMovieDetails(movie);
    
    const stars = '★'.repeat(Math.floor(movie.rating)) + '☆'.repeat(5 - Math.floor(movie.rating));
    
    const posterContent = movie.poster.startsWith('http') 
        ? `<img src="${movie.poster}" alt="${movie.title}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">`
        : `<div style="font-size: 3rem;">${movie.poster}</div>`;
    
    card.innerHTML = `
        <div class="movie-poster">
            ${posterContent}
            ${!movie.poster.startsWith('http') ? '' : `<div style="font-size: 3rem; display: none; align-items: center; justify-content: center; width: 100%; height: 100%;">🎬</div>`}
            <div class="play-button">▶</div>
        </div>
        <div class="movie-info">
            <div class="movie-title">${movie.title}</div>
            <div class="movie-genre">${movie.genre.toUpperCase()} • ${movie.year}</div>
            <div class="movie-rating">
                <span class="stars">${stars}</span>
                <span>${movie.rating}</span>
            </div>
            <div class="movie-description">${movie.description}</div>
        </div>
    `;
    
    card.style.opacity = '0';
    card.style.transform = 'translateY(50px)';
    card.style.animation = 'fadeInUp 0.6s ease-out forwards';
    
    return card;
}

function filterMovies(genre) {
    document.querySelectorAll('.genre-tag').forEach(tag => {
        tag.classList.remove('active');
    });
    
    const genreTags = document.querySelectorAll('.genre-tag');
    genreTags.forEach(tag => {
        if (tag.textContent.toLowerCase() === genre || (genre === 'all' && tag.textContent === 'All')) {
            tag.classList.add('active');
        }
    });
    
    if (genre === 'all') {
        currentMovies = [...allMovies];
    } else {
        currentMovies = allMovies.filter(movie => movie.genre === genre);
    }
    
    displayMovies(currentMovies);
    showSection('movies');
}

async function searchMovies(event) {
    const searchTerm = event.target.value.toLowerCase().trim();
    
    if (event.key === 'Enter' && searchTerm.length > 0) {
        showLoader();
        showSection('movies');
        
        try {
            const exactMatch = await fetchMovieByTitle(searchTerm);
            if (exactMatch) {
                currentMovies = [exactMatch];
                displayMovies(currentMovies);
                hideLoader();
                return;
            }
            
            const searchResults = await searchMoviesByKeyword(searchTerm);
            
            const detailedResults = [];
            for (const movie of searchResults.slice(0, 8)) {
                const detailedMovie = await fetchMovieByIMDbID(movie.id);
                if (detailedMovie) {
                    detailedResults.push(detailedMovie);
                }
            }
            
            currentMovies = detailedResults;
            displayMovies(currentMovies);
            
        } catch (error) {
            console.error('Search error:', error);
            currentMovies = [];
            displayMovies(currentMovies);
        }
        
        hideLoader();
    } else if (searchTerm.length === 0) {
        currentMovies = [...allMovies];
        displayMovies(currentMovies);
    }
}

function showMovieDetails(movie) {
    const modal = document.getElementById('movieModal');
    const modalContent = document.getElementById('modalContent');
    
    if (!modal || !modalContent) return;
    
    const stars = '★'.repeat(Math.floor(movie.rating)) + '☆'.repeat(5 - Math.floor(movie.rating));
    
    const posterDisplay = movie.poster.startsWith('http') 
        ? `<img src="${movie.poster}" alt="${movie.title}" style="max-width: 200px; max-height: 300px; object-fit: cover; border-radius: 10px;" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">`
        : `<div style="font-size: 5rem;">${movie.poster}</div>`;
    
    modalContent.innerHTML = `
        <div style="text-align: center;">
            ${posterDisplay}
            ${movie.poster.startsWith('http') ? `<div style="font-size: 5rem; display: none;">🎬</div>` : ''}
            
            <h2 style="color: #e50914; margin: 1rem 0; font-size: 2.5rem;">${movie.title}</h2>
            
            <div style="display: flex; justify-content: center; gap: 2rem; margin-bottom: 2rem; flex-wrap: wrap;">
                <div style="background: #e50914; padding: 0.5rem 1rem; border-radius: 15px; font-size: 0.9rem;">
                    ${movie.genre.toUpperCase()}
                </div>
                <div style="background: rgba(255,255,255,0.1); padding: 0.5rem 1rem; border-radius: 15px; font-size: 0.9rem;">
                    ${movie.year}
                </div>
                <div style="background: rgba(255,255,255,0.1); padding: 0.5rem 1rem; border-radius: 15px; font-size: 0.9rem;">
                    ${movie.duration}
                </div>
            </div>
            
            <div style="margin-bottom: 1.5rem;">
                <span style="color: #ffd700; font-size: 1.2rem;">${stars}</span>
                <span style="margin-left: 0.5rem; font-size: 1.1rem; color: #fff;">${movie.rating}/5</span>
                ${movie.imdbRating ? `<span style="margin-left: 1rem; font-size: 0.9rem; opacity: 0.7;">IMDb: ${movie.imdbRating}/10</span>` : ''}
            </div>
            
            <p style="font-size: 1.1rem; line-height: 1.6; margin-bottom: 2rem; opacity: 0.9;">
                ${movie.description}
            </p>
            
            <div style="text-align: left; max-width: 500px; margin: 0 auto;">
                <div style="margin-bottom: 1rem;">
                    <strong style="color: #e50914;">Director:</strong> 
                    <span style="opacity: 0.9;">${movie.director}</span>
                </div>
                <div style="margin-bottom: 2rem;">
                    <strong style="color: #e50914;">Cast:</strong> 
                    <span style="opacity: 0.9;">${movie.cast.join(', ')}</span>
                </div>
            </div>
            
            ${movie.imdbId ? `
            <div style="margin-top: 2rem;">
                <a href="https://www.imdb.com/title/${movie.imdbId}" target="_blank" 
                   style="display: inline-block; padding: 1rem 2rem; background: linear-gradient(45deg, #e50914, #ff6b35); 
                          color: white; text-decoration: none; border-radius: 50px; font-weight: bold; 
                          transition: all 0.3s ease;">
                    View on IMDb
                </a>
            </div>` : ''}
        </div>
    `;
    
    modal.style.display = 'flex';
    modal.style.animation = 'fadeIn 0.3s ease-out';
}

function closeModal() {
    const modal = document.getElementById('movieModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

document.addEventListener('click', function(event) {
    const modal = document.getElementById('movieModal');
    if (event.target === modal) {
        closeModal();
    }
});

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeModal();
    }
});
            