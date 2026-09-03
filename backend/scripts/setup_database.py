#!/usr/bin/env python3
"""
Script to set up the PayLens database
"""
import sys
import os
import psycopg2
from psycopg2 import sql
from pathlib import Path

# Add the parent directory to the path so we can import from app
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.config import settings


def setup_database():
    """Set up the database schema"""
    print("Setting up PayLens database...")
    
    try:
        # Connect to PostgreSQL
        print(f"Connecting to database: {settings.DATABASE_URL}")
        
        conn = psycopg2.connect(settings.DATABASE_URL)
        conn.autocommit = True
        cursor = conn.cursor()
        
        # Read and execute schema file
        schema_path = Path(__file__).parent.parent / "app" / "db" / "schema.sql"
        
        if not schema_path.exists():
            print(f"❌ Schema file not found: {schema_path}")
            return False
        
        print(f"Reading schema from: {schema_path}")
        with open(schema_path, 'r') as f:
            schema_sql = f.read()
        
        # Execute schema
        print("Executing database schema...")
        cursor.execute(schema_sql)
        
        print("✅ Database schema created successfully")
        
        # Verify tables were created
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        """)
        
        tables = cursor.fetchall()
        print(f"\n📊 Created {len(tables)} tables:")
        for table in tables:
            print(f"  - {table[0]}")
        
        # Close connection
        cursor.close()
        conn.close()
        
        print("\n🎉 Database setup completed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Database setup failed: {e}")
        import traceback
        traceback.print_exc()
        return False


def test_database_connection():
    """Test database connection"""
    print("Testing database connection...")
    
    try:
        conn = psycopg2.connect(settings.DATABASE_URL)
        cursor = conn.cursor()
        
        # Test query
        cursor.execute("SELECT version();")
        version = cursor.fetchone()
        
        print(f"✅ Database connection successful")
        print(f"   PostgreSQL version: {version[0]}")
        
        cursor.close()
        conn.close()
        
        return True
        
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False


if __name__ == "__main__":
    # First test connection
    if test_database_connection():
        # Then setup schema
        success = setup_database()
        sys.exit(0 if success else 1)
    else:
        print("Please ensure PostgreSQL is running and DATABASE_URL is correct")
        sys.exit(1)