import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Result from './pages/Result';
import Header from './components/Header';

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/result" element={<Result />} />
        </Routes>
      </main>
      <footer className="bg-mcd-red text-white py-6 text-center text-sm">
        <p>🥰 懂你餐盘 · 麦当劳智能餐品推荐 · Made with ❤️ for 麦当劳创意开发大赛</p>
        <p className="mt-1 text-white/80">数据来源：麦当劳官方营养信息</p>
      </footer>
    </div>
  );
}

export default App;
