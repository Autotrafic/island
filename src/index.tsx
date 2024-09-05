import 'antd/dist/reset.css';
import '../public/globals.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import App from './App';
import Providers from './context';

const rootElement = document.getElementById('root');

const root = createRoot(rootElement!);

root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/:orderId" element={<UploadDocuments />} />
    </Routes>
  </BrowserRouter>
);

function UploadDocuments() {
  return (
    <Providers>
      <App />
    </Providers>
  );
}
