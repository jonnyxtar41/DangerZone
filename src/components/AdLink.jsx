import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAd } from '@/context/AdContext';

const AdLink = ({ to, children, className, ...props }) => {
    const { showAd } = useAd();
    const navigate = useNavigate();

    const handleClick = (e) => {
        showAd(to);
    };

    return (
        <Link to={to} onClick={handleClick} className={className} {...props}>
            {children}
        </Link>
    );
};

export default AdLink;