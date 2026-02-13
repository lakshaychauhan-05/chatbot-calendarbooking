#!/usr/bin/env python3
"""
Simple script to access the Docker PostgreSQL database
Run: python access_db.py
"""
import psycopg
from tabulate import tabulate

# Connection string
DATABASE_URL = "postgresql://postgres:postgres@localhost:5433/calendar_booking"

def main():
    print("Connecting to Docker PostgreSQL...")
    print("-" * 50)

    try:
        # Connect to database
        with psycopg.connect(DATABASE_URL) as conn:
            with conn.cursor() as cur:
                # List all tables
                print("\n📊 Tables in database:")
                cur.execute("""
                    SELECT tablename
                    FROM pg_tables
                    WHERE schemaname = 'public'
                    ORDER BY tablename;
                """)
                tables = cur.fetchall()

                if tables:
                    for table in tables:
                        print(f"  - {table[0]}")
                else:
                    print("  No tables found (migrations may not have run)")

                # Show table counts
                print("\n📈 Record counts:")
                for table in tables:
                    table_name = table[0]
                    cur.execute(f"SELECT COUNT(*) FROM {table_name};")
                    count = cur.fetchone()[0]
                    print(f"  {table_name}: {count} records")

                # Example: Show doctors
                if any('doctors' in str(t) for t in tables):
                    print("\n👨‍⚕️ Sample Doctors:")
                    cur.execute("SELECT id, name, email FROM doctors LIMIT 5;")
                    doctors = cur.fetchall()
                    if doctors:
                        print(tabulate(doctors, headers=['ID', 'Name', 'Email'], tablefmt='grid'))
                    else:
                        print("  No doctors found")

        print("\n✅ Connection successful!")

    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("\nMake sure:")
        print("  1. Docker containers are running: docker compose ps")
        print("  2. PostgreSQL is on port 5433: docker ps | grep postgres")

if __name__ == "__main__":
    main()
