package com.example.geotag

import android.content.ContentValues
import android.content.Context
import android.database.Cursor
import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteOpenHelper

class RoomDatabaseHelper(context: Context) : SQLiteOpenHelper(context, DATABASE_NAME, null, DATABASE_VERSION) {
    data class Room(
        val roomName: String,
        val minLat: Float,
        val maxLat: Float,
        val minLon: Float,
        val maxLon: Float
    )
    companion object {
        private const val DATABASE_NAME = "GeoTag.db"
        private const val DATABASE_VERSION = 2

        // User table
        private const val TABLE_USERS = "Users"
        private const val COLUMN_USER_ID = "userId"
        private const val COLUMN_EMAIL = "email"
        private const val COLUMN_PASSWORD = "password"

        // Calibrated rooms table
        private const val TABLE_ROOMS = "CalibratedRooms"
        private const val COLUMN_ROOM_NAME = "roomName"
        private const val COLUMN_MIN_LAT = "minLat"
        private const val COLUMN_MAX_LAT = "maxLat"
        private const val COLUMN_MIN_LON = "minLon"
        private const val COLUMN_MAX_LON = "maxLon"

        // Lights table
        private const val TABLE_LIGHTS = "Lights"
        private const val COLUMN_LIGHT_NAME = "lightName"
        private const val COLUMN_BRIGHTNESS = "brightness"
        private const val COLUMN_MANUAL_CONTROL = "manualControl"
    }

    override fun onCreate(db: SQLiteDatabase) {
        // Create Users table
        val createUserTableQuery = """
            CREATE TABLE $TABLE_USERS (
                $COLUMN_USER_ID INTEGER PRIMARY KEY AUTOINCREMENT,
                $COLUMN_EMAIL TEXT UNIQUE,
                $COLUMN_PASSWORD TEXT
            )
        """.trimIndent()

        // Create CalibratedRooms table
        val createRoomsTableQuery = """
            CREATE TABLE $TABLE_ROOMS (
                $COLUMN_ROOM_NAME TEXT PRIMARY KEY,
                $COLUMN_USER_ID INTEGER,
                $COLUMN_MIN_LAT REAL,
                $COLUMN_MAX_LAT REAL,
                $COLUMN_MIN_LON REAL,
                $COLUMN_MAX_LON REAL,
                FOREIGN KEY ($COLUMN_USER_ID) REFERENCES $TABLE_USERS($COLUMN_USER_ID)
            )
        """.trimIndent()

        // Create Lights table
        val createLightsTableQuery = """
            CREATE TABLE $TABLE_LIGHTS (
                $COLUMN_LIGHT_NAME TEXT,
                $COLUMN_ROOM_NAME TEXT,
                $COLUMN_BRIGHTNESS INTEGER,
                $COLUMN_MANUAL_CONTROL INTEGER,
                FOREIGN KEY ($COLUMN_ROOM_NAME) REFERENCES $TABLE_ROOMS($COLUMN_ROOM_NAME)
            )
        """.trimIndent()

        db.execSQL(createUserTableQuery)
        db.execSQL(createRoomsTableQuery)
        db.execSQL(createLightsTableQuery)
    }

    override fun onUpgrade(db: SQLiteDatabase, oldVersion: Int, newVersion: Int) {
        db.execSQL("DROP TABLE IF EXISTS $TABLE_LIGHTS")
        db.execSQL("DROP TABLE IF EXISTS $TABLE_ROOMS")
        db.execSQL("DROP TABLE IF EXISTS $TABLE_USERS")
        onCreate(db)
    }
    fun getRoomLabelForBSSID(bssid: String): String? {
        val db = this.readableDatabase
        val cursor: Cursor = db.query(
            TABLE_ROOMS,                // The table containing room data
            arrayOf(COLUMN_ROOM_NAME),  // Column storing the room name/label
            "$COLUMN_ROOM_NAME = ?",    // Query condition (you could also have a dedicated column for BSSID if you store that)
            arrayOf(bssid),             // BSSID as the query parameter
            null, null, null
        )

        var label: String? = null
        if (cursor.moveToFirst()) {
            label = cursor.getString(cursor.getColumnIndexOrThrow(COLUMN_ROOM_NAME))
        }
        cursor.close()
        return label
    }
    // In RoomDatabaseHelper.kt
    fun deleteCalibratedRoom(userId: Int, roomName: String) {
        val db = writableDatabase
        db.delete(
            "CalibratedRooms",
            "userId=? AND roomName=?",
            arrayOf(userId.toString(), roomName)
        )
        db.close()
    }
    // User management
    fun registerUser(email: String, password: String): Long {
        val db = writableDatabase
        val values = ContentValues().apply {
            put(COLUMN_EMAIL, email)
            put(COLUMN_PASSWORD, password)
        }
        return db.insert(TABLE_USERS, null, values)
    }

