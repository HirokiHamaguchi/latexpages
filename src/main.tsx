import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ROUTES } from './constants/routes'
import { Content } from './content'
import { HubPage } from './pages/HubPage'
import { OtherPage } from './pages/OtherPage'
import { ProjectPlaceholderPage } from './pages/ProjectPlaceholderPage'
import { ReadmePage } from './pages/ReadmePage'

const routerBasename = import.meta.env.BASE_URL.replace(/\/$/, '')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ChakraProvider value={defaultSystem}>
      <BrowserRouter basename={routerBasename}>
        <Routes>
          <Route path={ROUTES.HUB} element={<HubPage />} />
          <Route path={ROUTES.LATEXLINT} element={<Content />} />
          <Route path={ROUTES.LATEXLINT_OTHER} element={<OtherPage />} />
          <Route path={ROUTES.LATEXLINT_README} element={<ReadmePage />} />
          <Route path={`${ROUTES.LATEXLINT_README}/:anchor`} element={<ReadmePage />} />
          <Route
            path={ROUTES.LATEXCITATION}
            element={
              <ProjectPlaceholderPage
                title="LaTeX Citation"
                description="Citation support tools for academic manuscripts are planned here."
              />
            }
          />
          <Route
            path={ROUTES.LATEXWRITING}
            element={
              <ProjectPlaceholderPage
                title="LaTeX Writing"
                description="Writing notes and utilities for clearer technical documents are planned here."
              />
            }
          />
          <Route path="*" element={<Navigate to={ROUTES.HUB} replace />} />
        </Routes>
      </BrowserRouter>
    </ChakraProvider>
  </StrictMode>,
)
