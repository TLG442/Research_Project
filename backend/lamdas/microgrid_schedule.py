import json
import numpy as np
 
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