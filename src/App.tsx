import { Routes, Route } from "react-router-dom";
import NotFound from "./pages/NotFound";
import DefaultLayout from "./layouts/DefaultLayout";
import NotificationBar from "./components/notification/NotificationBar";
import ImagesGridPage from "./pages/ImagesGridPage";
import ImageEditorPage from "./pages/ImageEditorPage";
import ImagesGridLayout from "./layouts/ImagesGridLayout";
import NavBar from "./components/nav/NavBar";

function App() {
  return (
    <>
      <NotificationBar />
      <NavBar />
      <Routes>
        <Route element={<DefaultLayout />}>
          <Route path="/" element={<ImagesGridLayout />} >
            <Route path="/" element={<ImagesGridPage />} />
          </Route>
          <Route path="/image/:id" element={<ImageEditorPage />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
