# 使用するベースイメージ
FROM python:3.9-slim
# 作業ディレクトリの作成
WORKDIR /app
# 必要なシステムパッケージのインストール
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*
# 依存関係をコピーしてインストール
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
# アプリケーションコードをコピー
# COPY main.py .
COPY . .
#同じ意味
# ポートを指定
EXPOSE 8080
# アプリケーションを実行
CMD ["python", "main.py"]
