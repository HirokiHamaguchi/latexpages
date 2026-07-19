import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import latexCitationReadmeContent from './assets/latexcitation_README.md?raw'
import latexlintReadmeContent from './assets/latexlint_README.md?raw'
import { ScrollToTopOnNavigate } from './components/ScrollToTopOnNavigate'
import { ROUTES } from './constants/routes'
import { LatexLintPage } from './features/latexlint/pages/LatexLintPage'
import { HubPage } from './pages/HubPage'
import { ProjectReadmePage } from './pages/ProjectReadmePage'
import { LatexCitationPage } from './pages/latexcitation/LatexCitationPage'
import { LatexWritingPage } from './pages/latexwriting/LatexWritingPage'
import { OtherPage } from './pages/OtherPage'

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
          <Route path={ROUTES.LATEXLINT_OTHER} element={<OtherPage />} />
          <Route path={`${ROUTES.LATEXLINT_OTHER}/`} element={<OtherPage />} />
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
