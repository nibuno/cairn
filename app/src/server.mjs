import { createServer as createHttpServer } from 'node:http';
import { pathToFileURL } from 'node:url';

const html = String.raw`<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <title>Cairn — 準備中</title>
  <style>
    :root {
      --page: #fafaf9;
      --surface: #ffffff;
      --text: #292524;
      --heading: #1c1917;
      --muted: #78716c;
      --border: #e7e5e4;
      --focus: #f59e0b;
      --status: #fcd34d;
    }

    * { box-sizing: border-box; }

    body {
      min-width: 320px;
      min-height: 100vh;
      margin: 0;
      background: var(--page);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      line-height: 1.65;
    }

    .skip-link {
      position: fixed;
      top: 12px;
      left: 12px;
      z-index: 1;
      padding: 8px 12px;
      background: var(--heading);
      color: var(--surface);
      transform: translateY(-160%);
    }

    .skip-link:focus { transform: translateY(0); }

    header {
      border-bottom: 1px solid var(--border);
      background: var(--surface);
    }

    header div,
    main {
      width: min(calc(100% - 32px), 720px);
      margin-inline: auto;
    }

    header div {
      padding-block: 18px;
      font-size: 18px;
      font-weight: 700;
      letter-spacing: -0.02em;
    }

    main { padding-block: 64px; }

    .status {
      display: inline-block;
      margin: 0 0 16px;
      padding-bottom: 2px;
      border-bottom: 4px solid var(--status);
      color: var(--muted);
      font-size: 14px;
      font-weight: 600;
    }

    h1 {
      margin: 0;
      color: var(--heading);
      font-size: clamp(32px, 7vw, 48px);
      line-height: 1.3;
      letter-spacing: -0.03em;
    }

    .lead {
      max-width: 560px;
      margin: 20px 0 0;
      color: var(--muted);
      font-size: 18px;
    }

    dl {
      display: grid;
      grid-template-columns: 140px minmax(0, 1fr);
      margin: 48px 0 0;
      border-top: 1px solid var(--border);
    }

    dt,
    dd {
      margin: 0;
      padding: 16px 0;
      border-bottom: 1px solid var(--border);
    }

    dt {
      color: var(--muted);
      font-size: 14px;
    }

    dd {
      color: var(--heading);
      font-weight: 600;
    }

    code {
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 0.9em;
      overflow-wrap: anywhere;
    }

    :focus-visible {
      outline: 3px solid var(--focus);
      outline-offset: 3px;
    }

    @media (max-width: 520px) {
      main { padding-block: 40px; }

      dl { grid-template-columns: 1fr; }

      dt {
        padding-bottom: 0;
        border-bottom: 0;
      }

      dd { padding-top: 4px; }
    }
  </style>
</head>
<body>
  <a class="skip-link" href="#main-content">本文へ移動</a>
  <header><div>cairn</div></header>
  <main id="main-content">
    <p class="status">ログイン済み</p>
    <h1>Cairnを準備しています</h1>
    <p class="lead">Cognitoでのログインと、ECSでのアプリケーション実行を確認できました。記録画面はこれから実装します。</p>

    <dl>
      <dt>公開先</dt>
      <dd><code>cairn.nibuno.dev</code></dd>
      <dt>認証</dt>
      <dd>Amazon Cognito</dd>
      <dt>実行環境</dt>
      <dd>Amazon ECS Fargate</dd>
    </dl>
  </main>
</body>
</html>`;

const commonHeaders = {
  'cache-control': 'no-store',
  'content-security-policy': "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
  'referrer-policy': 'no-referrer',
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
};

function send(response, statusCode, contentType, body) {
  response.writeHead(statusCode, {
    ...commonHeaders,
    'content-type': contentType,
  });
  response.end(body);
}

export function createServer() {
  return createHttpServer((request, response) => {
    const url = new URL(request.url ?? '/', 'http://localhost');

    if (request.method === 'GET' && url.pathname === '/health') {
      send(response, 200, 'application/json; charset=utf-8', JSON.stringify({ status: 'ok' }));
      return;
    }

    if (request.method === 'GET' && url.pathname === '/') {
      send(response, 200, 'text/html; charset=utf-8', html);
      return;
    }

    send(response, 404, 'application/json; charset=utf-8', JSON.stringify({ error: 'not_found' }));
  });
}

const isMainModule = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMainModule) {
  const port = Number.parseInt(process.env.PORT ?? '3000', 10);
  const host = process.env.HOST ?? '0.0.0.0';
  const server = createServer();

  server.listen(port, host, () => {
    console.log(JSON.stringify({ level: 'info', message: 'server_started', host, port }));
  });

  const shutdown = (signal) => {
    console.log(JSON.stringify({ level: 'info', message: 'server_stopping', signal }));
    server.close(() => process.exit(0));
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}
