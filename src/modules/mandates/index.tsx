import 'antd/dist/reset.css';
import '../../../public/globals.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import DocusealSign from './components/DocusealSign';

const rootElement = document.getElementById('root');

const root = createRoot(rootElement!);

root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/:templateSlug" element={<DocusealSign />} />
    </Routes>
  </BrowserRouter>
);
