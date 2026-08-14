# Cairn Design Research

- Date: 2026-08-14
- Purpose: Cairn Design System の判断根拠を保存する
- Applied rules: [cairn-design-system.md](./cairn-design-system.md)

この文書は調査結果を扱う。現在のHTML実験や採用済みコンポーネント仕様は扱わない。

## 1. 調査時の前提と制約

確認できたプロダクト情報は名称 `cairn`、タスクの完了切替、日付別の記録に相当する操作履歴だった。アプリ本体、利用者調査、analyticsはワークスペースになかったため、個人向けの学習・活動記録アプリと仮定した。

この仮定から、日常的な反復操作、モバイル利用、非公開の自己記録を優先した。実データが得られたら再検証する。

## 2. デジタル庁デザインシステム

参照した範囲:

- [カラー概要](https://design.digital.go.jp/dads/foundations/color/)
- [カラーのアクセシビリティ](https://design.digital.go.jp/dads/foundations/color/accessibility/)
- [タイポグラフィ](https://design.digital.go.jp/dads/foundations/typography/)
- [余白](https://design.digital.go.jp/dads/foundations/spacing/)

Cairnへ採用する考え方:

- 色を意味と役割で管理する
- 色だけで状態を伝えない
- 本文とラベルは大きさにかかわらず4.5:1以上を目標にする
- 余白、文字、コンポーネントを再利用可能な規則として定義する
- デザインシステムを完成画像ではなく、判断と受入条件として管理する

併せて [WCAG 2.2](https://www.w3.org/TR/WCAG22/) と [CUD推奨配色セット](https://cudo.jp/?page_id=1565) を参照した。

## 3. 「カラーグラフ理論」の整理

この語は曖昧である。数学の graph coloring は、隣接する頂点・辺・面を異なる色で塗り分ける理論で、最小色数を彩色数 `χ(G)` と呼ぶ。これはUIの配色理論とは別領域である。

Cairnの文脈では、色彩設計とデータ可視化の配色として次を区別する。

- Categorical: 順序のない項目
- Sequential: 小から大への連続値
- Diverging: 基準値から両方向への差
- Cyclic: 曜日や時刻などの循環値
- Semantic: success、warning、danger、info

採用する規則:

- カテゴリ色と状態色を兼用しない
- 色だけで系列や増減を示さず、ラベル、値、線種、マーカーを併用する
- 凡例より直接ラベルを優先する
- 非選択系列は透明化ではなくneutralへ切り替える
- 初期表示は6系列程度までに抑える
- 白黒表示、色覚特性、ライト背景で識別性を検証する

参考:

- [Encyclopedia of Mathematics: Graph colouring](https://encyclopediaofmath.org/wiki/Graph_colouring)
- [IBM Design Language: Data visualization](https://www.ibm.com/design/language/data-visualization/design/basics/)
- [Carbon: Data visualization color palettes](https://v10.carbondesignsystem.com/data-visualization/color-palettes/)
- [ColorBrewer 2.0](https://colorbrewer2.org/)

## 4. モチベーション理論

### 自己決定理論

自律性、有能感、関係性を重視する。

- 自律性: 目標、頻度、通知、公開範囲を自分で選べる
- 有能感: 小さな記録を即時反映し、具体的に示す
- 関係性: 比較より支援、共有はopt-in

参考: [Ryan & Deci](https://doi.org/10.1037/0003-066X.55.1.68)

### 目標設定理論

曖昧な目標より、具体的で調整可能な目標と進捗フィードバックを使う。「毎日」だけでなく「週3回」「合計90分」「今週は休止」を許可する。

参考: [Locke & Latham](https://doi.org/10.1037/0003-066X.57.9.705)

### 期待理論

行動前に「次に何をするか」「実行すると何が変わるか」「利用者にどんな価値があるか」を理解できるようにする。

参考: [Van Eerde & Thierry](https://doi.org/10.1037/0021-9010.81.5.575)

### 進捗原理

完了数だけでなく、何が前進したかを残す。途中保存、再開、累積成果を一級の状態として扱う。

参考: [The Progress Principle](https://progressprinciple.com/portfolio-items/the-progress-principle-and-the-psychology-of-everyday-work-life/)

### 外発報酬と習慣形成

ポイント、バッジ、ランキングを基礎機能にしない。統制的な報酬、ストリーク喪失の脅し、強制競争を避ける。最小単位、安定した文脈、自己モニタリングを支援し、「21日で習慣化」のような断定をしない。

参考:

- [Extrinsic rewards and intrinsic motivation](https://doi.org/10.1037/0033-2909.125.6.627)
- [Habit and behavior meta-analysis](https://doi.org/10.1037/mot0000294)
- [Habit formation systematic review](https://pmc.ncbi.nlm.nih.gov/articles/PMC11641623/)

## 5. Taste Skillの監査

対象: `Leonxlnx/taste-skill` main、commit `e988add20dab0fa97d7a76781c48961c8184288e`（2026-07-23）。インストールやスクリプト実行はしていない。

確認した範囲:

- 公式サイト、README、skillファイル
- `skill.sh`
- 画像処理用 `.mjs`
- plugin manifest
- 危険なshell操作、秘密情報参照、外部送信、命令上書きの静的検索

確認範囲では、資格情報の窃取や外部送信を行う明白なコードは見つからなかった。ただし安全とは断定しない。

- v2はexperimental
- mainの内容は将来変わる
- `npx skills add` は外部CLIとリモート指示を取り込む供給網上の境界になる
- ランディングページ向けの強い演出はCairnの日常UIに合わない

今回は導入せず、briefを先に読む、audit-first、状態を同時に設計する、出荷前検査を行う、という原則だけを手動採用した。

- [Taste Skill](https://www.tasteskill.dev/)
- [Repository at reviewed commit](https://github.com/Leonxlnx/taste-skill/tree/e988add20dab0fa97d7a76781c48961c8184288e)

## 6. 共有されたX投稿

[共有された投稿](https://x.com/laterinfo_/status/2087767603905544509) で紹介された資料源を次のように扱う。

- [The Brand Identity](https://the-brandidentity.com/): ブランド事例とケーススタディ
- [BP&O](https://bpando.org/): 設計理由の分析
- [Savee](https://savee.com/): ムードボード探索
- [The Dieline](https://thedieline.com/): パッケージ、素材、ラベル表現
- [Cosmos](https://www.cosmos.so/): 類似画像探索

Cairnでは The Brand Identity と BP&O の「理由まで読む」姿勢を優先する。どの事例も画面構造やpaletteをそのまま転写しない。

## 7. 調査から採用した原則

1. 記録までを1操作にする
2. 目標、頻度、通知を利用者が制御できる
3. 即時・具体的・非評価的なフィードバックを返す
4. 連続日数だけでなく、累計、頻度、再開を示す
5. 休息、スキップ、目標変更を正式な操作にする
6. 比較や公開はopt-inにする
7. 色を役割で分離し、色だけで意味を伝えない
8. ローディング、空、エラーを成功状態と同時に設計する

## 8. 未検証

- 実際の利用者と利用頻度
- 公開・共有機能の有無
- 実アプリの画面遷移と既存語彙
- analytics上の主要操作
- Cairn固有のブランド資産

これらが判明したら、デザインシステムの前提と情報設計を更新する。
