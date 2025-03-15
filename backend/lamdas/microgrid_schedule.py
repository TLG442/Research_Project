import json
import numpy as np
import boto3
import logging
from electric_custom_encoder import CustomEncoder
from boto3.dynamodb.conditions import Key
import datetime
from decimal import Decimal
from deap import base, creator, tools, algorithms
import random

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# DynamoDB Configuration
dynamodb_table_name = 'CurrentScheduler'
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(dynamodb_table_name)

# HTTP Methods
GET_METHOD = 'GET'
POST_METHOD = 'POST'
PATCH_METHOD = 'PATCH'
DELETE_METHOD = 'DELETE'

# API Paths
HEALTH_CHECK_PATH = '/health'
SCHEDULE_PATH = '/schedule'
ALL_SCHEDULES_PATH = '/schedules'

# GA Optimization Weights
W1 = 0.6  # Minimize Grid Usage
W2 = 0.4  # Maximize Renewable Energy

# Define Fitness Function
def fitness(individual):
    gc, sp, bc = individual  # Grid, Solar, Battery
    total_power = gc + sp + bc

    if total_power == 0:
        return (0,)  # Avoid division by zero

    return (W1 * (1 - gc / total_power) + W2 * ((sp + bc) / total_power),)

# GA Components
creator.create("FitnessMax", base.Fitness, weights=(1.0,))
creator.create("Individual", list, fitness=creator.FitnessMax)

toolbox = base.Toolbox()
toolbox.register("grid_current", random.uniform, 0, 5)
toolbox.register("solar_power", random.uniform, 0, 5)
toolbox.register("battery_current", random.uniform, 0, 5)

toolbox.register("individual", tools.initCycle, creator.Individual, 
                 (toolbox.grid_current, toolbox.solar_power, toolbox.battery_current), n=1)
toolbox.register("population", tools.initRepeat, list, toolbox.individual)

toolbox.register("mate", tools.cxBlend, alpha=0.5)
toolbox.register("mutate", tools.mutGaussian, mu=0, sigma=1, indpb=0.2)
toolbox.register("select", tools.selTournament, tournsize=3)
toolbox.register("evaluate", fitness)

# Save 24-Hour Schedules to DynamoDB
def save_schedule(user_id, date, schedules):
    with table.batch_writer() as batch:
        for hour, best_solution in enumerate(schedules):
            date_hour = f"{date}-{hour:02d}"  # Format as YYYY-MM-DD-HH
            
            item = {
                "user_id": user_id,
                "date_hour": date_hour,
                "grid_current": Decimal(str(best_solution[0])),
                "solar_power": Decimal(str(best_solution[1])),
                "battery_current": Decimal(str(best_solution[2])),
                "status": "active"
            }
            batch.put_item(Item=item)

    logger.info(f"Saved 24-hour schedule for user {user_id} on {date}.")

# Run GA for 24-Hour Scheduling
def run_ga_for_day(user_id):
    today = datetime.datetime.now().strftime("%Y-%m-%d")  # Get today's date
    schedules = []
    
    for hour in range(24):
        population = toolbox.population(n=50)
        ngen, cxpb, mutpb = 20, 0.7, 0.2

        algorithms.eaSimple(population, toolbox, cxpb, mutpb, ngen, verbose=False)
        best_ind = tools.selBest(population, k=1)[0]
        schedules.append(best_ind)

    save_schedule(user_id, today, schedules)

# Fetch Schedule for a Specific Hour
def get_schedule(user_id, hour):
    today = datetime.datetime.now().strftime("%Y-%m-%d")
    date_hour = f"{today}-{hour:02d}"
    
    response = table.get_item(Key={"user_id": user_id, "date_hour": date_hour})
    
    if "Item" in response:
        return response["Item"]
    else:
        return {"message": f"No schedule found for {date_hour}."}

# Fetch Full 24-Hour Schedule
def get_daily_schedule(user_id):
    today = datetime.datetime.now().strftime("%Y-%m-%d")
    response = table.query(
        KeyConditionExpression="user_id = :user_id AND begins_with(date_hour, :date)",
        ExpressionAttributeValues={":user_id": user_id, ":date": today}
    )

    return response.get("Items", [])


# Lambda API Gateway Handler
def lambda_handler(event, context):
    logger.info(f"Received event: {json.dumps(event)}")
    http_method = event['httpMethod']
    path = event['path']

    if http_method == GET_METHOD and path == HEALTH_CHECK_PATH:
        response = build_response(200, {"message": "Health Check OK"})

    elif http_method == GET_METHOD and path == ALL_SCHEDULES_PATH:
        user_id = event.get('queryStringParameters', {}).get('userId')
        if not user_id:
            response = build_response(400, {"error": "Missing userId"})
        else:
            response = build_response(200, get_daily_schedule(user_id))

    elif http_method == POST_METHOD and path == ALL_SCHEDULES_PATH:
        body = json.loads(event.get('body', '{}'))
        user_id = body.get('user_id')
        
        if not user_id:
            response = build_response(400, {"error": "Missing user_id"})
        else:
            run_ga_for_day(user_id)
            response = build_response(200, {"message": f"24-hour schedule created for {user_id}"})

    else:
        response = build_response(404, {"error": "Resource Not Found"})

    return response

# Response Builder Function
def build_response(status_code, body=None):
    response = {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    }
    if body is not None:
        response['body'] = json.dumps(body, cls=CustomEncoder)
    return response


# For Testing
if __name__ == "__main__":
    user_id = "user123"
    run_ga_for_day(user_id)  # Run GA to generate a 24-hour schedule
    print(get_schedule(user_id, 14))  # Get schedule for 2 PM
    print(get_daily_schedule(user_id))  # Get full day schedule
