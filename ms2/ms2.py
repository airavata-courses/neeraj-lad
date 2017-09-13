"""
/*
 * Source:
 * http://flask.pocoo.org/docs/0.12/quickstart/#a-minimal-application
 * Microservice2 (ms2.py) listens on port 5000. It connects to Microservice3 (ms3.php) which listens on port 9080.
 *
 */
"""

import pika

exchange = 'gateway_exchange'

myName = 'microservice2'

myKey = '#.ms2.#'
gwKey = 'gw'

def send(key, message):
    send_conn = pika.BlockingConnection(pika.ConnectionParameters(host='localhost'))
    send_ch = send_conn.channel()

    send_ch.exchange_declare(exchange=exchange,
                             exchange_type='topic')

    send_ch.basic_publish(exchange=exchange,
                          routing_key=key,
                          body=message)
    print(" [x] Sent %r:%r" % (key, message))
    send_conn.close()

def receive():
    connection = pika.BlockingConnection(pika.ConnectionParameters(host='localhost'))
    channel = connection.channel()
    channel.exchange_declare(exchange=exchange,
                             exchange_type='topic')

    result = channel.queue_declare(exclusive=True)
    queue_name = result.method.queue

    binding_key = myKey
    channel.queue_bind(exchange=exchange,
                       queue=queue_name,
                       routing_key=binding_key)

    print(' [*] Waiting for messages. To exit press CTRL+C')

    def callback(ch, method, properties, body):
        print(" [x] Received %r:%r" % (method.routing_key, body))
        send('Response-from-' + myName + '-to-.' + gwKey, body)

    channel.basic_consume(callback,
                          queue=queue_name,
                          no_ack=True)
    channel.start_consuming()

if __name__ == "__main__":
    receive()
