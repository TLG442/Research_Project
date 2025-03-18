import numpy as np
import boto3
import json
import io
import random
import pandas as pd

s3 = boto3.client("s3")

BUCKET_NAME = "smartify-ml-data"
DATASET_FILE = "movements/dataset.csv"
MODEL_FILE = "Qlearn/model/q_table.npy"

class QLearningAgent:
    def __init__(self, state_space_size, action_space_size, learning_rate=0.1, discount_factor=0.95, epsilon=0.1):
        self.q_table = np.zeros((state_space_size, action_space_size))
        self.lr = learning_rate
        self.gamma = discount_factor
        self.epsilon = epsilon
        self.action_space_size = action_space_size

    def load_q_table(self, q_table):
        self.q_table = q_table

    def choose_action(self, state):
        if random.uniform(0, 1) < self.epsilon:
            return random.randint(0, self.action_space_size - 1)  # Explore (try something random)
        return np.argmax(self.q_table[state]) 

    def learn(self, state, action, reward, next_state, done):
        q_current = self.q_table[state, action]
        td_target = reward if done or next_state is None else reward + self.gamma * np.max(self.q_table[next_state])
        self.q_table[state, action] += self.lr * (td_target - q_current) 

def load_existing_q_table():
    try:
        response = s3.get_object(Bucket=BUCKET_NAME, Key=MODEL_FILE)
        np_bytes = io.BytesIO(response["Body"].read())
        return np.load(np_bytes)
    except s3.exceptions.NoSuchKey:
        print("No previous Q-table found. Starting fresh!")
        return None
    except Exception as e:
        print(f"Unexpected error while loading Q-table: {str(e)}")
        return None

def load_training_data():
    try:
        response = s3.get_object(Bucket=BUCKET_NAME, Key=DATASET_FILE)
        dataset_content = response["Body"].read().decode("utf-8")
        df = pd.read_csv(io.StringIO(dataset_content))
        return df[df["room"] != "Room 0"].reset_index(drop=True)  # Remove Room 0
    except s3.exceptions.NoSuchKey:
        print("Training dataset not found in S3. Nothing to train on!")
        return None
    except Exception as e:
        print(f"Error loading dataset: {str(e)}")
        return None

def room_to_index(room):
    """Convert room name to index"""
    try:
        return int(room.split(" ")[1]) - 1  # 0-based index
    except:
        print(f"Unexpected room format: {room}")  # Shouldn't happen

def train_q_learning():
    """Train Q-learning model using the movement dataset."""
    STATE_SPACE_SIZE = 7 * 96  # 7 days, each day with 96 time slots (15-minute intervals)
    ACTION_SPACE_SIZE = 8  # 8 rooms
    NUM_EPOCHS = 10

    agent = QLearningAgent(STATE_SPACE_SIZE, ACTION_SPACE_SIZE)

    # Load previous RL model
    existing_q_table = load_existing_q_table()
    if existing_q_table is not None:
        agent.load_q_table(existing_q_table)

    dataset = load_training_data()
    if dataset is None:
        print("No training data available. Returning existing model (or empty one if new).")
        return agent.q_table

    for epoch in range(NUM_EPOCHS):
        total_reward = 0
        for _, row in dataset.iterrows():
            room_index = room_to_index(row["room"])
            if room_index is None:
                continue  # Skip if room conversion failed

            # Convert timestamp into state representation
            timestamp = pd.to_datetime(row["timestamp"])
            state = timestamp.weekday() * 96 + (timestamp.hour * 4 + (timestamp.minute // 15))

            # Pick an action (random exploration vs learned knowledge)
            action = agent.choose_action(state)

            # Reward if the predicted room =  actual room
            reward = 1 if action == room_index else -1
            total_reward += reward

            agent.learn(state, action, reward, state, False)

        print(f"Epoch {epoch+1}/{NUM_EPOCHS} - Total Reward: {total_reward}")  # Log progress

    return agent.q_table

def lambda_handler(event, context):
    q_table = train_q_learning()

    np_bytes = io.BytesIO()
    np.save(np_bytes, q_table)
    np_bytes.seek(0)
    s3.put_object(Bucket=BUCKET_NAME, Key=MODEL_FILE, Body=np_bytes.getvalue())

    return {
        "statusCode": 200,
        "body": json.dumps({"message": "Incremental training complete. Updated model saved to S3!"})
    }