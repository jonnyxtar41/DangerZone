import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdsConfig } from '@/lib/ads';

const AdContext = createContext();

export const useAd = () => useContext(AdContext);

export const AdProvider = ({ children }) => {
    const [isAdVisible, setIsAdVisible] = useState(false);
    const [adUrl, setAdUrl] = useState(null);
    const [adsConfig, setAdsConfig] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const updateConfig = () => setAdsConfig(getAdsConfig());
        updateConfig();

        window.addEventListener('storage', updateConfig);
        return () => {
            window.removeEventListener('storage', updateConfig);
        };
    }, []);

    const showAd = (url) => {
        if (adsConfig?.interstitial?.visible) {
            setAdUrl(url);
            setIsAdVisible(true);
            return true; // Indicates that an ad will be shown
        }
        return false; // Indicates no ad will be shown, proceed with navigation
    };

    const hideAd = () => {
        setIsAdVisible(false);
    };

    const navigateToUrl = () => {
        if (adUrl) {
            navigate(adUrl);
            setAdUrl(null);
        }
    };

    const value = {
        isAdVisible,
        adUrl,
        showAd,
        hideAd,
        navigateToUrl,
    };

    return <AdContext.Provider value={value}>{children}</AdContext.Provider>;
};