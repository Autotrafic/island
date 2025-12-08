import 'antd/dist/reset.css';
import '../../../public/globals.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { createRoot } from 'react-dom/client';
import LeadsUploader from './components';
import Providers from '../upload-customer-files/context';

const rootElement = document.getElementById('root');

const root = createRoot(rootElement!);

root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<UploadLeads />} />
    </Routes>
  </BrowserRouter>
);

function UploadLeads() {
  return (
      <LeadsUploader />
  );
}
