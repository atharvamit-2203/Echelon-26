"""
WebSocket endpoint for real-time notifications
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.services.websocket_service import manager
import uuid

router = APIRouter()


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for real-time notifications
    
    Clients connect to this endpoint to receive real-time updates about:
    - Analysis progress
    - Bias detection alerts
    - Candidate rescues
    - CV uploads
    """
    client_id = str(uuid.uuid4())
    await manager.connect(websocket, client_id)
    
    try:
        while True:
            # Keep connection alive and listen for client messages
            data = await websocket.receive_text()
            
            # Echo back for heartbeat
            await websocket.send_json({
                "type": "pong",
                "timestamp": data
            })
            
    except WebSocketDisconnect:
        manager.disconnect(websocket, client_id)
