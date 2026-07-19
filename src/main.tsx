import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import latexCitationReadmeContent from './assets/latexcitation_README.md?raw'
import latexlintReadmeContent from './assets/latexlint_README.md?raw'
import { ScrollToTopOnNavigate } from './components/ScrollToTopOnNavigate'
import { ROUTES } from './constants/routes'
import { LatexCitationOtherPage } from './latexcitation/pages/LatexCitationOtherPage'
import { LatexCitationPage } from './latexcitation/pages/LatexCitationPage'
import { LatexLintOtherPage } from './latexlint/pages/LatexLintOtherPage'
import { LatexLintPage } from './latexlint/pages/LatexLintPage'
import { HubPage } from './latexpages/pages/HubPage'
import { LatexWritingOtherPage } from './latexwriting/pages/LatexWritingOtherPage'
import { LatexWritingPage } from './latexwriting/pages/LatexWritingPage'
import { ProjectReadmePage } from './pages/ProjectReadmePage'

const routerBasename = import.meta.env.BASE_URL.replace(/\/$/, '')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ChakraProvider value={defaultSystem}>
      <BrowserRouter basename={routerBasename}>
        <ScrollToTopOnNavigate />
        <Routes>
          <Route path={ROUTES.HUB} element={<HubPage />} />
          <Route path={ROUTES.LATEXLINT} element={<LatexLintPage />} />
          <Route path={`${ROUTES.LATEXLINT}/`} element={<LatexLintPage />} />
          <Route path={ROUTES.LATEXLINT_OTHER} element={<LatexLintOtherPage />} />
          <Route path={`${ROUTES.LATEXLINT_OTHER}/`} element={<LatexLintOtherPage />} />
          <Route path={ROUTES.LATEXLINT_README} element={<ProjectReadmePage projectKey="latexlint" content={latexlintReadmeContent} />} />
          <Route path={`${ROUTES.LATEXLINT_README}/`} element={<ProjectReadmePage projectKey="latexlint" content={latexlintReadmeContent} />} />
          <Route path={`${ROUTES.LATEXLINT_README}/:anchor`} element={<ProjectReadmePage projectKey="latexlint" content={latexlintReadmeContent} />} />
          <Route
            path={ROUTES.LATEXCITATION}
            element={<LatexCitationPage />}
          />
          <Route
            path={`${ROUTES.LATEXCITATION}/`}
            element={<LatexCitationPage />}
          />
          <Route path={ROUTES.LATEXCITATION_README} element={<ProjectReadmePage projectKey="latexcitation" content={latexCitationReadmeContent} />} />
          <Route path={`${ROUTES.LATEXCITATION_README}/`} element={<ProjectReadmePage projectKey="latexcitation" content={latexCitationReadmeContent} />} />
          <Route path={`${ROUTES.LATEXCITATION_README}/:anchor`} element={<ProjectReadmePage projectKey="latexcitation" content={latexCitationReadmeContent} />} />
          <Route path={ROUTES.LATEXCITATION_OTHER} element={<LatexCitationOtherPage />} />
          <Route path={`${ROUTES.LATEXCITATION_OTHER}/`} element={<LatexCitationOtherPage />} />
          <Route
            path={ROUTES.LATEXWRITING}
            element={<LatexWritingPage />}
          />
          <Route
            path={`${ROUTES.LATEXWRITING}/`}
            element={<LatexWritingPage />}
          />
          <Route path={ROUTES.LATEXWRITING_OTHER} element={<LatexWritingOtherPage />} />
          <Route path={`${ROUTES.LATEXWRITING_OTHER}/`} element={<LatexWritingOtherPage />} />
          <Route path="*" element={<Navigate to={ROUTES.HUB} replace />} />
        </Routes>
      </BrowserRouter>
    </ChakraProvider>
  </StrictMode>,
)
