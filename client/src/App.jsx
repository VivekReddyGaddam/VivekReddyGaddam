import { Suspense } from "react";
import { Route, Routes } from "react-router-dom";

import AppLayout from "./components/layout/AppLayout";
import LoadingOverlay from "./components/common/LoadingOverlay";
import DashboardPage from "./pages/dashboard/DashboardPage";
import HomePage from "./pages/home/HomePage";
import IdeasFeedPage from "./pages/ideas/IdeasFeedPage";
import IdeaPostingPage from "./pages/posting/IdeaPostingPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import NotFoundPage from "./pages/NotFoundPage";

function App() {
  return (
    <AppLayout>
      <Suspense fallback={<LoadingOverlay message="Loading IdeaConnect..." />}>
        <Routes>
          <Route index element={<HomePage />} />
          <Route path="/ideas" element={<IdeasFeedPage />} />
          <Route path="/post" element={<IdeaPostingPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </AppLayout>
  );
}

export default App;
