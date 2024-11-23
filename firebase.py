import firebase_admin
from firebase_admin import credentials, firestore

# Path to your Firebase service account key
FIREBASE_KEY_PATH = "firebase_key.json"

# Initialize Firebase app
cred = credentials.Certificate(FIREBASE_KEY_PATH)
firebase_app = firebase_admin.initialize_app(cred)

# Initialize Firestore client
db = firestore.client()

def get_firestore_client():
    """
    Returns the Firestore client instance.
    """
    return db
