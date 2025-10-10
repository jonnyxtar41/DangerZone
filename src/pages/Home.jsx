
    import React, { Suspense, lazy, useState, useEffect } from 'react';
    import { Helmet } from 'react-helmet-async';
    import Hero from '@/components/Hero';
    import { getCategories } from '@/lib/supabase/categories';
    import { getRandomPosts, getRandomPostsWithImages, getDownloadablePosts } from '@/lib/supabase/posts';
    import LoadingSpinner from '@/components/LoadingSpinner';

    const Features = lazy(() => import('@/components/Features'));
    const Blog = lazy(() => import('@/components/Blog'));
    const RecentPosts = lazy(() => import('@/components/RecentPosts'));
    const Downloads = lazy(() => import('@/components/Downloads'));
    const AdBlock = lazy(() => import('@/components/AdBlock'));

    const LoadingSection = () => (
      <div className="w-full py-20 flex items-center justify-center bg-background/50">
        <LoadingSpinner className="text-primary" />
      </div>
    );

    const Home = () => {
      const [homeData, setHomeData] = useState({
        categories: [],
        blogPosts: [],
        recentPosts: [],
        downloadablePosts: [], // AÑADIDO: Nuevo estado para posts descargables
        loading: true,
      });


      useEffect(() => {
        const fetchHomeData = async () => {
          try {
            // Añade la llamada a la API
            const [categoriesData, blogPostsData, recentPostsData, downloadablePostsData] = await Promise.all([
              getCategories(),
              getRandomPostsWithImages(3),
              getRandomPosts(3),
              getDownloadablePosts(6), 
            ]);

            const shuffleArray = (array) => {
              let currentIndex = array.length, randomIndex;
              while (currentIndex !== 0) {
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex--;
                [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
              }
              return array;
            };

            const shuffledCategories = shuffleArray([...categoriesData]);

            setHomeData({
              categories: shuffledCategories.slice(0, 6),
              blogPosts: blogPostsData,
              recentPosts: recentPostsData,
              downloadablePosts: downloadablePostsData, 
              loading: false,
            });
          } catch (error) {
            console.error("Error fetching home page data:", error);
            setHomeData(prev => ({ ...prev, loading: false }));
          }
        };

        fetchHomeData();
      }, []);

      return (
        <>
          <Helmet>
            <title>Zona Vortex - Tu universo de conocimiento y curiosidad</title>
            <meta name="description" content="Explora un portal de recursos, artículos y reseñas sobre tecnología, desarrollo personal, aprendizaje de inglés y mucho más." />
            <meta property="og:title" content="Zona Vortex - Tu universo de conocimiento y curiosidad" />
            <meta property="og:description" content="Explora un portal de recursos, artículos y reseñas sobre tecnología, desarrollo personal, aprendizaje de inglés y mucho más." />
          </Helmet>
          
          <Hero />
          <Suspense fallback={<LoadingSection />}>
            <Features categories={homeData.categories} />
          </Suspense>
          <Suspense fallback={<LoadingSection />}>
            <Blog randomPosts={homeData.blogPosts} />
          </Suspense>
          <Suspense fallback={<LoadingSection />}>
            <AdBlock className="container mx-auto" />
          </Suspense>


          <Suspense fallback={<LoadingSection />}>
            <RecentPosts posts={homeData.recentPosts} />
          </Suspense>
          <Suspense fallback={<LoadingSection />}>
            <Downloads posts={homeData.downloadablePosts} />
          </Suspense>
        </>
      );
    };

    export default Home;
  