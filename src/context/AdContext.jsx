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
            setAdUrl(url); // Opcional, podrías quitarlo si ya no lo usas
            setIsAdVisible(true);
        }
    };

    const hideAd = () => {
        setIsAdVisible(false);
    };



    const value = {
        isAdVisible,
        adUrl,
        showAd,
        hideAd,
        
    };

    return <AdContext.Provider value={value}>{children}</AdContext.Provider>;
};