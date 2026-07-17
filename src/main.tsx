import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ScrollToTopOnNavigate } from './components/ScrollToTopOnNavigate'
import { ROUTES } from './constants/routes'
import { Content } from './content'
import { HubPage } from './pages/HubPage'
import { LatexCitationPage } from './pages/latexcitation/LatexCitationPage'
import { LatexCitationReadmePage } from './pages/LatexCitationReadmePage'
import { LatexWritingPage } from './pages/latexwriting/LatexWritingPage'
import { OtherPage } from './pages/OtherPage'
import { ReadmePage } from './pages/ReadmePage'

const routerBasename = import.meta.env.BASE_URL.replace(/\/$/, '')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ChakraProvider value={defaultSystem}>
      <BrowserRouter basename={routerBasename}>
        <ScrollToTopOnNavigate />
        <Routes>
          <Route path={ROUTES.HUB} element={<HubPage />} />
          <Route path={ROUTES.LATEXLINT} element={<Content />} />
          <Route path={`${ROUTES.LATEXLINT}/`} element={<Content />} />
          <Route path={ROUTES.LATEXLINT_OTHER} element={<OtherPage />} />
          <Route path={`${ROUTES.LATEXLINT_OTHER}/`} element={<OtherPage />} />
          <Route path={ROUTES.LATEXLINT_README} element={<ReadmePage />} />
          <Route path={`${ROUTES.LATEXLINT_README}/`} element={<ReadmePage />} />
          <Route path={`${ROUTES.LATEXLINT_README}/:anchor`} element={<ReadmePage />} />
          <Route
            path={ROUTES.LATEXCITATION}
            element={<LatexCitationPage />}
          />
          <Route
            path={`${ROUTES.LATEXCITATION}/`}
            element={<LatexCitationPage />}
          />
          <Route path={ROUTES.LATEXCITATION_README} element={<LatexCitationReadmePage />} />
          <Route path={`${ROUTES.LATEXCITATION_README}/`} element={<LatexCitationReadmePage />} />
          <Route path={`${ROUTES.LATEXCITATION_README}/:anchor`} element={<LatexCitationReadmePage />} />
          <Route path={ROUTES.LATEXCITATION_OTHER} element={<OtherPage projectKey="latexcitation" />} />
          <Route path={`${ROUTES.LATEXCITATION_OTHER}/`} element={<OtherPage projectKey="latexcitation" />} />
          <Route
            path={ROUTES.LATEXWRITING}
            element={<LatexWritingPage />}
          />
          <Route
            path={`${ROUTES.LATEXWRITING}/`}
            element={<LatexWritingPage />}
          />
          <Route path={ROUTES.LATEXWRITING_OTHER} element={<OtherPage projectKey="latexwriting" />} />
          <Route path={`${ROUTES.LATEXWRITING_OTHER}/`} element={<OtherPage projectKey="latexwriting" />} />
          <Route path="*" element={<Navigate to={ROUTES.HUB} replace />} />
        </Routes>
      </BrowserRouter>
    </ChakraProvider>
  </StrictMode>,
)
