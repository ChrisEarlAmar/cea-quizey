import { Fragment, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, useNavigate } from 'react-router-dom';
import { ThemeProvider } from "@/components/theme-provider"
import Layout from './dashboard/layout';

import Router from "@/router";

const RedirectHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const redirect = sessionStorage.getItem('quizey-redirect');
    if (redirect) {
      sessionStorage.removeItem('quizey-redirect');
      const path = redirect.replace(/^\/quizey/, '') || '/';
      navigate(path, { replace: true });
    }
  }, [navigate]);

  return null;
};

createRoot(document.getElementById('root')!).render(
  <Fragment>
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/+$/, '')}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <RedirectHandler />
        <Layout>
          <Router />
        </Layout>
      </ThemeProvider>
    </BrowserRouter>
  </Fragment>,
)