import { Fragment } from 'react'
import { createRoot } from 'react-dom/client'
// import { Button } from "@/components/ui/button"
import { BrowserRouter } from 'react-router-dom';
// import QuizList  from './components/pages/QuizList';
// import QuizEditor  from './components/pages/QuizEditor';
// import QuizPlayer from './components/pages/QuizPlayer';
// import Home from './components/pages/home';
import { ThemeProvider } from "@/components/theme-provider"
// import { BrowserRouter } from 'react-router-dom';
import Layout from './dashboard/layout';

import Router from "@/router";

createRoot(document.getElementById('root')!).render(
  <Fragment>
    <BrowserRouter>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <Layout>
          <Router />
        </Layout>
      </ThemeProvider>
    </BrowserRouter>
  </Fragment>,
)