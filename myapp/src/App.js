
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import Vendors from './components/Vendors';
import Assets from './components/Assets';

import Admin from './components/Admin';
import Login from './components/Login';

import Home from './components/Home';
import Navbar from './components/Navbar';

import Layout_Admin from './components/admin_components/admin_layout';
import Layout from './components/home_components/home_layout';
import Report from './components/Report';




function App() {
  return (
    <div className='font-[Montserrat] overflow-x-hidden w-full min-h-screen absolute bg-stone-200'>

      <BrowserRouter>
      <Routes>
          <Route path="/" element={<Navbar />}>
            <Route path='' element={<Home />}>
              <Route index element={<Layout dataCenter={1} />} />
              <Route path="vrc" element={<Layout dataCenter={2} />} />
              <Route path="dr" element={<Layout dataCenter={3} />} />
              {/* <Route path="spic" element={<Layout dataCenter={4} />} /> */}
            </Route>
            <Route path="/vendors" element={<Vendors />} />
            <Route path="/assets" element={<Assets />} />
            <Route path="/reporting" element={<Report />} />

            <Route path="/admin" element={<Admin />}>
              <Route index element={<Layout_Admin dataCenter={1} />} />
              <Route path="vrc" element={<Layout_Admin dataCenter={2} />} />
              <Route path="dr" element={<Layout_Admin dataCenter={3} />} />
              {/* <Route path="spic" element={<Layout_Admin dataCenter={4} />} /> */}
            </Route>
            <Route path="/login" element={<Login />} />
          </Route>

        </Routes>
      </BrowserRouter>
    </div>

    //  TODO: Implement routes
    // <Routes>

    // </Routes>

  );
}

export default App;
