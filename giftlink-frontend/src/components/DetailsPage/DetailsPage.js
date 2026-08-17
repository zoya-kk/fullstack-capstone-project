import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { urlConfig } from '../../config';

function DetailsPage() {
    const [gift, setGift] = useState(null);
    const [comments, setComments] = useState([]);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { productId } = useParams();

    useEffect(() => {
        const token = sessionStorage.getItem('token');

        if (!token) {
            navigate('/app/login');
            return;
        }

        window.scrollTo(0, 0);

        const fetchGift = async () => {
            try {
                const response = await fetch(
                    `${urlConfig.backendUrl}/api/gifts/${productId}`
                );

                if (!response.ok) {
                    throw new Error(`HTTP error; ${response.status}`);
                }

                const data = await response.json();
                setGift(data);
                setComments(data.comments || []);
            } catch (error) {
                console.log('Fetch error: ' + error.message);
                setError('Unable to fetch gift details.');
            }
        };

        fetchGift();
    }, [navigate, productId]);

    const handleBack = () => {
        navigate(-1);
    };

    if (error) {
        return (
            <div className="container mt-5">
                <p>{error}</p>
                <button className="btn btn-primary" onClick={handleBack}>
                    Back
                </button>
            </div>
        );
    }

    if (!gift) {
        return (
            <div className="container mt-5">
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className="container mt-5">
            <button className="btn btn-secondary mb-4" onClick={handleBack}>
                Back
            </button>

            <div className="card">
                {gift.image ? (
                    <img
                        src={gift.image}
                        alt={gift.name}
                        className="product-image-large"
                    />
                ) : (
                    <div className="no-image-available-large">
                        No Image Available
                    </div>
                )}

                <div className="card-body">
                    <h2 className="details-title">{gift.name}</h2>

                    <p><strong>Category:</strong> {gift.category}</p>
                    <p><strong>Condition:</strong> {gift.condition}</p>
                    <p><strong>Date Added:</strong> {gift.date_added}</p>
                    <p><strong>Age:</strong> {gift.age_years}</p>
                    <p><strong>Description:</strong> {gift.description}</p>

                    <div className="comments-section">
                        <h4>Comments</h4>

                        {comments.map((comment, index) => (
                            <div key={index}>
                                {comment}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DetailsPage;