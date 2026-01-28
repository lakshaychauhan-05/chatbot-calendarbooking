import unittest
from datetime import time

from app.services.availability_service import AvailabilityService


class AvailabilityServiceTest(unittest.TestCase):
    def test_generate_slots(self):
        slots = AvailabilityService._generate_slots(
            start_time=time(9, 0),
            end_time=time(10, 0),
            slot_duration_minutes=30
        )
        self.assertEqual(len(slots), 2)
        self.assertEqual(slots[0].start_time, time(9, 0))
        self.assertEqual(slots[0].end_time, time(9, 30))
        self.assertEqual(slots[1].start_time, time(9, 30))
        self.assertEqual(slots[1].end_time, time(10, 0))


if __name__ == "__main__":
    unittest.main()
