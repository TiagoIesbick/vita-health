FROM python:3.12

WORKDIR /server

EXPOSE 8000

COPY Pipfile Pipfile.lock ./

RUN pip install pipenv
RUN pipenv requirements > requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY . ./

CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]