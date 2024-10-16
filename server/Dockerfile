FROM python:3.12

WORKDIR /server

RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    libtesseract-dev

COPY Pipfile Pipfile.lock ./

RUN pip install pipenv
RUN pipenv requirements > requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY . ./

CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]