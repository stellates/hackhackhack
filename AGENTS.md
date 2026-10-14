# AGENTS.md - アーキテクチャとエージェント向け開発ガイド

本ドキュメントは、AIコーディングエージェントおよび開発者が「THE HOLLYWOOD HACKER」の内部実装を迅速に把握・拡張するための設計仕様書です。

---

## 1. システム概要

本アプリケーションは、ドラマ・映画風の「ハッカータイピング」を再現するクライアント完結型シングルページアプリケーションです。
外部API、バックエンド、外部画像・音声アセットを一切持たず、純粋なWeb標準API（TypeScript + HTML5 Canvas + Web Audio API）のみで構築されています。

---

## 2. ディレクトリ構成

```
hackhackhack/
├── index.html            # メインHTML（UIレイアウト、CRTオーバーレイ、モーダル）
├── package.json          # プロジェクト定義（Vite, TypeScript）
├── tsconfig.json         # TypeScript設定
├── README.md             # ユーザー向けドキュメント
├── AGENTS.md             # 本アーキテクチャガイド
└── src/
    ├── vite-env.d.ts     # Vite型定義
    ├── style.css         # サイバーパンクUI、スキャンライン、グリッドCSS
    ├── sound.ts          # Web Audio APIプロシージャル音声合成マネージャー
    ├── hackerData.ts     # ハッカーコード断片、ログ、演出イベント定義
    ├── evaluator.ts      # 打鍵メトリクス、採点、称号・ツッコミ判定
    ├── radar.ts          # Canvasによるサイバー脅威レーダー描画
    ├── canvasExporter.ts # 認定証PNG画像ジェネレーター
    └── main.ts           # ゲームループ、入力処理、状態遷移コントローラー
```

---

## 3. 各モジュールの設計と責務

### `src/sound.ts` (`SoundManager`)
- **責務**: Web Audio APIによるシンセサイズ音声のリアルタイム生成。
- **特徴**:
  - `playKeyClick(isEnter)`: バンドパスノイズ＋サイン波減衰によるリアルなメカニカル打鍵音。Enter時は重低音オシレーターを追加。
  - `playLogBeep()`: ターミナルログ更新時のSF風高周波ビープ音。
  - `playAlarm()`: 脅威検出時の鋸波（Sawtooth）サイレン音。
  - `playCountdownTick()`: 残り5秒以下の矩形波カウントダウン音。
  - `playAccessGranted()`: 侵入成功時の7音サイバーアルペジオ＋サブベース。
  - ブラウザのAutoplay Policyに準拠し、初回のユーザー入力（キーボード打鍵またはボタンクリック）でAudioContextをResume。

### `src/hackerData.ts`
- **責務**: 雰囲気抜群のコードスニペット、ターミナルログ、ドラマチックイベントのデータソース。
- **内容**:
  - `HACKER_CODE_SNIPPETS`: LinuxカーネルROPチェーン、量子格子アニーリング、x86_64アセンブリ、パケット偽装などのリアル風コード。
  - `TERMINAL_LOGS`: 侵入進行に伴い流れるセキュリティログ。
  - `DRAMATIC_EVENTS`: 進捗率（15%, 35%, 60%, 85%, 98%）に応じた大げさな警告バナー定義。
  - `generateHexDumpLine()`: リアルタイムに生成されるランダムHexダンプ文字列。

### `src/evaluator.ts` (`evaluateTyping`)
- **責務**: 打鍵データの分析、スコア計算、称号・ツッコミ寸評の決定。
- **評価軸**:
  - 基礎打鍵数（Base Keystrokes）
  - 瞬間最高速度（Peak KPS）
  - **劇的タメ（Dramatic Pauses）**: 猛烈な連打（>6 KPS）の直後に0.4〜1.8秒静止した回数。映画の「…ビンゴ」仕草を高く評価。
  - Enter強打回数（Enter Hits）
  - 最大コンボ数（Max Combo）
- **出力**: スコア、ランク（SSS〜F）、称号（Title）、AIツッコミ（Roast）、スタイルタグ（StyleTag）。

### `src/radar.ts` (`CyberRadar`)
- **責務**: HTML5 Canvasを用いたサイバーレーダー画面のリアルタイム描画。
- **特徴**: スイープラインの回転、タイピング連動による脅威ノード（Blip）の動的追加・減衰アニメーション。

### `src/canvasExporter.ts` (`generateReportCardCanvas` / `downloadReportCard`)
- **責務**: 結果画面の認定証（1200×675px）をCanvas APIで完全描画し、PNGとしてダウンロード。
- **特徴**: ネオングロー、サイバーグリッド、枠線ブラケット、ランクバッジ、文字の自動折り返し描画を単一モジュールで完結。

### `src/main.ts` (`HollywoodHackerGame`)
- **責務**: アプリケーション全体のライフサイクル管理。
- **状態遷移**: `START` → `PLAYING` → `FINISHED`
- **入力ハンドリング**: `keydown`イベント（どのキーでもコードを前進・音声を再生）およびスマホ用の「RAPID HACK」タッチボタン。

---

## 4. ビルド・検証手順

```bash
# 依存確認とビルド検証
npm run build

# 開発サーバー起動（デフォルトポート 5173）
npm run dev
```

---

## 5. 将来の拡張候補

1. **サウンドカスタマイズ**: 青軸／茶軸／タイプライター／レトロPCなど打鍵音の切り替え。
2. **テーマ切り替え**: マトリックスグリーン、サイバーシアン、アンバー（琥珀色）、レッドアラート。
3. **オンラインランキング**: Firebase / Supabase等を用いたグローバルスコアボードの追加（要バックエンド連携）。
