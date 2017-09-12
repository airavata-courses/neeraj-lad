"""
/*
 * Source:
 * http://flask.pocoo.org/docs/0.12/quickstart/#a-minimal-application
 * Microservice2 (ms2.py) listens on port 5000. It connects to Microservice3 (ms3.php) which listens on port 9080.
 *
 */
"""

from flask import Flask
from urllib import urlopen

app = Flask(__name__)
@app.route('/<int:id>/')
def get_row(id):
    ms3 = 'http://localhost'
    port = 9080
    path = 'ms3.php?id=%d' % id
    url = ms3 + ':' + str(port) + '/' + path
    u = urlopen(url)
    s = u.read()
    return s
