import './style.css'
import {createRoot} from 'react-dom/client'
import App from './App.jsx'  // 改為默認導入

createRoot(document.querySelector('#root')).render(<App />)
