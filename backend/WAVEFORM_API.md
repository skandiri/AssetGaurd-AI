# Waveform API Documentation

## Overview
The Waveform API processes sensor data from accelerometers and returns calibrated g-force values along with metadata for analysis.

## Endpoint

### GET /api/waveforms/:sensorId/:timestamp

Retrieve and process waveform data for a specific sensor at a given timestamp.

**URL Parameters:**
- `sensorId` - Unique identifier for the sensor (e.g., "SENSOR_001")
- `timestamp` - ISO 8601 timestamp (e.g., "2026-02-18T10:30:00Z")

**Success Response (200 OK):**
```json
{
  "sensorId": "SENSOR_001",
  "timestamp": "2026-02-18T10:30:00Z",
  "sensorType": "accelerometer",
  "config": {
    "sampleRate_Hz": 1000,
    "accelRange_g": 16
  },
  "data": {
    "horiz": [0.125, 0.245, ...],
    "vert": [0.356, 0.187, ...],
    "axial": [0.023, 0.189, ...]
  },
  "metadata": {
    "sampleCount": 1024,
    "duration_s": 1.024,
    "nyquist_Hz": 500,
    "frequencyResolution_Hz": 0.9765625
  }
}
```

**Error Responses:**

- **400 Bad Request** - Missing parameters or invalid JSON format
```json
{
  "error": {
    "message": "Missing required parameters: sensorId and timestamp"
  }
}
```

- **404 Not Found** - Waveform data file not found
```json
{
  "error": {
    "message": "Waveform data not found for sensor SENSOR_001 at timestamp 2026-02-18T10:30:00Z"
  }
}
```

- **500 Internal Server Error** - Server processing error
```json
{
  "error": {
    "message": "Internal server error while processing waveform data"
  }
}
```

## Data File Format

Waveform data files must be stored in: `backend/data/waveforms/`

File naming convention: `{sensorId}_{timestamp}.json`

**Required JSON Structure:**
```json
{
  "sensorId": "SENSOR_001",
  "timestamp": "2026-02-18T10:30:00Z",
  "sensorType": "accelerometer",
  "config": {
    "sampleRate_Hz": 1000,
    "accelRange_g": 16
  },
  "sensorParameters": {
    "rawHoriz": "BASE64_ENCODED_16BIT_SIGNED_LE_DATA",
    "rawVert": "BASE64_ENCODED_16BIT_SIGNED_LE_DATA",
    "rawAxial": "BASE64_ENCODED_16BIT_SIGNED_LE_DATA"
  }
}
```

## Processing Details

### Base64 Decoding
- Raw sensor data is base64 encoded
- Each value is a 16-bit signed integer in little-endian format
- Data is decoded using `Buffer.from(base64String, 'base64')`

### Integer Unpacking
- Integers are read using `buffer.readInt16LE(offset)`
- Step size: 2 bytes per value
- Range: -32768 to 32767

### G-Force Scaling
Values are scaled using the formula:
```
value_g = rawInt × (accelRange_g / 32768)
```

For example, with `accelRange_g = 16`:
- Raw value `16384` → `8.0g`
- Raw value `0` → `0.0g`
- Raw value `-16384` → `-8.0g`

### Metadata Calculation
- **sampleCount**: Total number of samples in each axis array
- **duration_s**: `sampleCount / sampleRate_Hz`
- **nyquist_Hz**: `sampleRate_Hz / 2` (maximum detectable frequency)
- **frequencyResolution_Hz**: `sampleRate_Hz / sampleCount` (FFT bin width)

## Example Usage

**Request:**
```bash
curl http://localhost:5003/api/waveforms/SENSOR_001/2026-02-18T10:30:00Z
```

**Response:**
```json
{
  "sensorId": "SENSOR_001",
  "timestamp": "2026-02-18T10:30:00Z",
  "sensorType": "accelerometer",
  "config": {
    "sampleRate_Hz": 1000,
    "accelRange_g": 16
  },
  "data": {
    "horiz": [0.125, 0.245, 0.356, ...],
    "vert": [0.356, 0.187, 0.298, ...],
    "axial": [0.023, 0.189, 0.412, ...]
  },
  "metadata": {
    "sampleCount": 1024,
    "duration_s": 1.024,
    "nyquist_Hz": 500,
    "frequencyResolution_Hz": 0.9765625
  }
}
```

## Implementation Files

- **Controller**: `src/controllers/waveformController.ts`
- **Routes**: `src/routes/waveformRoutes.ts`
- **Data Directory**: `data/waveforms/`

## Notes

- No hardcoded sample rates - all values derived from config
- Graceful error handling for missing files and decode errors
- Type-safe implementation with TypeScript interfaces
- Follows Express controller pattern with async/await
