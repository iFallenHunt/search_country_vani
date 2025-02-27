$(document).ready(function() {
    // State variables
    let currentPage = 1;
    const itemsPerPage = 12;
    let currentView = 'grid';
    let allCountries = [];
    let currentLanguage = 'pt-BR';
    let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    let currentSort = 'name'; // Default sort by name

    // DOM elements
    const $countriesContainer = $('#countriesContainer');
    const $pagination = $('#pagination');
    const $searchInput = $('#searchInput');
    const $languageFilter = $('#languageFilter');
    const $continentFilter = $('#continentFilter');
    const $viewToggle = $('#viewToggle');
    const $themeToggle = $('#themeToggle');
    const $languageSelector = $('#languageSelector');
    const $loadingIndicator = $('#loadingIndicator');
    const $favoritesContainer = $('#favoritesContainer');
    const $favoritesButton = $('#favoritesButton');
    const $countriesCount = $('#countriesCount');
    const $clearFilters = $('#clearFilters');

    // Initialize tooltips
    $('[data-bs-toggle="tooltip"]').tooltip();

    // Initialize the application
    init();

    async function init() {
        try {
            console.log('Iniciando aplicação...');
            showLoading();
            const countries = await fetchCountries();
            if (countries && countries.length > 0) {
                console.log(`${countries.length} países carregados com sucesso`);
                setupEventListeners();
                updateFilters();
                renderCountries();
                applyTranslations();
                updateFavoritesButton();
                updateCountriesCount(countries.length);
            } else {
                console.error('Nenhum país foi carregado da API');
                showError('Erro ao carregar países. Por favor, recarregue a página.');
            }
        } catch (error) {
            console.error('Erro na inicialização:', error);
            showError('Erro ao inicializar a aplicação. Por favor, recarregue a página.');
        } finally {
            hideLoading();
        }
    }

    function showLoading() {
        $loadingIndicator.removeClass('d-none');
    }

    function hideLoading() {
        $loadingIndicator.addClass('d-none');
    }

    function showError(message) {
        $countriesContainer.html(`<div class="alert alert-danger">${message}</div>`);
    }

    // Fetch countries from API
    async function fetchCountries() {
        try {
            console.log('Buscando países da API...');
            const response = await $.ajax({
                url: 'https://restcountries.com/v3.1/all',
                method: 'GET',
                timeout: 10000
            });
            
            if (response && Array.isArray(response)) {
                allCountries = response.sort((a, b) => a.name.common.localeCompare(b.name.common));
                console.log('Dados dos países:', allCountries.slice(0, 3));
                return response;
            } else {
                throw new Error('Resposta da API inválida');
            }
        } catch (error) {
            console.error('Erro ao buscar países:', error);
            throw error;
        }
    }

    // Setup event listeners
    function setupEventListeners() {
        $searchInput.on('input', debounce(filterCountries, 300));
        $languageFilter.on('change', filterCountries);
        $continentFilter.on('change', filterCountries);
        $viewToggle.on('click', toggleView);
        $themeToggle.on('click', toggleTheme);
        $languageSelector.on('change', changeLanguage);
        $('#favoritesModal').on('show.bs.modal', renderFavorites);
        $clearFilters.on('click', clearAllFilters);
    }

    // Update favorites button state
    function updateFavoritesButton() {
        const favCount = favorites.length;
        $favoritesButton.attr('title', `${favCount} ${translations[currentLanguage].favorites}`);
        if (favCount > 0) {
            $favoritesButton.addClass('active');
        } else {
            $favoritesButton.removeClass('active');
        }
    }

    // Render favorites in modal
    function renderFavorites() {
        const favoriteCountries = allCountries.filter(country => favorites.includes(country.cca3));
        $favoritesContainer.empty();

        if (favoriteCountries.length === 0) {
            $favoritesContainer.html(`<div class="alert alert-info">${translations[currentLanguage].noResults}</div>`);
            return;
        }

        favoriteCountries.forEach(country => {
            const card = createCountryCard(country);
            $favoritesContainer.append(card);
        });
    }

    // Update filter options
    function updateFilters() {
        const languages = [...new Set(allCountries.flatMap(country => 
            country.languages ? Object.values(country.languages) : []
        ))].sort();
        const continents = [...new Set(allCountries.map(country => country.continents?.[0]))].sort();

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

    // Update countries count
    function updateCountriesCount(filteredCount) {
        const totalCount = allCountries.length;
        const text = filteredCount === totalCount 
            ? translations[currentLanguage].totalCountries.replace('{0}', totalCount)
            : translations[currentLanguage].filteredCountries.replace('{0}', filteredCount);
        $countriesCount.text(text);
    }

    // Filter countries based on search and filters
    function filterCountries() {
        const searchTerm = $searchInput.val().toLowerCase();
        const language = $languageFilter.val();
        const continent = $continentFilter.val();

        // Show/hide clear filters button
        if (searchTerm || language || continent) {
            $clearFilters.removeClass('d-none').attr('title', translations[currentLanguage].clearFilters);
        } else {
            $clearFilters.addClass('d-none');
        }

        const filtered = allCountries.filter(country => {
            const matchesSearch = country.name.common.toLowerCase().includes(searchTerm);
            const matchesLanguage = !language || (country.languages && Object.values(country.languages).includes(language));
            const matchesContinent = !continent || country.continents?.[0] === continent;

            return matchesSearch && matchesLanguage && matchesContinent;
        });

        const sortedFiltered = sortCountries(filtered);
        updateCountriesCount(sortedFiltered.length);
        renderCountries(sortedFiltered);
    }

    // Clear all filters
    function clearAllFilters() {
        $searchInput.val('');
        $languageFilter.val('');
        $continentFilter.val('');
        $clearFilters.addClass('d-none');
        filterCountries();
    }

    // Render countries to the DOM
    function renderCountries(countries = allCountries) {
        console.log('Renderizando países...', countries.length);
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const paginatedCountries = countries.slice(start, end);

        $countriesContainer.empty();
        
        if (paginatedCountries.length === 0) {
            $countriesContainer.html('<div class="alert alert-info">' + translations[currentLanguage].noResults + '</div>');
            return;
        }

        if (currentView === 'list') {
            $countriesContainer.addClass('list-view');
        } else {
            $countriesContainer.removeClass('list-view');
        }

        paginatedCountries.forEach(country => {
            try {
                const card = createCountryCard(country);
                $countriesContainer.append(card);
            } catch (error) {
                console.error('Erro ao criar card do país:', country, error);
            }
        });

        renderPagination(Math.ceil(countries.length / itemsPerPage));
    }

    // Create country card HTML
    function createCountryCard(country) {
        const isFavorite = favorites.includes(country.cca3);
        const languagesList = country.languages ? Object.values(country.languages).join(', ') : '-';
        const population = new Intl.NumberFormat(currentLanguage).format(country.population);
        const area = new Intl.NumberFormat(currentLanguage).format(country.area);
        
        return $('<div>').addClass('col-12 col-md-6 col-lg-4 col-xl-3')
            .append($('<div>').addClass('country-card position-relative')
                .append(
                    $('<img>').attr('src', country.flags.png)
                        .attr('alt', `${country.name.common} flag`)
                        .attr('loading', 'lazy'),
                    $('<button>').addClass(`favorite-btn ${isFavorite ? 'active' : ''}`)
                        .attr('data-bs-toggle', 'tooltip')
                        .attr('title', isFavorite ? translations[currentLanguage].removeFromFavorites : translations[currentLanguage].addToFavorites)
                        .html('<i class="fas fa-heart"></i>')
                        .on('click', () => toggleFavorite(country)),
                    $('<div>').addClass('country-info')
                        .append(
                            $('<h3>').addClass('country-name').text(country.name.common),
                            createDetailRow(translations[currentLanguage].capital, country.capital || '-'),
                            createDetailRow(translations[currentLanguage].population, population),
                            createDetailRow(translations[currentLanguage].languages, languagesList),
                            createDetailRow(translations[currentLanguage].area, `${area} km²`)
                        )
                )
            );
    }

    // Create detail row for country card
    function createDetailRow(label, value) {
        return $('<div>').addClass('country-detail')
            .append(
                $('<span>').addClass('country-detail-label').text(label + ':'),
                $('<span>').addClass('country-detail-value').text(value)
            );
    }

    // Sort countries
    function sortCountries(countries, sortBy = currentSort) {
        switch (sortBy) {
            case 'name':
                return countries.sort((a, b) => a.name.common.localeCompare(b.name.common));
            case 'population':
                return countries.sort((a, b) => b.population - a.population);
            case 'area':
                return countries.sort((a, b) => b.area - a.area);
            default:
                return countries;
        }
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
        updateFavoritesButton();
        renderCountries();
    }

    // Change language
    function changeLanguage() {
        currentLanguage = $languageSelector.val();
        localStorage.setItem('language', currentLanguage);
        applyTranslations();
        updateFilters();
        updateCountriesCount(allCountries.length);
    }

    // Apply translations
    function applyTranslations() {
        $searchInput.attr('placeholder', translations[currentLanguage].search);
        updateCountriesCount(allCountries.length);
        
        // Update tooltips
        $('[data-bs-toggle="tooltip"]').tooltip('dispose').tooltip();
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

    // Initialize tooltips after dynamic content is added
    $countriesContainer.on('mouseover', '[data-bs-toggle="tooltip"]', function() {
        if (!$(this).data('bs-tooltip')) {
            $(this).tooltip();
        }
    });
}); 