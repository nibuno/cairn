# Cairn design experiments

このディレクトリは、デザインシステムそのものではなく画面実験を置く。

- `cairn-design-preview.html`: 現在の「今日」画面の比較用プロトタイプ
- Styling: Tailwind CSS v4 Play CDNの標準ユーティリティのみ
- Production: Play CDNは使用せず、実アプリのビルドへTailwindを導入する

## 現在の仮説

最初の案にあった「今日の記録」という明確なまとまりを残し、独自イラスト、複数の強い色、KPI演出を外す。トップページは今日の操作だけに限定し、今週と最近の履歴は専用画面へ置く。

## フィードバック記録

- 最初の案: 整っているが、色と全体の仕上げに生成AIらしさがある
- 積み石案: 独創性を狙った造形自体が生成AIらしい
- 無彩色Tailwind案: 素直だが、すべてが同じ強さでごちゃつく
- 主領域＋補助領域案: 整理されたが、今週と最近の記録が専用ナビゲーションと重複
- 現在: 今日の記録だけ + Tailwind標準 + 単一アクセントを検証
- ページ見出しの「今日」と重複するため、カード内の「今日の記録」は視覚的に表示しない

採用判断は [Cairn Design System](../docs/cairn-design-system.md)、調査根拠は [Cairn Design Research](../docs/cairn-design-research.md) に記録する。
