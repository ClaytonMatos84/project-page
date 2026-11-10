import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { EditoriaPage } from './pages/EditoriaPage';
import { LeituraPage } from './pages/LeituraPage';
import { SearchPage } from './pages/SearchPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { FlashPage } from './pages/FlashPage';

/**
 * Rotas do Mini Portal UOL (§3.1): `Home` (`/`), `Editoria` (`/editoria/:slug`),
 * `Leitura` (`/leitura/:id`), busca (`/busca?q=`) — todas sob o `Layout`.
 *
 * `/flash` (§3.2) fica **fora** do `Layout`: experiência imersiva com moldura
 * de smartphone, sem o header do portal (decisão de design 12).
 */
export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="flash" element={<FlashPage />} />
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
