import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Set default locale to French
import { format, formatDistance, formatRelative } from 'date-fns';
import { fr } from 'date-fns/locale';

createRoot(document.getElementById("root")!).render(<App />);
