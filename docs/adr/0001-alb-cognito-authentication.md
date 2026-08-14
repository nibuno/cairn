# ADR 0001: ALBとCognito User Poolで認証する

- Status: Accepted
- Date: 2026-08-14

## Context

Cairnの最初の公開では、個人利用のブラウザアプリをログイン必須にしたい。アプリ本体へOAuth処理やログイン画面を実装すると、初回公開で確認する範囲が広がる。

必要なのは、メールアドレスとパスワードによる1人分のログインである。パスキー、パスワードレス認証、メールMFA、ログイン画面のビジュアルエディタは現時点では使わない。

## Decision

- Application Load Balancerの `authenticate-cognito` actionを使う
- Cognito User Poolを使い、Identity Poolは作らない
- User PoolはLite feature planに固定する
- Cognito Hosted UI（classic）を使う
- メールアドレスでログインする
- public self sign-upを無効にし、管理者が利用者を作る
- OAuth 2.0 Authorization Code Grantを使う
- callback URLを `https://cairn.nibuno.dev/oauth2/idpresponse` とする
- ALBの認証sessionは12時間とする

## Consequences

- Cairn本体にログイン画面やOAuth callback処理を実装せずに公開できる
- 未ログインのrequestはALBからCognitoへredirectされる
- 認証後、ALBがECSへ `x-amzn-oidc-*` headerを渡す
- 初期画面は認証claimを認可判断に使わない
- 利用者別データを実装するときは、`x-amzn-oidc-data` の署名と送信元ALB ARNを検証し、`sub`を利用者IDとして使う
- パスキーなどが必要になった場合はEssentialsへの変更を検討する

## Alternatives

### アプリケーションでCognitoのOAuthを直接処理する

SPA、mobile app、公開APIを分離する段階では有効だが、初回公開には実装範囲が広いので採用しない。

### Cognito Essentialsを使う

新しいManaged Loginやpasswordless機能は今回使わない。利用機能と料金planを一致させるため採用しない。

### IP addressだけで制限する

検証用の一時制限としては使えるが、利用者認証や将来の利用者識別にはならないため採用しない。

## References

- [Authenticate users using an Application Load Balancer](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/listener-authenticate-users.html)
- [User pool feature plans](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-sign-in-feature-plans.html)
