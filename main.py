#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
懂你餐盘 (mcd-imlovinit) · 统一启动入口
=========================================

一条命令同时拉起前端 + 后端：
    python main.py

可选参数：
    python main.py --no-install     跳过依赖检查/安装
    python main.py --backend-only   只启动后端
    python main.py --frontend-only  只启动前端
    python main.py --port 8080      指定后端端口（默认 4000）

说明：
  - 后端：source/server  → http://localhost:4000
  - 前端：source/web     → http://localhost:5173 （Vite 自动把 /api 代理到后端）

按 Ctrl+C 可同时停止两个服务。
"""

import argparse
import os
import shutil
import signal
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SERVER_DIR = ROOT / "source" / "server"
WEB_DIR = ROOT / "source" / "web"

IS_WINDOWS = sys.platform.startswith("win")
NPM = "npm.cmd" if IS_WINDOWS else "npm"

# 终端颜色（Windows 10+ 支持 ANSI）
def _c(text: str, code: str) -> str:
    if IS_WINDOWS and not os.environ.get("WT_SESSION"):
        # 老版 cmd 可能不支持 ANSI，直接返回纯文本
        return text
    return f"\033[{code}m{text}\033[0m"

def _emit(msg: str, code: str) -> None:
    # flush=True 保证在管道/重定向场景下也能实时输出
    print(_c(msg, code), flush=True)

def info(msg: str) -> None:
    _emit(f"[懂你餐盘] {msg}", "36")

def ok(msg: str) -> None:
    _emit(f"[懂你餐盘] {msg}", "32")

def warn(msg: str) -> None:
    _emit(f"[懂你餐盘] {msg}", "33")

def err(msg: str) -> None:
    _emit(f"[懂你餐盘] {msg}", "31")


def which_npm() -> str | None:
    return shutil.which(NPM)


def check_prerequisites() -> str:
    """检查 node / npm 是否可用，返回 npm 可执行路径。"""
    node = shutil.which("node")
    if not node:
        err("未检测到 Node.js，请先安装 Node >= 18：https://nodejs.org")
        sys.exit(1)

    npm = which_npm()
    if not npm:
        err("未检测到 npm，请确认 Node.js 安装完整。")
        sys.exit(1)

    try:
        node_ver = subprocess.check_output([node, "-v"], text=True).strip()
    except Exception:
        node_ver = "unknown"

    ok(f"检测到 Node {node_ver}")
    return npm


def ensure_deps(npm: str, workdir: Path) -> None:
    """若 node_modules 不存在则安装依赖。"""
    if (workdir / "node_modules").exists():
        return
    info(f"首次运行，正在安装依赖：{workdir.name} ...")
    subprocess.check_call([npm, "install"], cwd=str(workdir))


def start_process(name: str, cmd: list[str], cwd: Path) -> subprocess.Popen:
    info(f"启动 {name}：{cwd.relative_to(ROOT)}")
    return subprocess.Popen(
        cmd,
        cwd=str(cwd),
        shell=IS_WINDOWS,  # Windows 下 npm 是 .cmd，需 shell
    )


def main() -> None:
    parser = argparse.ArgumentParser(
        description="懂你餐盘 · 一键启动前端 + 后端",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument("--no-install", action="store_true", help="跳过依赖检查/安装")
    parser.add_argument("--backend-only", action="store_true", help="只启动后端")
    parser.add_argument("--frontend-only", action="store_true", help="只启动前端")
    parser.add_argument("--port", default="4000", help="后端端口（默认 4000）")
    args = parser.parse_args()

    print(_c("\n🍔  懂你餐盘 · 麦当劳智能餐品推荐  🍟\n", "33"))
    print("   启动中，请稍候...\n")

    if not SERVER_DIR.exists() or not WEB_DIR.exists():
        err(f"未找到 source/server 或 source/web，请确认在项目根目录运行本脚本。")
        sys.exit(1)

    npm = check_prerequisites()

    procs: list[subprocess.Popen] = []
    env = os.environ.copy()
    env["PORT"] = str(args.port)

    try:
        if not args.frontend_only:
            if not args.no_install:
                ensure_deps(npm, SERVER_DIR)
            procs.append(
                start_process(
                    "后端 (Express)",
                    [npm, "run", "dev"],
                    SERVER_DIR,
                )
            )

        if not args.backend_only:
            if not args.no_install:
                ensure_deps(npm, WEB_DIR)
            procs.append(
                start_process(
                    "前端 (Vite)",
                    [npm, "run", "dev"],
                    WEB_DIR,
                )
            )

        # 等一下让服务打印出监听地址
        time.sleep(3)

        print()
        ok("服务已启动：")
        if not args.frontend_only:
            ok(f"  · 后端  http://localhost:{args.port}   （API：/api/recommend, /api/catalog）")
        if not args.backend_only:
            ok("  · 前端  http://localhost:5173   （在浏览器打开这个）")
        print()
        info("按 Ctrl+C 停止全部服务。\n")

        # 等待任意子进程退出
        while True:
            for p in procs:
                ret = p.poll()
                if ret is not None:
                    warn(f"某个服务已退出（code={ret}），正在停止其余服务...")
                    raise KeyboardInterrupt
            time.sleep(0.5)

    except KeyboardInterrupt:
        print()
        info("正在停止服务...")
    finally:
        for p in procs:
            if p.poll() is None:
                try:
                    if IS_WINDOWS:
                        # 终止整棵进程树（npm -> node）
                        subprocess.run(
                            ["taskkill", "/F", "/T", "/PID", str(p.pid)],
                            stdout=subprocess.DEVNULL,
                            stderr=subprocess.DEVNULL,
                        )
                    else:
                        p.send_signal(signal.SIGTERM)
                except Exception:
                    pass
        ok("已停止。再见 👋")


if __name__ == "__main__":
    main()
