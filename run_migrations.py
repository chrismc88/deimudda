#!/usr/bin/env python3
"""
Run SQL migrations on the database
"""
import os
import sys
import glob
import mysql.connector
from mysql.connector import Error

# Get database URL from environment
DB_URL = os.getenv('DATABASE_URL', '')

def parse_db_url(url):
    """Parse MySQL connection URL"""
    import re
    pattern = r'mysql://([^:]+):([^@]+)@([^:]+):(\d+)/([^?]+)'
    match = re.match(pattern, url)
    if match:
        return {
            'user': match.group(1),
            'password': match.group(2),
            'host': match.group(3),
            'port': int(match.group(4)),
            'database': match.group(5),
            'ssl_disabled': False
        }
    return None

def connect_db(config):
    """Connect to MySQL database"""
    try:
        conn = mysql.connector.connect(**config)
        print(f"✓ Connected to database: {config['database']}")
        return conn
    except Error as e:
        print(f"✗ Error connecting to database: {e}")
        return None

def run_migration(cursor, sql_file):
    """Run a single SQL migration file"""
    print(f"  Running: {os.path.basename(sql_file)}")
    
    with open(sql_file, 'r', encoding='utf-8') as f:
        sql_content = f.read()
    
    # Split by statement breakpoint
    statements = sql_content.split('--> statement-breakpoint')
    
    for statement in statements:
        statement = statement.strip()
        if not statement:
            continue
        
        try:
            # Execute each statement
            cursor.execute(statement)
        except Error as e:
            # Ignore "table already exists" errors
            if 'already exists' in str(e) or 'duplicate' in str(e).lower():
                print(f"    ⚠ Skipping (already exists)")
            else:
                print(f"    ✗ Error: {e}")
                raise

def main():
    """Main migration function"""
    print("=" * 60)
    print("🔧 Running Database Migrations")
    print("=" * 60)
    
    # Parse database URL
    db_config = parse_db_url(DB_URL)
    if not db_config:
        print("✗ Could not parse DATABASE_URL")
        return 1
    
    # Connect to database
    conn = connect_db(db_config)
    if not conn:
        return 1
    
    cursor = conn.cursor()
    
    try:
        # Get all migration files in order
        migration_files = sorted(glob.glob('drizzle/0*.sql'))
        
        print(f"\n📋 Found {len(migration_files)} migration files\n")
        
        for sql_file in migration_files:
            run_migration(cursor, sql_file)
        
        # Commit all changes
        conn.commit()
        
        print("\n" + "=" * 60)
        print("✅ Migrations completed successfully!")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n✗ Migration failed: {e}")
        conn.rollback()
        return 1
    
    finally:
        cursor.close()
        conn.close()
    
    return 0

if __name__ == '__main__':
    sys.exit(main())
