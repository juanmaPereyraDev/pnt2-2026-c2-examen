'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaHome, FaHeart, FaRegHeart, FaExternalLinkAlt } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import './airbnblist.css';

const API_BASE_URL = 'https://backendairbnb-befph8eegzabfudb.eastus2-01.azurewebsites.net';
const PAGE_SIZE = 100;

const AirbnbList = () => {
  const { token, loading: authLoading } = useAuth();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [reload, setReload] = useState(0);
  const [favorites, setFavorites] = useState([]);

  
  useEffect(() => {
    const stored = localStorage.getItem('favorites');
    setFavorites(stored ? JSON.parse(stored) : []);
  }, []);


  useEffect(() => {
    if (authLoading) return;

    if (!token) {
      setError('Necesitás iniciar sesión para ver los listados de Airbnb.');
      setLoading(false);
      return;
    }

    const fetchListings = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/listings?pageSize=${PAGE_SIZE}&page=${page}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!response.ok) {
          throw new Error('No se pudo obtener el listado de Airbnb');
        }

        const data = await response.json();
        setListings(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [token, authLoading, page, reload]);

  
  const toggleFavorite = (listingId) => {
    const updated = favorites.includes(listingId)
      ? favorites.filter((id) => id !== listingId)
      : [...favorites, listingId];

    setFavorites(updated);
    localStorage.setItem('favorites', JSON.stringify(updated));
  };

  if (authLoading || loading) {
    return (
      <div className="airbnb-page">
        <div className="airbnb-container">
          <div className="loading-container">
            <div className="loading-spinner" />
            <p className="loading-text">Cargando listados de Airbnb...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="airbnb-page">
        <div className="airbnb-container">
          <div className="error-container">
            <p className="error-message">{error}</p>
            <button
              type="button"
              className="retry-button"
              onClick={() => setReload(reload + 1)}
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="airbnb-page">
      <div className="airbnb-container">
        <div className="airbnb-header">
          <h1 className="airbnb-title">Listados de Airbnb</h1>
          <p className="airbnb-subtitle">
            Página {page} · {listings.length} propiedades
          </p>
        </div>

        <div className="airbnb-grid">
          {listings.map((listing) => (
            <div key={listing._id} className="airbnb-card">
              <div className="airbnb-image-container">
                {listing.images?.picture_url ? (
                  <img
                    src={listing.images.picture_url}
                    alt={listing.name || 'Propiedad de Airbnb'}
                    className="airbnb-image"
                  />
                ) : (
                  <div className="airbnb-image-placeholder">
                    <FaHome />
                  </div>
                )}

                <button
                  type="button"
                  className="favorite-button"
                  onClick={() => toggleFavorite(listing._id)}
                  aria-label={
                    favorites.includes(listing._id)
                      ? 'Quitar de favoritos'
                      : 'Agregar a favoritos'
                  }
                >
                  {favorites.includes(listing._id) ? (
                    <FaHeart className="favorite-icon favorited" />
                  ) : (
                    <FaRegHeart className="favorite-icon not-favorited" />
                  )}
                </button>
              </div>

              <div className="airbnb-content">
                <h2 className="airbnb-name">
                  <Link href={`/airbnb/${listing._id}`}>
                    {listing.name || 'Sin nombre'}
                  </Link>
                </h2>

                <p className="airbnb-summary">
                  {listing.summary || 'Esta propiedad no tiene descripción.'}
                </p>

                <a
                  href={listing.listing_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="airbnb-url"
                >
                  Ver en Airbnb
                  <FaExternalLinkAlt className="airbnb-url-icon" />
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="pagination">
          <button
            type="button"
            className="pagination-button"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Anterior
          </button>

          <span className="pagination-info">Página {page}</span>

          <button
            type="button"
            className="pagination-button"
            disabled={listings.length < PAGE_SIZE}
            onClick={() => setPage(page + 1)}
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
};

export default AirbnbList;
