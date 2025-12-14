import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import UploadPage from './pages/UploadPage'
import TablesPage from './pages/TablesPage'
import ChartsPage from './pages/ChartsPage'
import InvestmentsPage from './pages/InvestmentsPage'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="nav-container">
            <h1 className="nav-title">💰 Dashboard Financeiro</h1>
            <div className="nav-links">
              <Link to="/">Upload</Link>
              <Link to="/tabelas">Tabelas</Link>
              <Link to="/graficos">Gráficos</Link>
              <Link to="/investimentos">Investimentos</Link>
            </div>
          </div>
        </nav>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<UploadPage />} />
            <Route path="/tabelas" element={<TablesPage />} />
            <Route path="/graficos" element={<ChartsPage />} />
            <Route path="/investimentos" element={<InvestmentsPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App

