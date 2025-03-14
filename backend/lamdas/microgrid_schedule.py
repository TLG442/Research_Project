import json
import numpy as np
import boto3
import json
import logging
from electric_custom_encoder import CustomEncoder
from boto3.dynamodb.conditions import Key
import datetime
from decimal import Decimal
from deap import base, creator, tools, algorithms
import random

logger = logging.getLogger()
logger.setLevel(logging.INFO)

dyanamodb_table_name = 'current-scheduler'
dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(dyanamodb_table_name)

get_Method = 'GET'
post_Method = 'POST'
health_check_path = '/health'
scheduler = '/scheduler'


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

    print(f"Saved 24-hour schedule for user {user_id} on {date}.")

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

    
    ##for testing purpose
    # Example Usage
if __name__ == "__main__":
    user_id = "user123"
    run_ga_for_day(user_id)  # Run GA to generate a 24-hour schedule

    print(get_schedule(user_id, 14))  # Get schedule for 2 PM
    print(get_daily_schedule(user_id))  # Get full day schedule


    


 
def cost_function(schedule, solar_power, load_demand, grid_price, battery_capacity, battery_soc, battery_efficiency, max_charge_rate, max_discharge_rate):
    """Compute the total cost for a given energy schedule."""
    total_cost = 0
    battery_energy = battery_capacity * (battery_soc / 100)
    for t in range(len(schedule)):
        P_solar, P_battery, P_grid = schedule[t]
        # Ensure power balance
        if abs(P_solar + P_battery + P_grid - load_demand[t]) > 0.1:
            return float('inf')  # Penalize invalid schedules
 
        # Battery Constraints
        if P_battery > 0:  # Discharging
            if battery_energy < P_battery:
                return float('inf')
            battery_energy -= P_battery / battery_efficiency
        else:  # Charging
            if battery_energy - P_battery > battery_capacity:
                return float('inf')
            battery_energy -= P_battery * battery_efficiency
 
        # Calculate cost
        total_cost += P_grid * grid_price[t]
 
    return total_cost
 
def particle_swarm_optimization(solar_power, load_demand, grid_price, battery_capacity, battery_soc, battery_efficiency, max_charge_rate, max_discharge_rate, num_particles=30, iterations=100):
    """PSO-based optimization for energy scheduling."""
    time_slots = len(solar_power)
    # Initialize particles (random schedules)
    particles = np.random.uniform(0, 1, (num_particles, time_slots, 3))
    velocities = np.random.uniform(-0.1, 0.1, (num_particles, time_slots, 3))
    p_best = particles.copy()
    p_best_scores = np.array([cost_function(p, solar_power, load_demand, grid_price, battery_capacity, battery_soc, battery_efficiency, max_charge_rate, max_discharge_rate) for p in p_best])
    g_best = p_best[np.argmin(p_best_scores)]
 
    for _ in range(iterations):
        for i in range(num_particles):
            # Update velocity
            velocities[i] = 0.7 * velocities[i] + 0.2 * np.random.rand() * (p_best[i] - particles[i]) + \
                            0.1 * np.random.rand() * (g_best - particles[i])
 
            # Update positions
            particles[i] += velocities[i]
 
            # Clip values within limits
            particles[i] = np.clip(particles[i], 0, [solar_power, max_discharge_rate, float('inf')])
 
            # Evaluate new solution
            score = cost_function(particles[i], solar_power, load_demand, grid_price, battery_capacity, battery_soc, battery_efficiency, max_charge_rate, max_discharge_rate)
            if score < p_best_scores[i]:
                p_best[i] = particles[i].copy()
                p_best_scores[i] = score
 
        # Update global best
        g_best = p_best[np.argmin(p_best_scores)]
 
    return g_best.tolist()

 
def lambda_handler(event, context):
    """AWS Lambda function to optimize energy scheduling."""
    # Parse input JSON object
    solar_power = event["solar_power"]
    load_demand = event["load_demand"]
    grid_price = event["grid_price"]
    battery_capacity = event["battery_capacity"]
    battery_soc = event["battery_soc"]
    battery_efficiency = event["battery_efficiency"]
    max_charge_rate = event["max_charge_rate"]
    max_discharge_rate = event["max_discharge_rate"]
 
    # Run optimization
    optimized_schedule = particle_swarm_optimization(solar_power, load_demand, grid_price, battery_capacity, battery_soc, battery_efficiency, max_charge_rate, max_discharge_rate)
 
    # Return response
    return {
        'statusCode': 200,   #returning success code.
        'body': json.dumps({
            "optimized_schedule": optimized_schedule
        })
    }