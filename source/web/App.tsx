import { Routes, Route } from 'react-router-dom';
import IntroPages from './pages/IntroPages';
import SurveyForm from './pages/SurveyForm';
import Result from './pages/Result';

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-mcd-cream">
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<IntroPages />} />
          <Route path="/survey" element={<SurveyForm />} />
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
