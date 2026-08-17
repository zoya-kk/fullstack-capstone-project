import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { urlConfig } from '../../config';
import './SearchPage.css';

function SearchPage() {
    // Task 1: Define state variables
    const [searchQuery, setSearchQuery] = useState('');
    const [ageRange, setAgeRange] = useState(6);
    const [searchResults, setSearchResults] = useState([]);

    const categories = ['Living', 'Bedroom', 'Bathroom', 'Kitchen', 'Office'];
    const conditions = ['New', 'Like New', 'Older'];

    useEffect(() => {
        // Fetch all products
        const fetchProducts = async () => {
            try {
                const url = `${urlConfig.backendUrl}/api/gifts`;
                const response = await fetch(url);

                if (!response.ok) {
                    throw new Error(`HTTP error; ${response.status}`);
                }

                const data = await response.json();
                setSearchResults(data);
            } catch (error) {
                console.log('Fetch error: ' + error.message);
            }
        };

        fetchProducts();
    }, []);

    // Task 2: Fetch search results
    const handleSearch = async () => {
        const baseUrl = `${urlConfig.backendUrl}/api/search?`;

        const queryParams = new URLSearchParams({
            name: searchQuery,
            age_years: ageRange,
            category: document.getElementById('categorySelect').value,
            condition: document.getElementById('conditionSelect').value,
        }).toString();

        try {
            const response = await fetch(`${baseUrl}${queryParams}`);

            if (!response.ok) {
                throw new Error('Search failed');
            }

            const data = await response.json();
            setSearchResults(data);
        } catch (error) {
            console.error('Failed to fetch search results:', error);
        }
    };

    const navigate = useNavigate();

    // Task 6: Navigate to details page
    const goToDetailsPage = (productId) => {
        navigate(`/app/product/${productId}`);
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">

                    <div className="filter-section mb-3 p-3 border rounded">
                        <h5>Filters</h5>

                        <div className="d-flex flex-column">

                            {/* Task 3: Category dropdown */}
                            <label htmlFor="categorySelect">Category</label>
                            <select
                                id="categorySelect"
                                className="form-control my-1 dropdown-filter"
                            >
                                <option value="">All</option>
                                {categories.map(category => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>

                            {/* Task 3: Condition dropdown */}
                            <label htmlFor="conditionSelect">Condition</label>
                            <select
                                id="conditionSelect"
                                className="form-control my-1 dropdown-filter"
                            >
                                <option value="">All</option>
                                {conditions.map(condition => (
                                    <option key={condition} value={condition}>
                                        {condition}
                                    </option>
                                ))}
                            </select>

                            {/* Task 4: Age range slider */}
                            <label htmlFor="ageRange">
                                Less than {ageRange} years
                            </label>

                            <input
                                type="range"
                                className="form-control-range age-range-slider"
                                id="ageRange"
                                min="1"
                                max="10"
                                value={ageRange}
                                onChange={e => setAgeRange(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Task 7: Search input */}
                    <div className="mb-3">
                        <label htmlFor="searchQuery">Search</label>
                        <input
                            id="searchQuery"
                            type="text"
                            className="form-control search-input"
                            placeholder="Search for a gift"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Task 8: Search button */}
                    <button
                        className="btn search-button"
                        onClick={handleSearch}
                    >
                        Search
                    </button>

                    {/* Task 5: Display search results */}
                    <div className="search-results mt-4">
                        {searchResults.length > 0 ? (
                            searchResults.map(product => (
                                <div
                                    key={product.id}
                                    className="card mb-3 search-results-card"
                                >
                                    {product.image ? (
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="card-img-top"
                                        />
                                    ) : (
                                        <div className="card-body">
                                            No Image Available
                                        </div>
                                    )}

                                    <div className="card-body">
                                        <h5 className="card-title">
                                            {product.name}
                                        </h5>

                                        <p className="card-text">
                                            {product.description
                                                ? product.description.slice(0, 100) + '...'
                                                : ''}
                                        </p>
                                    </div>

                                    <div className="card-footer">
                                        <button
                                            onClick={() => goToDetailsPage(product.id)}
                                            className="btn btn-primary"
                                        >
                                            View More
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div
                                className="alert no-products-alert"
                                role="alert"
                            >
                                No products found. Please revise your filters.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SearchPage;