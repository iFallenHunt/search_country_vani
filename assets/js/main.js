$(document).ready(function() {
    // State variables
    let currentPage = 1;
    const itemsPerPage = 12;
    let currentView = 'grid';
    let allCountries = [];
    let currentLanguage = 'pt-BR';
    let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');

    // DOM elements
    const $countriesContainer = $('#countriesContainer');
    const $pagination = $('#pagination');
    const $searchInput = $('#searchInput');
    const $regionFilter = $('#regionFilter');
    const $languageFilter = $('#languageFilter');
    const $continentFilter = $('#continentFilter');
    const $viewToggle = $('#viewToggle');
    const $themeToggle = $('#themeToggle');
    const $languageSelector = $('#languageSelector');

    // Initialize the application
    init();

    async function init() {
        await fetchCountries();
        setupEventListeners();
        updateFilters();
        renderCountries();
        applyTranslations();
    }

    // Fetch countries from API
    async function fetchCountries() {
        try {
            const response = await $.get('https://restcountries.com/v3.1/all');
            allCountries = response;
            return response;
        } catch (error) {
            console.error('Error fetching countries:', error);
            return [];
        }
    }

    // Setup event listeners
    function setupEventListeners() {
        $searchInput.on('input', debounce(filterCountries, 300));
        $regionFilter.on('change', filterCountries);
        $languageFilter.on('change', filterCountries);
        $continentFilter.on('change', filterCountries);
        $viewToggle.on('click', toggleView);
        $themeToggle.on('click', toggleTheme);
        $languageSelector.on('change', changeLanguage);
    }

    // Update filter options
    function updateFilters() {
        const regions = [...new Set(allCountries.map(country => country.region))].sort();
        const languages = [...new Set(allCountries.flatMap(country => 
            country.languages ? Object.values(country.languages) : []
        ))].sort();
        const continents = [...new Set(allCountries.map(country => country.continents?.[0]))].sort();

        populateFilter($regionFilter, regions);
        populateFilter($languageFilter, languages);
        populateFilter($continentFilter, continents);
    }

    // Populate filter dropdowns
    function populateFilter($select, options) {
        const currentValue = $select.val();
        $select.empty().append($('<option>').val('').text(translations[currentLanguage][$select.attr('id').replace('Filter', '')]));
        options.forEach(option => {
            if (option) {
                $select.append($('<option>').val(option).text(option));
            }
        });
        $select.val(currentValue);
    }

    // Filter countries based on search and filters
    function filterCountries() {
        const searchTerm = $searchInput.val().toLowerCase();
        const region = $regionFilter.val();
        const language = $languageFilter.val();
        const continent = $continentFilter.val();

        const filtered = allCountries.filter(country => {
            const matchesSearch = country.name.common.toLowerCase().includes(searchTerm);
            const matchesRegion = !region || country.region === region;
            const matchesLanguage = !language || (country.languages && Object.values(country.languages).includes(language));
            const matchesContinent = !continent || country.continents?.[0] === continent;

            return matchesSearch && matchesRegion && matchesLanguage && matchesContinent;
        });

        renderCountries(filtered);
    }

    // Render countries to the DOM
    function renderCountries(countries = allCountries) {
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const paginatedCountries = countries.slice(start, end);

        $countriesContainer.empty();
        if (currentView === 'list') {
            $countriesContainer.addClass('list-view');
        } else {
            $countriesContainer.removeClass('list-view');
        }

        paginatedCountries.forEach(country => {
            const card = createCountryCard(country);
            $countriesContainer.append(card);
        });

        renderPagination(Math.ceil(countries.length / itemsPerPage));
    }

    // Create country card HTML
    function createCountryCard(country) {
        const isFavorite = favorites.includes(country.cca3);
        const languagesList = country.languages ? Object.values(country.languages).join(', ') : '-';
        
        return $('<div>').addClass('col-12 col-md-6 col-lg-4 col-xl-3')
            .append($('<div>').addClass('country-card position-relative')
                .append(
                    $('<img>').attr('src', country.flags.png).attr('alt', `${country.name.common} flag`),
                    $('<button>').addClass(`favorite-btn ${isFavorite ? 'active' : ''}`)
                        .html('<i class="fas fa-heart"></i>')
                        .on('click', () => toggleFavorite(country)),
                    $('<div>').addClass('p-3')
                        .append(
                            $('<h5>').addClass('mb-2').text(country.name.common),
                            $('<p>').addClass('mb-1').html(`<strong>${translations[currentLanguage].capital}:</strong> ${country.capital || '-'}`),
                            $('<p>').addClass('mb-1').html(`<strong>${translations[currentLanguage].region}:</strong> ${country.region}`),
                            $('<p>').addClass('mb-1').html(`<strong>${translations[currentLanguage].languages}:</strong> ${languagesList}`)
                        )
                )
            );
    }

    // Render pagination
    function renderPagination(totalPages) {
        $pagination.empty();
        
        if (totalPages <= 1) return;

        const items = [];
        items.push(createPaginationItem('«', 1, currentPage === 1));
        items.push(createPaginationItem('‹', currentPage - 1, currentPage === 1));

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
                items.push(createPaginationItem(i, i, false, i === currentPage));
            } else if (items[items.length - 1].text !== '...') {
                items.push(createPaginationItem('...', null, true));
            }
        }

        items.push(createPaginationItem('›', currentPage + 1, currentPage === totalPages));
        items.push(createPaginationItem('»', totalPages, currentPage === totalPages));

        items.forEach(item => {
            $pagination.append(item.element);
        });
    }

    // Create pagination item
    function createPaginationItem(text, page, disabled, active = false) {
        const $item = $('<li>').addClass(`page-item ${disabled ? 'disabled' : ''} ${active ? 'active' : ''}`);
        const $link = $('<a>').addClass('page-link').html(text);

        if (page) {
            $link.on('click', (e) => {
                e.preventDefault();
                if (!disabled) {
                    currentPage = page;
                    filterCountries();
                }
            });
        }

        return {
            text,
            element: $item.append($link)
        };
    }

    // Toggle view between grid and list
    function toggleView() {
        currentView = currentView === 'grid' ? 'list' : 'grid';
        $viewToggle.find('i').toggleClass('fa-th-large fa-list');
        renderCountries();
    }

    // Toggle theme between light and dark
    function toggleTheme() {
        $('body').toggleClass('dark-mode');
        const isDark = $('body').hasClass('dark-mode');
        $themeToggle.find('i').toggleClass('fa-moon fa-sun');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }

    // Toggle favorite status
    function toggleFavorite(country) {
        const index = favorites.indexOf(country.cca3);
        if (index === -1) {
            favorites.push(country.cca3);
        } else {
            favorites.splice(index, 1);
        }
        localStorage.setItem('favorites', JSON.stringify(favorites));
        renderCountries();
    }

    // Change language
    function changeLanguage() {
        currentLanguage = $languageSelector.val();
        localStorage.setItem('language', currentLanguage);
        applyTranslations();
        updateFilters();
    }

    // Apply translations
    function applyTranslations() {
        $searchInput.attr('placeholder', translations[currentLanguage].search);
        // Update other translations as needed
    }

    // Debounce function for search input
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Load saved preferences
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        $('body').addClass('dark-mode');
        $themeToggle.find('i').toggleClass('fa-moon fa-sun');
    }

    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
        currentLanguage = savedLanguage;
        $languageSelector.val(savedLanguage);
    }
}); 