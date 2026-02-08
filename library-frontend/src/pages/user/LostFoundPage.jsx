import React, { useState, useEffect } from 'react';
import lostFoundService from '../../services/lostFoundService';
import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaCalendarAlt, FaTag, FaSearch, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import config from '../../config';

const LostFoundPage = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadItems();
    }, []);

    const loadItems = async () => {
        try {
            const data = await lostFoundService.getFoundItems();
            setItems(data);
        } catch (error) {
            console.error("Error loading lost items:", error);
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        const cleanPath = url.startsWith('/') ? url.substring(1) : url;
        const baseUrl = config.API_BASE_URL.endsWith('/') ? config.API_BASE_URL : `${config.API_BASE_URL}/`;
        return `${baseUrl}${cleanPath}`;
    };

    return (
        <div style={styles.container}>
            <div style={styles.overlay}></div>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                style={styles.header}
            >
                <div style={styles.backButtonWrapper}>
                    <button
                        onClick={() => navigate('/dashboard')}
                        style={styles.backButton}
                    >
                        <FaArrowLeft /> Back
                    </button>
                </div>
                <h1 style={styles.title}>Lost & Found Gallery</h1>
                <p style={styles.subtitle}>
                    Browse items found in the library. If you recognize something, please visit the administration desk.
                </p>
            </motion.div>

            {loading ? (
                <div style={styles.loader}>Loading gallery...</div>
            ) : items.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={styles.emptyState}
                >
                    <FaSearch size={50} color="#666" />
                    <p>No lost items reported currently.</p>
                </motion.div>
            ) : (
                <motion.div
                    initial="hidden"
                    animate="show"
                    variants={{
                        hidden: { opacity: 0 },
                        show: {
                            opacity: 1,
                            transition: {
                                staggerChildren: 0.1
                            }
                        }
                    }}
                    style={styles.grid}
                >
                    {items.map(item => (
                        <motion.div
                            key={item.id}
                            variants={{
                                hidden: { opacity: 0, y: 20 },
                                show: { opacity: 1, y: 0 }
                            }}
                            whileHover={{ y: -5, boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                            style={styles.card}
                        >
                            <div style={styles.imageContainer}>
                                {item.imageUrl ? (
                                    <img
                                        src={getImageUrl(item.imageUrl)}
                                        alt={item.title}
                                        style={styles.image}
                                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/300x200?text=No+Image'; }}
                                    />
                                ) : (
                                    <div style={styles.placeholderImage}>
                                        <FaTag size={40} color="#555" />
                                        <span>No Image</span>
                                    </div>
                                )}
                                <div style={styles.statusBadge}>
                                    {item.status || 'Found'}
                                </div>
                            </div>

                            <div style={styles.cardContent}>
                                <h3 style={styles.cardTitle}>{item.title}</h3>
                                <p style={styles.description}>{item.description}</p>

                                <div style={styles.metaInfo}>
                                    <div style={styles.metaItem}>
                                        <FaMapMarkerAlt color="#da4453" />
                                        <span>{item.foundLocation}</span>
                                    </div>
                                    <div style={styles.metaItem}>
                                        <FaCalendarAlt color="#f6bb42" />
                                        <span>{new Date(item.dateFound).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </div>
    );
};

const styles = {
    container: {
        minHeight: '100vh',
        padding: '40px 20px',
        backgroundColor: '#121212',
        color: '#e0e0e0',
        fontFamily: "'Inter', sans-serif",
        position: 'relative',
        overflow: 'hidden',
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '400px',
        background: 'radial-gradient(circle at 50% 0%, rgba(68, 85, 255, 0.1), transparent 70%)',
        zIndex: 0,
        pointerEvents: 'none',
    },
    header: {
        textAlign: 'center',
        marginBottom: '50px',
        position: 'relative',
        zIndex: 1,
    },
    backButtonWrapper: {
        position: 'absolute',
        left: '20px',
        top: '20px',
    },
    backButton: {
        background: 'rgba(255, 255, 255, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        color: '#e0e0e0',
        padding: '8px 16px',
        borderRadius: '20px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '0.9rem',
        transition: 'background 0.3s',
    },
    title: {
        fontSize: '3rem',
        fontWeight: '700',
        background: 'linear-gradient(135deg, #fff 0%, #a5a5a5 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: '15px',
        letterSpacing: '-1px',
    },
    subtitle: {
        fontSize: '1.1rem',
        color: '#888',
        maxWidth: '600px',
        margin: '0 auto',
        lineHeight: '1.6',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '30px',
        maxWidth: '1200px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 1,
    },
    card: {
        backgroundColor: 'rgba(30, 30, 30, 0.6)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
    },
    imageContainer: {
        height: '220px',
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#1a1a1a',
    },
    image: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        transition: 'transform 0.5s ease',
    },
    placeholderImage: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#444',
        gap: '10px',
    },
    statusBadge: {
        position: 'absolute',
        top: '15px',
        right: '15px',
        padding: '6px 12px',
        backgroundColor: 'rgba(46, 204, 113, 0.2)',
        color: '#2ecc71',
        border: '1px solid rgba(46, 204, 113, 0.3)',
        borderRadius: '20px',
        fontSize: '0.8rem',
        fontWeight: '600',
        backdropFilter: 'blur(4px)',
    },
    cardContent: {
        padding: '20px',
    },
    cardTitle: {
        fontSize: '1.25rem',
        marginBottom: '10px',
        color: '#fff',
        fontWeight: '600',
    },
    description: {
        color: '#aaa',
        fontSize: '0.95rem',
        marginBottom: '20px',
        lineHeight: '1.5',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
    },
    metaInfo: {
        display: 'flex',
        justifyContent: 'space-between',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        paddingTop: '15px',
    },
    metaItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '0.85rem',
        color: '#888',
    },
    loader: {
        textAlign: 'center',
        padding: '50px',
        color: '#666',
        fontSize: '1.2rem',
    },
    emptyState: {
        textAlign: 'center',
        padding: '60px',
        color: '#666',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
    },
};

export default LostFoundPage;
