FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 \
    PORT=8080 \
    WORDFEUD_DATA_DIR=/data

WORKDIR /app
COPY index.html /app/index.html
COPY server.py /app/server.py

EXPOSE 8080
VOLUME ["/data"]
CMD ["python", "/app/server.py"]
