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
 
