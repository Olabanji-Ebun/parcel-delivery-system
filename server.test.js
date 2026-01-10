const request = require('supertest');
const app = require('./server');
const db = require('./db');

// Mock the db module
jest.mock('./db', () => ({
    query: jest.fn(),
    pool: {
        end: jest.fn()
    }
}));

describe('Parcel Delivery System API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Test GET /
    test('GET / should return API info', async () => {
        const response = await request(app).get('/');
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('status', 'online');
    });

    // Test GET /parcels
    test('GET /parcels should return a list of parcels', async () => {
        const mockParcels = [
            { id: 1, name: 'Parcel 1', status: 'pending' },
            { id: 2, name: 'Parcel 2', status: 'delivered' }
        ];
        db.query.mockResolvedValue({ rows: mockParcels });

        const response = await request(app).get('/parcels');
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(mockParcels);
        expect(db.query).toHaveBeenCalledWith('SELECT * FROM parcels ORDER BY created_at DESC');
    });

    // Test POST /register-parcel
    test('POST /register-parcel should create a new parcel', async () => {
        const newParcel = { name: 'New Parcel', description: 'Test description' };
        db.query.mockResolvedValue({ rows: [{ id: 123 }] });

        const response = await request(app)
            .post('/register-parcel')
            .send(newParcel);

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('parcelId', 123);
        expect(db.query).toHaveBeenCalledWith(
            'INSERT INTO parcels (name, description) VALUES ($1, $2) RETURNING id',
            ['New Parcel', 'Test description']
        );
    });

    // Test POST /register-parcel validation
    test('POST /register-parcel should fail without name', async () => {
        const response = await request(app)
            .post('/register-parcel')
            .send({ description: 'No name' });

        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty('error');
    });

    // Test GET /track-parcel/:id
    test('GET /track-parcel/:id should return parcel details', async () => {
        const mockParcel = { id: 1, name: 'Parcel 1' };
        db.query.mockResolvedValue({ rows: [mockParcel] });

        const response = await request(app).get('/track-parcel/1');
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(mockParcel);
    });

    test('GET /track-parcel/:id should return 404 if not found', async () => {
        db.query.mockResolvedValue({ rows: [] });

        const response = await request(app).get('/track-parcel/999');
        expect(response.statusCode).toBe(404);
    });

    // Test PUT /parcels/:id/status
    test('PUT /parcels/:id/status should update status', async () => {
        db.query.mockResolvedValue({ rows: [{ id: 1, status: 'delivered' }] });

        const response = await request(app)
            .put('/parcels/1/status')
            .send({ status: 'delivered' });

        expect(response.statusCode).toBe(200);
        expect(db.query).toHaveBeenCalledWith(
            'UPDATE parcels SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
            ['delivered', '1']
        );
    });

    // Test DELETE /parcels/:id
    test('DELETE /parcels/:id should delete parcel', async () => {
        db.query.mockResolvedValue({ rows: [{ id: 1 }] });

        const response = await request(app).delete('/parcels/1');

        expect(response.statusCode).toBe(200);
        expect(db.query).toHaveBeenCalledWith(
            'DELETE FROM parcels WHERE id = $1 RETURNING id',
            ['1']
        );
    });
});
