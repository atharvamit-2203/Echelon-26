export async function GET() {
    return Response.json({
        status: 'healthy',
        service: 'fair-hire-sentinel-frontend',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
}
