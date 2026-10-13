import { Link } from 'react-router-dom';

function Header() {
  return (
    <header className="bg-mcd-red text-white shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <span className="bg-mcd-yellow text-mcd-red rounded-full w-9 h-9 flex items-center justify-center text-2xl">
            🍔
          </span>
          <span className="hidden sm:inline">懂你餐盘</span>
        </Link>
        <nav className="flex gap-4 text-sm">
          <Link to="/" className="hover:text-mcd-yellow transition-colors">
            推荐
          </Link>
          <a
            href="https://github.com"
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
