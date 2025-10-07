import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAd } from '@/context/AdContext';

const AdLink = ({ to, children, className, ...props }) => {
    const { showAd } = useAd();
    const navigate = useNavigate();

    const handleClick = (e) => {
        // showAd returns true if an ad will be shown, false otherwise
        if (showAd(to)) {
            e.preventDefault(); // Prevent navigation only if an ad is shown
        }
    };

    return (
        <Link to={to} onClick={handleClick} className={className} {...props}>
            {children}
        </Link>
    );
};

export default AdLink;