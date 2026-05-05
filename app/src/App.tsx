import { HashRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Story } from './screens/Story';
import { Pipeline } from './screens/Pipeline';
import { Model } from './screens/Model';
import { Diagnostic } from './screens/Diagnostic';
import { HotSpots } from './screens/HotSpots';
import { Sectoral } from './screens/Sectoral';
import { Compare } from './screens/Compare';
import { Stress } from './screens/Stress';
import { Cedent } from './screens/Cedent';
import { Actions } from './screens/Actions';
import { Brief } from './screens/Brief';
import { Evidence } from './screens/Evidence';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Story />} />
          <Route path="pipeline" element={<Pipeline />} />
          <Route path="model" element={<Model />} />
          <Route path="diagnostic" element={<Diagnostic />} />
          <Route path="hotspots" element={<HotSpots />} />
          <Route path="sectoral" element={<Sectoral />} />
          <Route path="compare" element={<Compare />} />
          <Route path="stress" element={<Stress />} />
          <Route path="cedent" element={<Cedent />} />
          <Route path="actions" element={<Actions />} />
          <Route path="brief" element={<Brief />} />
          <Route path="evidence" element={<Evidence />} />
          <Route path="*" element={<Story />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
