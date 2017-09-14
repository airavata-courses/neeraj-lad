FROM neerajlad/sga:part1

WORKDIR /app

ADD . /app

RUN pip install -r requirements.txt

EXPOSE 5000

CMD ["python", "ms2.py"]
