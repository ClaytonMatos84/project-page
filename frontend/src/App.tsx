import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { EditoriaPage } from './pages/EditoriaPage';
import { LeituraPage } from './pages/LeituraPage';
import { SearchPage } from './pages/SearchPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { FlashPage } from './pages/FlashPage';
import { BatePapoPage } from './pages/BatePapoPage';

/**
 * Rotas do Mini Portal UOL (§3.1): `Home` (`/`), `Editoria` (`/editoria/:slug`),
 * `Leitura` (`/leitura/:id`), busca (`/busca?q=`) — todas sob o `Layout`.
 *
 * `/flash` (§3.2) e `/bate-papo` (§3.3) ficam **fora** do `Layout`: experiências
 * imersivas com barra própria, sem o header do portal (precedente `/flash`).
 */
export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="flash" element={<FlashPage />} />
        <Route path="bate-papo" element={<BatePapoPage />} />
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="editoria/:slug" element={<EditoriaPage />} />
          <Route path="leitura/:id" element={<LeituraPage />} />
          <Route path="busca" element={<SearchPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
