FROM python:3.9
WORKDIR /code
COPY pyproject.toml poetry.lock ./
RUN pip install poetry
RUN poetry config virtualenvs.create false
RUN poetry install --no-dev
COPY ./src ./src
COPY main.py .
CMD ["python", "main.py"]
