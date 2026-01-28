import unittest
from datetime import datetime, timezone, timedelta

from app.services.idempotency_service import IdempotencyService
from app.models.idempotency_key import IdempotencyKey


class IdempotencyServiceTest(unittest.TestCase):
    def test_validate_existing_conflict(self):
        service = IdempotencyService()
        record = IdempotencyKey(
            key="test",
            endpoint="POST:/api/v1/appointments",
            request_hash="hash1",
            status="COMPLETED",
            response_body={"id": "1"},
            response_status=201,
            expires_at=datetime.now(timezone.utc) + timedelta(hours=1)
        )
        result = service.validate_existing(record, {"different": "payload"})
        self.assertEqual(result["status"], "conflict")

    def test_validate_existing_completed(self):
        service = IdempotencyService()
        payload = {"doctor_email": "a@b.com"}
        record = IdempotencyKey(
            key="test",
            endpoint="POST:/api/v1/appointments",
            request_hash=service._hash_payload(payload),
            status="COMPLETED",
            response_body={"id": "1"},
            response_status=201,
            expires_at=datetime.now(timezone.utc) + timedelta(hours=1)
        )
        result = service.validate_existing(record, payload)
        self.assertEqual(result["status"], "completed")
        self.assertEqual(result["response"]["id"], "1")


if __name__ == "__main__":
    unittest.main()
