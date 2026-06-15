# AI Chat App

## 概要

OpenAI APIを使用したAIチャットWebアプリです。
Streamlitを用いてブラウザ上で動作します。

## デモ

ローカル環境で動作します。

## 使用技術

* Python
* Streamlit
* OpenAI API

## 機能

* ChatGPT風UIでのチャット
* 会話履歴の保持（セッション管理）
* 会話リセット機能
* 環境変数によるAPIキー管理

## セットアップ方法

### ① リポジトリをクローン

```bash
git clone <URL>
cd <フォルダ名>
```

### ② 仮想環境作成

```bash
python -m venv venv
```

### ③ 仮想環境起動（Windows）

```bash
venv\Scripts\activate
```

### ④ パッケージインストール

```bash
pip install -r requirements.txt
```

### ⑤ APIキー設定

```bash
setx OPENAI_API_KEY "あなたのAPIキー"
```

### ⑥ アプリ起動

```bash
streamlit run app.py
```

## 工夫した点

* ChatGPT風UIを実装し、ユーザー体験を向上
* セッション管理により会話履歴を保持
* APIキーを環境変数で管理し、セキュリティを考慮

## 今後の改善

* ストリーミング応答の実装
* モデル選択機能
* UIデザインの強化
