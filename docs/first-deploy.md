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

次のコマンドはローカル検証だけを行い、AWSリソースを作成しない。

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

## 2026-08-15の実行結果

- CloudflareからRoute 53へのNS委譲を確認した
- `CairnDomainStack` と `CairnWebStack` が `CREATE_COMPLETE` になった
- ACM証明書のDNS検証が完了した
- Cognito User PoolがLiteで作成された
- ECS serviceはdesired 1、running 1、deployment completedになった
- ALB target groupはhealthyになった
- `https://cairn.nibuno.dev` は未認証requestをCognitoへHTTP 302でredirectした
- Cognitoの初回利用者を作成し、Hosted UIから実際にログインできることを確認した

`CairnWebStack` のデプロイは約5分41秒だった。実際の利用者によるログインと、ログイン後の準備中画面はまだ確認していない。

CDK実行時のNode.jsは `/usr/local/bin/node` のv20.15.1で、2027年1月以降に公開されるAWS SDK v3にはNode.js 22以上が必要という警告が出た。ECSへデプロイしたcontainerは `node:22-alpine` を使っている。リポジトリにはローカルNodeのバージョン固定ファイルがまだないため、後続作業でNode.js 22へ揃える。

## 2026-08-15の停止結果

一時利用を終えたため、`CairnWebStack` を削除した。削除対象には次が含まれる。

- ALB、ECS cluster/service/task definition
- NAT Gateway、VPC、Security Group
- Cognito User Pool、User Pool Client、Hosted UI domain
- ACM certificate、CloudWatch Logs、ALBのRoute 53レコード

`CairnDomainStack` は残しているため、`cairn.nibuno.dev` のRoute 53 Hosted ZoneとCloudflareからのNS委譲は維持している。Webスタック削除に伴い、Cognitoのユーザーとログイン情報も削除された。

ECSのdesired countを0にする方法もあるが、ALBとNAT Gatewayの時間課金が残る。今回は固定費を止めるため、スタック削除を選択した。

## 補足

- 今回は一時利用のため、Cognito User PoolとRoute 53 Hosted Zoneもスタック削除時に削除する。本番運用へ移る前に保持設定を再検討する
- Cognitoユーザーを再デプロイ後も残す場合は、Cognitoを`CairnWebStack`から分離した`CairnAuthStack`として管理する。Webスタックを削除してもAuthスタックを残せるため、User Pool、Client、Hosted UI設定を維持できる。既存User Poolを同じ物理リソースとして再利用する設計を先に決め、`RemovalPolicy.RETAIN`だけで済ませない
- ECSはprivate subnetに置き、3000番ポートはALBのSecurity Groupからだけ許可する
- 初期構成はコスト優先でNAT Gatewayを1台にする
- アプリは認証情報を認可判断にまだ使わない。利用者別データを追加するときにALB署名検証を実装する

## 一時利用後の削除

先にCloudflareから `cairn` のNSレコード4件を削除し、その後に依存関係の逆順でスタックを削除する。

```bash
cd infra
npx cdk destroy CairnWebStack
npx cdk destroy CairnDomainStack
```

この削除によりCognito利用者も失われる。再デプロイ時はRoute 53のネームサーバーが変わるため、新しい4件をCloudflareへ登録し直す。
