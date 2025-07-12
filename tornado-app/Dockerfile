FROM python:3.9-slim

ARG COMMIT_HASH
ARG APP_VERSION
WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV COMMIT_HASH=${COMMIT_HASH}
ENV APP_VERSION=${APP_VERSION}

EXPOSE 8888

CMD ["python", "main.py"]
