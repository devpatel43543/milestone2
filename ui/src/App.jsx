import React, { Suspense } from "react";
import "./App.css";
import { Route, Routes } from "react-router-dom";
import frontEndRoutes from "./constants/frontendRoutes";
import Header from "./component/Header";
import Sidebar from "./component/SideBar";

const Login = React.lazy(() => import("./pages/Login"));
const Register = React.lazy(() => import("./pages/Register"));
const ConfirmOtp = React.lazy(() => import("./pages/ConfirmOtp")); // <-- New
const LoadAnimation = React.lazy(() => import("./component/LoadAnimation"));
const Home = React.lazy(() => import("./pages/Home"));
const CreatePost = React.lazy(() => import("./pages/CreatePost")); // <-- New
function App() {
  return (
    <Routes>
      <Route path={frontEndRoutes.HOME} element={<IncludeNavbar Component={Home} />} />

      <Route path={frontEndRoutes.LOGIN} element={<ExcludeNavbar Component={Login} />} />
      <Route path={frontEndRoutes.REGISTER} element={<ExcludeNavbar Component={Register} />} />
      <Route path={frontEndRoutes.CONFIRM_OTP} element={<ExcludeNavbar Component={ConfirmOtp} />} />
      <Route path={frontEndRoutes.CREATE_POST} element={<ExcludeNavbar Component={CreatePost} />} />
    </Routes>
  );
}

const ExcludeNavbar = ({ Component }) => (
  <Suspense fallback={<LoadAnimation />}>
    <Component />
  </Suspense>
);
const IncludeNavbar = ({ Component }) => (
  <Suspense fallback={<LoadAnimation />}>
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <Header />

      <div className="container mx-auto px-4 lg:px-6 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <Sidebar />
          <Component />
        </div>
      </div>
    </div>
  </Suspense>
);

export default App;
