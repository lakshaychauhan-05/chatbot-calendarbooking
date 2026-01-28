import unittest
from datetime import date, time, timezone

from app.utils.datetime_utils import to_utc


class DateTimeUtilsTest(unittest.TestCase):
    def test_to_utc_defaults_to_utc(self):
        dt = to_utc(date(2026, 1, 1), time(10, 0), "UTC")
        self.assertEqual(dt.tzinfo, timezone.utc)
        self.assertEqual(dt.hour, 10)

    def test_to_utc_invalid_timezone_fallback(self):
        dt = to_utc(date(2026, 1, 1), time(10, 0), "Invalid/Zone")
        self.assertEqual(dt.tzinfo, timezone.utc)


if __name__ == "__main__":
    unittest.main()
