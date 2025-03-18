import json
import paho.mqtt.client as mqtt
import time

def lambda_handler(event, context):
    """
    Expects an API Gateway event with a JSON body
    {
      "body": "{\"action\":\"ON\"}"
    }

    """

    body_str = event.get("body", "{}")

    try:
        body = json.loads(body_str)
    except json.JSONDecodeError:
        body = {}


    action = body.get("action", "OFF")
    room_id = body.get("room")

    if room_id == None:
        return {
            "statusCode": 400,
            "body": json.dumps({"error": "Missing room id"})
        }


    broker_host = "test.mosquitto.org"
    broker_port = 1883
    topic = f"smartify_home/{room_id}/light"  

    client = mqtt.Client()
    client.connect(broker_host, broker_port, 60)

    client.loop_start()


    client.publish(topic, action)
    print(f"Published '{action}' to '{topic}'")

    time.sleep(1)

    client.loop_stop()
    client.disconnect()

    return {
        "statusCode": 200,
        "body": json.dumps({"message": f"{room_id} light turned {action}"})
    }