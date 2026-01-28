"""
Idempotency service for safely reusing request results.
"""
from datetime import datetime, timedelta, timezone
import hashlib
import json
from typing import Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.models.idempotency_key import IdempotencyKey


class IdempotencyService:
    """Handles idempotent request storage."""

    def __init__(self, ttl_hours: int = 24):
        self._ttl = timedelta(hours=ttl_hours)

    def _hash_payload(self, payload: dict) -> str:
        raw = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode("utf-8")
        return hashlib.sha256(raw).hexdigest()

    def begin(
        self,
        db: Session,
        key: str,
        endpoint: str,
        payload: dict
    ) -> Tuple[IdempotencyKey, Optional[IdempotencyKey]]:
        """
        Start idempotency handling.
        Returns (current_record, existing_record_if_any).
        """
        request_hash = self._hash_payload(payload)
        expires_at = datetime.now(timezone.utc) + self._ttl

        try:
            record = IdempotencyKey(
                key=key,
                endpoint=endpoint,
                request_hash=request_hash,
                status="IN_PROGRESS",
                expires_at=expires_at
            )
            db.add(record)
            db.commit()
            db.refresh(record)
            return record, None
        except IntegrityError:
            db.rollback()
            existing = db.query(IdempotencyKey).filter(
                IdempotencyKey.key == key,
                IdempotencyKey.endpoint == endpoint
            ).first()
            if existing and existing.expires_at and existing.expires_at < datetime.now(timezone.utc):
                db.delete(existing)
                db.commit()
                record = IdempotencyKey(
                    key=key,
                    endpoint=endpoint,
                    request_hash=request_hash,
                    status="IN_PROGRESS",
                    expires_at=expires_at
                )
                db.add(record)
                db.commit()
                db.refresh(record)
                return record, None
            return existing, existing

    def validate_existing(self, record: IdempotencyKey, payload: dict) -> Optional[dict]:
        request_hash = self._hash_payload(payload)
        if record.request_hash != request_hash:
            return {"status": "conflict"}
        if record.status == "COMPLETED" and record.response_body is not None:
            return {
                "status": "completed",
                "response": record.response_body,
                "response_status": record.response_status or 200
            }
        return {"status": "in_progress"}

    def complete(self, db: Session, record: IdempotencyKey, response_body: dict, status_code: int) -> None:
        record.response_body = response_body
        record.response_status = status_code
        record.status = "COMPLETED"
        db.add(record)
        db.commit()
