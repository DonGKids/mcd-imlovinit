import { Link, useLocation } from 'react-router-dom';

function Header() {
  const location = useLocation();
  // 在介绍页时 Header 浮动透明，结果/问卷页保持实色
  const isIntro = location.pathname === '/';

  return (
    <header
      className={`${
        isIntro ? 'bg-transparent' : 'bg-mcd-red'
      } text-white shadow-md sticky top-0 z-50 transition-colors`}
    >
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <span className="bg-mcd-yellow text-mcd-red rounded-full w-9 h-9 flex items-center justify-center text-2xl">
            🍔
          </span>
          <span className="hidden sm:inline">懂你餐盘</span>
        </Link>
        <nav className="flex gap-4 text-sm">
          <Link to="/" className="hover:text-mcd-yellow transition-colors">
            首页
          </Link>
          <Link
            to="/survey"
            className="hover:text-mcd-yellow transition-colors font-semibold"
          >
            开始使用
          </Link>
          <a
            href="https://github.com/DonGKids/mcd-imlovinit"
            target="_blank"
            rel="noreferrer"
            className="hover:text-mcd-yellow transition-colors"
          >
            GitHub
          </a>
        </nav>
      </div>
    </header>
  );
}

export default Header;
