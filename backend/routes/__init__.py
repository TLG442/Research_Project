# routes/__init__.py
from .electric_log_data import log_data
from .electric_accumulate_power_consumption import get_accumulated_data
from .electric_daily_power_consumption import get_daily_consumption
from .electric_predict import predict