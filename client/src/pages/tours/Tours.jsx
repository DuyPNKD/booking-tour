import React, {useState, useEffect} from "react";
import {useSearchParams} from "react-router-dom";
import axios from "axios";
import TourCategory from "../../components/tourCategory/TourCategory";
import "./Tours.css";

const Tours = () => {
    const [searchParams] = useSearchParams();
    const [tours, setTours] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTours = async () => {
            try {
                const response = await axios.get("http://localhost:5000/api/tours");
                setTours(response.data);
                setLoading(false);
            } catch (err) {
                setError("Failed to fetch tours");
                setLoading(false);
            }
        };

        fetchTours();
    }, []);

    const filterTours = (tours, category) => {
        return tours.filter((tour) => tour.category === category);
    };

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="tours-page">
            <div className="tours-header">
                <h1>Our Tours</h1>
                <p>Discover amazing destinations and experiences</p>
            </div>

            <div className="tours-content">
                <TourCategory title="Popular Tours" tours={filterTours(tours, "popular")} />
                <TourCategory title="Adventure Tours" tours={filterTours(tours, "adventure")} />
                <TourCategory title="Cultural Tours" tours={filterTours(tours, "cultural")} />
            </div>
        </div>
    );
};

export default Tours;
