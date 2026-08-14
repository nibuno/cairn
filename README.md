# cairn

Cairn は、学習や活動を小さな単位で記録し、後から振り返るための個人向けアプリです。

現在は、Cognitoでログインした後に準備中画面を表示する、最初のAWS構成まで実装しています。AWSへのデプロイはまだ行っていません。

## 最初に見るもの

- [cairn.nibuno.dev を公開する仕組み](./docs/cairn-domain-guide.html)
- [ここまでに行ったこと](./docs/cairn-first-deploy-implementation-record.md)
- [最初のデプロイ手順](./docs/first-deploy.md)
- [ALB + Cognito認証の設計判断](./docs/adr/0001-alb-cognito-authentication.md)
- [画面プロトタイプ](./design/cairn-design-preview.html)
- [デザインシステム](./docs/cairn-design-system.md)
- [AWS 本番運用準備レビュー](./docs/cairn-aws-production-readiness-research.md)

## 公開先

予定している公開 URL は `https://cairn.nibuno.dev` です。

`nibuno.dev` の DNS は Cloudflare で管理し、`cairn.nibuno.dev` だけを Amazon Route 53 に委譲します。最初の構成では、東京リージョンのALBでCognito認証を行い、ECS Fargateで準備中画面を表示します。

## ローカルで確認

```bash
cd app
npm ci
npm test
npm start
```

`http://localhost:3000` で準備中画面、`http://localhost:3000/health` でヘルスチェックを確認できます。ローカルではALBとCognitoを通らないため、ログイン画面は表示されません。

## 構成

- `app/`: ECSで動かす依存パッケージなしのNode.jsアプリ
- `infra/`: Route 53、ACM、Cognito、ALB、ECSを作るAWS CDK
- `design/`: Cairn画面のプロトタイプ
- `docs/`: 設計、調査、デプロイ手順