    fun loginUser(email: String, password: String): Int {
        val db = readableDatabase
        val query = "SELECT $COLUMN_USER_ID FROM $TABLE_USERS WHERE $COLUMN_EMAIL = ? AND $COLUMN_PASSWORD = ?"
        val cursor = db.rawQuery(query, arrayOf(email, password))
        return if (cursor.moveToFirst()) {
            val userId = cursor.getInt(cursor.getColumnIndexOrThrow(COLUMN_USER_ID))
            cursor.close()
            userId
        } else {
            cursor.close()
            -1 // Invalid credentials
        }
    }

    // Calibrated rooms management
    fun saveCalibratedRoom(userId: Int, roomName: String, minLat: Float, maxLat: Float, minLon: Float, maxLon: Float) {
        val db = writableDatabase
        val values = ContentValues().apply {
            put(COLUMN_USER_ID, userId)
            put(COLUMN_ROOM_NAME, roomName)
            put(COLUMN_MIN_LAT, minLat)
            put(COLUMN_MAX_LAT, maxLat)
            put(COLUMN_MIN_LON, minLon)
            put(COLUMN_MAX_LON, maxLon)
        }
        db.insertWithOnConflict(TABLE_ROOMS, null, values, SQLiteDatabase.CONFLICT_REPLACE)
    }

    fun getCalibratedRooms(userId: Int): List<Room> {
        val db = readableDatabase
        val rooms = mutableListOf<Room>()
        val cursor = db.query(
            TABLE_ROOMS,
            null,
            "$COLUMN_USER_ID = ?",
            arrayOf(userId.toString()),
            null,
            null,
            null
        )
        cursor.use {
            if (it.moveToFirst()) {
                do {
                    val roomName = it.getString(it.getColumnIndexOrThrow(COLUMN_ROOM_NAME))
                    val minLat = it.getFloat(it.getColumnIndexOrThrow(COLUMN_MIN_LAT))
                    val maxLat = it.getFloat(it.getColumnIndexOrThrow(COLUMN_MAX_LAT))
                    val minLon = it.getFloat(it.getColumnIndexOrThrow(COLUMN_MIN_LON))
                    val maxLon = it.getFloat(it.getColumnIndexOrThrow(COLUMN_MAX_LON))
                    rooms.add(Room(roomName, minLat, maxLat, minLon, maxLon))
                } while (it.moveToNext())
            }
        }
        return rooms
    }
    // Light management
    fun saveLights(roomName: String, lights: List<RoomSetupActivity.Light>) {
        val db = writableDatabase
        db.beginTransaction()
        try {
            db.delete(TABLE_LIGHTS, "$COLUMN_ROOM_NAME=?", arrayOf(roomName))

            for (light in lights) {
                val values = ContentValues().apply {
                    put(COLUMN_ROOM_NAME, roomName)
                    put(COLUMN_LIGHT_NAME, light.name)
                    put(COLUMN_BRIGHTNESS, light.brightness)
                    put(COLUMN_MANUAL_CONTROL, if (light.manualControl) 1 else 0)
                }
                db.insert(TABLE_LIGHTS, null, values)
            }
            db.setTransactionSuccessful()
        } finally {
            db.endTransaction()
        }
    }

    fun loadLights(roomName: String): List<RoomSetupActivity.Light> {
        val db = readableDatabase
        val lights = mutableListOf<RoomSetupActivity.Light>()
        val cursor = db.query(
            TABLE_LIGHTS,
            null,
            "$COLUMN_ROOM_NAME=?",
            arrayOf(roomName),
            null,
            null,
            null
        )

        cursor.use {
            if (it.moveToFirst()) {
                do {
                    val lightName = it.getString(it.getColumnIndexOrThrow(COLUMN_LIGHT_NAME))
                    val brightness = it.getInt(it.getColumnIndexOrThrow(COLUMN_BRIGHTNESS))
                    val manualControl = it.getInt(it.getColumnIndexOrThrow(COLUMN_MANUAL_CONTROL)) == 1
                    lights.add(RoomSetupActivity.Light(lightName, brightness, manualControl))
                } while (it.moveToNext())
            }
        }
        return lights
    }
}