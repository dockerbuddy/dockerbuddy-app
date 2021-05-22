FROM python:3.9-slim-buster

WORKDIR /app

COPY * /app/

RUN pip3 install -r requirements.txt

CMD [ "python3", "-m" , "flask", "run", "--host=0.0.0.0"]