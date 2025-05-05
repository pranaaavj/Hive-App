import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Provider } from 'react-redux';
import { store } from "./redux/store/store.ts";
import { persistStore } from 'redux-persist';
import { BrowserRouter } from "react-router-dom";
import { PersistGate } from "redux-persist/integration/react";

const persistor = persistStore(store)
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store = {store}>
      <PersistGate loading={null} persistor={persistor}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
      </PersistGate>
  </Provider>
  </StrictMode>
);