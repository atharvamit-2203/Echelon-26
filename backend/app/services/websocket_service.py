"""
Real-time notification system using WebSocket
"""
from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, List, Set
import json
import asyncio
from datetime import datetime
from app.core.logging import logger


class ConnectionManager:
    """Manage WebSocket connections"""
    
    def __init__(self):
        self.active_connections: Dict[str, Set[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, client_id: str):
        """Connect a new client"""
        await websocket.accept()
        if client_id not in self.active_connections:
            self.active_connections[client_id] = set()
        self.active_connections[client_id].add(websocket)
        logger.info(f"Client {client_id} connected")
    
    def disconnect(self, websocket: WebSocket, client_id: str):
        """Disconnect a client"""
        if client_id in self.active_connections:
            self.active_connections[client_id].discard(websocket)
            if not self.active_connections[client_id]:
                del self.active_connections[client_id]
        logger.info(f"Client {client_id} disconnected")
    
    async def send_personal_message(self, message: dict, client_id: str):
        """Send message to a specific client"""
        if client_id in self.active_connections:
            disconnected = set()
            for connection in self.active_connections[client_id]:
                try:
                    await connection.send_json(message)
                except:
                    disconnected.add(connection)
            
            # Clean up disconnected clients
            for conn in disconnected:
                self.active_connections[client_id].discard(conn)
    
    async def broadcast(self, message: dict):
        """Broadcast message to all connected clients"""
        for client_id in list(self.active_connections.keys()):
            await self.send_personal_message(message, client_id)


# Global connection manager
manager = ConnectionManager()


class NotificationService:
    """Service for sending real-time notifications"""
    
    @staticmethod
    async def notify_analysis_started(job_description: str, total_cvs: int):
        """Notify when analysis starts"""
        message = {
            "type": "analysis_started",
            "timestamp": datetime.now().isoformat(),
            "data": {
                "job_description": job_description[:100] + "...",
                "total_cvs": total_cvs,
                "message": f"Started analyzing {total_cvs} CVs"
            }
        }
        await manager.broadcast(message)
    
    @staticmethod
    async def notify_analysis_progress(current: int, total: int, rescued_count: int):
        """Notify analysis progress"""
        message = {
            "type": "analysis_progress",
            "timestamp": datetime.now().isoformat(),
            "data": {
                "current": current,
                "total": total,
                "rescued_count": rescued_count,
                "percentage": round((current / total) * 100, 1),
                "message": f"Analyzed {current}/{total} CVs, rescued {rescued_count}"
            }
        }
        await manager.broadcast(message)
    
    @staticmethod
    async def notify_analysis_complete(results: dict):
        """Notify when analysis completes"""
        message = {
            "type": "analysis_complete",
            "timestamp": datetime.now().isoformat(),
            "data": {
                "total_analyzed": results.get("total_analyzed", 0),
                "rescued_count": results.get("rescued_count", 0),
                "average_ats_score": results.get("average_ats_score", 0),
                "message": f"Analysis complete! Rescued {results.get('rescued_count', 0)} candidates"
            }
        }
        await manager.broadcast(message)
    
    @staticmethod
    async def notify_bias_detected(bias_data: dict):
        """Notify when bias is detected"""
        message = {
            "type": "bias_alert",
            "timestamp": datetime.now().isoformat(),
            "severity": "warning",
            "data": {
                "bias_type": bias_data.get("type", "unknown"),
                "affected_group": bias_data.get("group", "unknown"),
                "impact": bias_data.get("impact", "medium"),
                "message": f"⚠️ Bias detected in {bias_data.get('type', 'hiring process')}"
            }
        }
        await manager.broadcast(message)
    
    @staticmethod
    async def notify_candidate_rescued(candidate_data: dict):
        """Notify when a candidate is rescued"""
        message = {
            "type": "candidate_rescued",
            "timestamp": datetime.now().isoformat(),
            "data": {
                "candidate_id": candidate_data.get("candidateId"),
                "name": candidate_data.get("name"),
                "ats_score": candidate_data.get("atsScore"),
                "semantic_score": candidate_data.get("semanticScore"),
                "message": f"🎯 Rescued: {candidate_data.get('name')} (ATS: {candidate_data.get('atsScore')}%, Semantic: {candidate_data.get('semanticScore', 0)*100:.1f}%)"
            }
        }
        await manager.broadcast(message)
    
    @staticmethod
    async def notify_cv_uploaded(cv_data: dict):
        """Notify when a CV is uploaded"""
        message = {
            "type": "cv_uploaded",
            "timestamp": datetime.now().isoformat(),
            "data": {
                "candidate_id": cv_data.get("candidateId"),
                "name": cv_data.get("name"),
                "message": f"📄 New CV uploaded: {cv_data.get('name')}"
            }
        }
        await manager.broadcast(message)


notification_service = NotificationService()
