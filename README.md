# Parcel Delivery System

A simple web application to register, track, and manage parcels.

## Features

*   **Register Parcel**: Add new parcels with a name and description.
*   **Track Parcel**: View the status of a parcel using its ID.
*   **List Parcels**: View all registered parcels in a list.
*   **Manage Parcels**: Update status (e.g., to 'delivered') or delete parcels.
*   **API**: RESTful API for integration.

## Setup

### Prerequisites

*   Node.js (v14 or higher)
*   PostgreSQL database

### Installation

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Set up environment variables:
    *   Copy `.env.example` to `.env`.
    *   Update the database connection details in `.env`:
        ```
        DB_HOST=localhost
        DB_USER=your_db_user
        DB_PASSWORD=your_db_password
        DB_NAME=parcel_delivery
        DB_PORT=5432
        ```

### Database Setup

The application will automatically attempt to create the `parcels` table if it does not exist when the server starts.

If you want to manually create the table, you can use the SQL query found in `server.js` or `setup-database.sql`.

## Running the Application

### Development

To run the server in development mode (requires `nodemon`):

```bash
npm run dev
```

### Production

To run the server in production mode:

```bash
npm start
```

The server will start on port 3000 by default (http://localhost:3000).

## API Endpoints

*   `GET /`: API status.
*   `GET /parcels`: List all parcels.
*   `GET /track-parcel/:id`: Get details of a specific parcel.
*   `POST /register-parcel`: Create a new parcel.
    *   Body: `{ "name": "Parcel Name", "description": "Description" }`
*   `PUT /parcels/:id/status`: Update parcel status.
    *   Body: `{ "status": "delivered" }`
*   `DELETE /parcels/:id`: Delete a parcel.

## Testing

To run the tests:

```bash
npm test
```

## License

ISC
