# routes/__init__.py
from .electric_log_data import log_data
from .electric_accumulate_power_consumption import get_accumulated_data
from .electric_daily_power_consumption import get_daily_consumption
from .electric_predict import predict
from .water_flow import log_water_usage
from .get_water_flow import get_water_usage
from .pressure_classify import classify_leak