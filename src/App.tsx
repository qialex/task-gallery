import { Routes, Route } from "react-router-dom";
import NotFound from "./pages/NotFound";
import DefaultLayout from "./layouts/DefaultLayout";
import NotificationBar from "./components/notification/NotificationBar";
import GridImagesPage from "./pages/GridImagesPage";
import SingleImagePage from "./pages/SingleImagePage";
import ImagesLayout from "./layouts/ImagesLayout";

function App() {
  return (
    <>
      <NotificationBar />
      <Routes>
        <Route element={<DefaultLayout />}>
          <Route path="/" element={<ImagesLayout />} >
            <Route path="/" element={<GridImagesPage />} />
          </Route>
          <Route path="/image/:id" element={<SingleImagePage />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
