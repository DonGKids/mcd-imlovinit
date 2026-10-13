import { Routes, Route } from 'react-router-dom';
import IntroPages from './pages/IntroPages';
import SurveyForm from './pages/SurveyForm';
import Result from './pages/Result';

function App() {
  return (
    // 外层 h-screen + overflow-hidden 锁死视口，body 不滚动
    // 由 main 内部 overflow-y-auto 滚动（同时覆盖 home 的 fixed IntroPages）
    <div className="h-screen flex flex-col overflow-hidden bg-mcd-cream">
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<IntroPages />} />
          <Route path="/survey" element={<SurveyForm />} />
          <Route path="/result" element={<Result />} />
        </Routes>
      </main>
      <footer className="bg-mcd-red text-white py-4 text-center text-xs sm:text-sm flex-shrink-0 z-10">
        <p>🥰 懂你餐盘 · 麦当劳智能餐品推荐 · Made with ❤️ for 麦当劳程序员节创意开发大赛</p>
        <p className="mt-1 text-white/80">数据来源：麦当劳官方营养信息</p>
      </footer>
    </div>
  );
}

export default App;
