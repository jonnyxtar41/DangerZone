import React, { Suspense, lazy, useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { LayoutProvider } from '@/context/LayoutContext.jsx';
import { AdProvider } from '@/context/AdContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { DownloadModalProvider } from '@/context/DownloadModalContext';
import { TooltipProvider } from '@/components/ui/tooltip';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { getAllSiteContent } from '@/lib/supabase/siteContent';
import { getSections } from '@/lib/supabase/sections';
import { Helmet } from 'react-helmet';
import LoadingSpinner from '@/components/LoadingSpinner';
import Home from '@/pages/Home';
import CookieConsent from '@/components/CookieConsent';
import PushNotificationManager from '@/components/PushNotificationManager';

const Recursos = lazy(() => import('@/pages/Recursos'));
const Post = lazy(() => import('@/pages/Post'));
const Admin = lazy(() => import('@/pages/Admin'));
const EditPost = lazy(() => import('@/pages/EditPost'));
const Login = lazy(() => import('@/pages/Login'));
const RequestPasswordReset = lazy(() => import('@/pages/RequestPasswordReset'));
const UpdatePassword = lazy(() => import('@/pages/UpdatePassword'));
const InterstitialAd = lazy(() => import('@/components/InterstitialAd'));
const DownloadModal = lazy(() => import('@/components/DownloadModal'));
const Suggestions = lazy(() => import('@/pages/Suggestions'));
const Policies = lazy(() => import('@/pages/Policies'));
const Donate = lazy(() => import('@/pages/Donate'));

const LoadingFallback = () => (
  <div className="w-full h-screen flex items-center justify-center bg-background">
    <LoadingSpinner className="text-primary" />
  </div>
);

const privateLoginPath = '/control-panel-7d8a2b3c4f5e';
const privateAdminPath = `${privateLoginPath}/dashboard`;

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingFallback />;
  }

  return user ? children : <Navigate to={privateLoginPath} />;
};

function App() {
  const [sections, setSections] = useState([]);
  const [siteContent, setSiteContent] = useState({});
  const [faviconKey, setFaviconKey] = useState(Date.now());
  

  const fetchInitialData = async () => {
    const sectionsData = await getSections();
    const allContent = await getAllSiteContent();
    const contentMap = allContent.reduce((acc, item) => {
        acc[item.key] = item.value;
        return acc;
    }, {});

    setSections(sectionsData);
    setSiteContent(contentMap);
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleContentUpdate = () => {
    fetchInitialData();
    setFaviconKey(Date.now());
  };

  const faviconUrl = siteContent['site_favicon'] 
    ? `${siteContent['site_favicon'].replace(/^http:/, 'https:')}?v=${faviconKey}` 
    : '/favicon.svg';
    
  return (
    <ThemeProvider>
      <TooltipProvider>
        <LayoutProvider>
          <AdProvider>
            <DownloadModalProvider>
              <Suspense fallback={<LoadingFallback />}>
                <Helmet>
                  <link rel="icon" type="image/svg+xml" href={faviconUrl} />
                </Helmet>
                <InterstitialAd />
                <DownloadModal />
                <Routes>
                  <Route path={privateLoginPath} element={<Login />} />
                  <Route path="/request-password-reset" element={<RequestPasswordReset />} />
                  <Route path="/update-password" element={<UpdatePassword />} />
                  
                  <Route path={`${privateAdminPath}/*`} element={<PrivateRoute><Admin onContentUpdate={handleContentUpdate} /></PrivateRoute>} />
                  <Route path={`${privateLoginPath}/edit/:postSlug`} element={<PrivateRoute><EditPost /></PrivateRoute>} />

                  <Route path="/*" element={
                    <Layout sections={sections} siteContent={siteContent}>
                      <PushNotificationManager frequencyDays={siteContent.notification_prompt_frequency_days} />
                      <CookieConsent />
                      <Routes>
                        <Route path="/" element={<Home />} />
                        {sections.map(section => (
                          <Route key={section.id} path={`/${section.slug}/*`}>
                              <Route index element={<Recursos section={section.slug} />} />
                              <Route path=":postSlug" element={<Post section={section.slug} />} />
                          </Route>
                        ))}
                        <Route path="/sugerencias" element={<Suggestions />} />
                        <Route path="/politicas" element={<Policies />} />
                        <Route path="/donar" element={<Donate />} />
                        <Route path="*" element={<Navigate to="/" />} />
                      </Routes>
                    </Layout>
                  } />
                </Routes>
                <Toaster />
              </Suspense>
            </DownloadModalProvider>
          </AdProvider>
        </LayoutProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;