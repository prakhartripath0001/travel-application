import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import DestinationDetail from './pages/DestinationDetail.jsx';
import Home from './pages/Home.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="destinations/:destinationId" element={<DestinationDetail />} />
        <Route path="*" element={<Home />} />
      </Route>
    </Routes>
  );
}
