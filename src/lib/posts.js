import React from 'react';

const initialPosts = [
    {
      id: 1,
      title: '10 Consejos para Hablar Inglés con Confianza',
      author: 'Jane Doe',
      date: '15 Ago, 2025',
      category: 'Consejos',
      image_description: 'Portada de libro con el título: Habla Inglés con Confianza',
      gradient: 'from-blue-500 to-teal-500',
      excerpt: 'Descubre técnicas probadas para mejorar tu fluidez y perder el miedo a hablar en público.',
      content: '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p><p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p><h2>Subtítulo de Ejemplo</h2><p>Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris.</p>',
      download: null,
      mainImage: null,
      metaTitle: '10 Consejos para Hablar Inglés con Confianza',
      metaDescription: 'Descubre técnicas probadas para mejorar tu fluidez y perder el miedo a hablar en público.',
      slug: '10-consejos-hablar-ingles-confianza'
    },
    {
      id: 2,
      title: 'Los Errores Más Comunes al Aprender Gramática',
      author: 'John Smith',
      date: '10 Ago, 2025',
      category: 'Gramática',
      image_description: 'Portada de libro de gramática inglesa con errores comunes resaltados',
      gradient: 'from-purple-500 to-pink-500',
      excerpt: 'Evita los errores gramaticales más frecuentes que cometen los estudiantes de inglés.',
      content: '<p>Este es el contenido detallado sobre los errores más comunes en gramática. Aprenderás a identificar y corregir errores que muchos estudiantes cometen. ¡Mejora tu escritura y habla con estos consejos!</p>',
      download: null,
      mainImage: null,
      metaTitle: 'Errores Comunes al Aprender Gramática Inglesa',
      metaDescription: 'Evita los errores gramaticales más frecuentes que cometen los estudiantes de inglés.',
      slug: 'errores-comunes-aprender-gramatica'
    },
    {
      id: 3,
      title: 'Cómo Usar Phrasal Verbs Correctamente',
      author: 'Emily White',
      date: '05 Ago, 2025',
      category: 'IELTS',
      image_description: 'Guía ilustrada de phrasal verbs en la portada de un libro',
      gradient: 'from-green-500 to-lime-500',
      excerpt: 'Una guía completa para entender y utilizar los phrasal verbs más importantes en inglés.',
      content: '<p>Los phrasal verbs pueden ser complicados, pero con esta guía, dominarás su uso. Exploraremos los más comunes con ejemplos prácticos y ejercicios para que puedas integrarlos en tu vocabulario diario.</p>',
      download: { type: 'url', url: 'https://example.com/download/phrasal-verbs-guide.pdf' },
      mainImage: null,
      metaTitle: 'Guía Completa de Phrasal Verbs en Inglés',
      metaDescription: 'Una guía completa para entender y utilizar los phrasal verbs más importantes en inglés.',
      slug: 'como-usar-phrasal-verbs-correctamente'
    },
    {
      id: 4,
      title: 'Guía Definitiva de Tiempos Verbales para TOEIC',
      author: 'Carlos Ruiz',
      date: '28 Ago, 2025',
      category: 'TOEIC',
      excerpt: 'Domina todos los tiempos verbales en inglés con esta guía completa y fácil de entender. Incluye ejemplos y ejercicios prácticos.',
      image_description: 'Infografía de los tiempos verbales en inglés',
      gradient: 'from-red-500 to-orange-500',
      content: '<p>Desde el presente simple hasta el futuro perfecto continuo, esta guía desglosa cada tiempo verbal. Con explicaciones claras y muchos ejemplos, los tiempos verbales ya no serán un misterio para ti.</p>',
      download: null,
      mainImage: null,
      metaTitle: 'Guía Definitiva de Tiempos Verbales para TOEIC',
      metaDescription: 'Domina todos los tiempos verbales en inglés con esta guía completa y fácil de entender.',
      slug: 'guia-definitiva-tiempos-verbales-toeic'
    },
    {
      id: 5,
      title: '25 Expresiones Idiomáticas Esenciales para TOEFL',
      author: 'Sofia Chen',
      date: '25 Ago, 2025',
      category: 'TOEFL',
      excerpt: 'Aprende y utiliza 25 expresiones idiomáticas que te harán sonar como un hablante nativo. ¡Sorprende en tu próxima conversación!',
      image_description: 'Ilustraciones coloridas de expresiones idiomáticas',
      gradient: 'from-yellow-500 to-amber-500',
      content: '<p>Sumérgete en la cultura inglesa con estas 25 expresiones idiomáticas. Te explicamos qué significan, cómo y cuándo usarlas para que suenes más natural y fluido.</p>',
      download: null,
      mainImage: null,
      metaTitle: '25 Expresiones Idiomáticas Esenciales para TOEFL',
      metaDescription: 'Aprende y utiliza 25 expresiones idiomáticas que te harán sonar como un hablante nativo.',
      slug: '25-expresiones-idiomaticas-esenciales-toefl'
    },
    {
      id: 6,
      title: 'Análisis de "The Great Gatsby"',
      author: 'David Miller',
      date: '22 Ago, 2025',
      category: 'FICTION',
      excerpt: 'Un profundo análisis literario de la obra maestra de F. Scott Fitzgerald, "The Great Gatsby".',
      image_description: 'Persona en una entrevista de trabajo sonriendo con confianza',
      gradient: 'from-cyan-500 to-blue-500',
      content: '<p>Una entrevista de trabajo en inglés puede ser intimidante, pero con la preparación adecuada, puedes brillar. Aquí tienes todo lo que necesitas saber, desde cómo presentarte hasta cómo responder las preguntas más difíciles.</p>',
      download: { type: 'url', url: 'https://example.com/download/interview-prep.pdf' },
      mainImage: null,
      metaTitle: 'Análisis Literario de "The Great Gatsby"',
      metaDescription: 'Un profundo análisis literario de la obra maestra de F. Scott Fitzgerald, "The Great Gatsby".',
      slug: 'analisis-the-great-gatsby'
    },
];

const POSTS_KEY = 'vortex-posts';

const initializePosts = () => {
    const postsFromStorage = localStorage.getItem(POSTS_KEY);
    if (!postsFromStorage) {
        localStorage.setItem(POSTS_KEY, JSON.stringify(initialPosts));
    }
};

initializePosts();

export const getPosts = () => {
    try {
        const postsFromStorage = localStorage.getItem(POSTS_KEY);
        return postsFromStorage ? JSON.parse(postsFromStorage) : [];
    } catch (error) {
        console.error("Error parsing posts from localStorage", error);
        return [];
    }
};

export const getPostById = (id) => {
    const posts = getPosts();
    return posts.find(p => p.id.toString() === id.toString());
};

export const addPost = (post) => {
    const posts = getPosts();
    const updatedPosts = [post, ...posts];
    localStorage.setItem(POSTS_KEY, JSON.stringify(updatedPosts));
};

export const updatePost = (updatedPost) => {
    const posts = getPosts();
    const postIndex = posts.findIndex(p => p.id === updatedPost.id);
    if (postIndex !== -1) {
        posts[postIndex] = updatedPost;
        localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
    }
};

export const deletePost = (postId) => {
    let posts = getPosts();
    posts = posts.filter(p => p.id !== postId);
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
};