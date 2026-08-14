# cairn

Cairn は、学習や活動を小さな単位で記録し、後から振り返るための個人向けアプリです。

現在は、プロダクト設計と AWS への初回デプロイ準備を進めています。

## 最初に見るもの

- [cairn.nibuno.dev を公開する仕組み](./docs/cairn-domain-guide.html)
- [画面プロトタイプ](./design/cairn-design-preview.html)
- [デザインシステム](./docs/cairn-design-system.md)
- [AWS 本番運用準備レビュー](./docs/cairn-aws-production-readiness-research.md)

## 公開先

予定している公開 URL は `https://cairn.nibuno.dev` です。

`nibuno.dev` の DNS は Cloudflare で管理し、`cairn.nibuno.dev` だけを Amazon Route 53 に委譲します。Cairn のアプリケーションは、東京リージョンの ALB、ECS Fargate、RDS PostgreSQL で動かす想定です。

アプリ本体と Infrastructure as Code は未実装です。
