# Cairn 最初のデプロイ

## 今回のゴール

ブラウザで `https://cairn.nibuno.dev` を開くとCognitoのログイン画面へ移動し、ログイン後に「Cairnを準備しています」と表示される状態にする。

RDS、記録機能、WAF、GitHub Actionsは今回作らない。

## 作業の分担

人が行う作業は次の2つだけである。

1. CloudflareにNSレコードを4件登録する
2. 最初のCognito利用者を作り、届いた仮パスワードでログインする

Route 53、証明書、Cognito、ALB、ECSはCDKが作成する。

## デプロイ前の確認

AWSへはまだデプロイしていない。次のコマンドはローカル検証だけを行い、AWSリソースを作成しない。

```bash
cd infra
npm ci
npm run build
npm test
npm run synth
```

## 初回デプロイの順番

初回は `cdk deploy --all` を使わない。Cloudflareへの委譲を途中で行うため、2つのスタックを別々にデプロイする。

### 1. DNSの土台を作る

```bash
cd infra
npx cdk deploy CairnDomainStack
```

完了すると、`NameServers` にカンマ区切りで4つのネームサーバーが表示される。

### 2. Cloudflareへ登録する

Cloudflareの `nibuno.dev` DNS設定に、次のレコードを4件作成する。

| Type | Name | Content |
|---|---|---|
| NS | `cairn` | 1つ目のネームサーバー |
| NS | `cairn` | 2つ目のネームサーバー |
| NS | `cairn` | 3つ目のネームサーバー |
| NS | `cairn` | 4つ目のネームサーバー |

登録後、次の結果がCDKの出力した4件と一致することを確認する。

```bash
dig +short NS cairn.nibuno.dev
```

### 3. ログインとアプリを作る

```bash
npx cdk deploy CairnWebStack
```

このスタックは、ACM証明書、Cognito User Pool、ALB、ECS Fargate、CloudWatch Logsを作る。ALBとNAT Gateway、Fargateなどの利用料金が発生する。

### 4. 最初の利用者を作る

デプロイ結果の `UserPoolId` を使う。

```bash
aws cognito-idp admin-create-user \
  --region ap-northeast-1 \
  --user-pool-id <UserPoolId> \
  --username <メールアドレス> \
  --user-attributes Name=email,Value=<メールアドレス> Name=email_verified,Value=true \
  --desired-delivery-mediums EMAIL
```

メールで届いた仮パスワードを使って `https://cairn.nibuno.dev` にログインする。初回ログインでは新しいパスワードを設定する。

## 正常な状態

- HTTPはHTTPSへリダイレクトされる
- 未ログインではCognito Hosted UIへ移動する
- ログイン後は「Cairnを準備しています」と表示される
- `CairnWebStack` のECS serviceが1 taskを維持する
- ALB target groupの `/health` がhealthyになる

## 補足

- Cognito User PoolとRoute 53 Hosted Zoneは誤削除を避けるため、スタック削除時も保持する
- ECSはprivate subnetに置き、3000番ポートはALBのSecurity Groupからだけ許可する
- 初期構成はコスト優先でNAT Gatewayを1台にする
- アプリは認証情報を認可判断にまだ使わない。利用者別データを追加するときにALB署名検証を実装する
