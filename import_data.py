#!/usr/bin/env python3
"""
Import CSV backup data into the new deimudda2 database
"""
import csv
import os
import sys
from datetime import datetime
import mysql.connector
from mysql.connector import Error

# Database connection details
DB_CONFIG = {
    'host': 'gateway02.us-east-1.prod.aws.tidbcloud.com',
    'port': 4000,
    'user': 'NsiQtWCYGnoMDff.root',
    'password': 'I6karOH9aTzBd7A31k7Z',
    'database': 'Fnap243STGrtRAT8pGLyiK',
    'ssl_disabled': False
}

# Get the new database URL from environment
NEW_DB_URL = os.getenv('DATABASE_URL', '')

def parse_db_url(url):
    """Parse MySQL connection URL"""
    # mysql://user:pass@host:port/database
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

def import_users(cursor, csv_path):
    """Import users from CSV"""
    print("\n📥 Importing users...")
    count = 0
    
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                # Map CSV fields to database fields
                query = """
                INSERT INTO users (
                    id, openId, name, email, loginMethod, role,
                    nickname, location, profileImageUrl, isSellerActive, ageVerified,
                    createdAt, updatedAt, lastSignedIn
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
                )
                ON DUPLICATE KEY UPDATE
                    name = VALUES(name),
                    email = VALUES(email),
                    nickname = VALUES(nickname),
                    location = VALUES(location),
                    profileImageUrl = VALUES(profileImageUrl),
                    isSellerActive = VALUES(isSellerActive),
                    ageVerified = VALUES(ageVerified),
                    updatedAt = VALUES(updatedAt),
                    lastSignedIn = VALUES(lastSignedIn)
                """
                
                # Convert role: super_admin -> admin
                role = 'admin' if row['role'] == 'super_admin' else row['role']
                
                values = (
                    int(row['id']),
                    row['openId'],
                    row['name'] or None,
                    row['email'] or None,
                    row['loginMethod'] or None,
                    role,
                    row['nickname'] or None,
                    row['location'] or None,
                    row['profileImageUrl'] or None,
                    bool(int(row['isSellerActive'])) if row['isSellerActive'] else False,
                    bool(int(row['ageVerified'])) if row['ageVerified'] else False,
                    row['createdAt'],
                    row['updatedAt'],
                    row['lastSignedIn']
                )
                
                cursor.execute(query, values)
                count += 1
                
            except Exception as e:
                print(f"  ✗ Error importing user {row.get('id', 'unknown')}: {e}")
    
    print(f"  ✓ Imported {count} users")
    return count

def import_seller_profiles(cursor, csv_path):
    """Import seller profiles from CSV"""
    print("\n📥 Importing seller profiles...")
    count = 0
    
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                query = """
                INSERT INTO sellerProfiles (
                    id, userId, shopName, description, location,
                    profileImageUrl, verificationStatus, rating, totalReviews,
                    createdAt, updatedAt
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
                )
                ON DUPLICATE KEY UPDATE
                    shopName = VALUES(shopName),
                    description = VALUES(description),
                    location = VALUES(location),
                    profileImageUrl = VALUES(profileImageUrl),
                    updatedAt = VALUES(updatedAt)
                """
                
                values = (
                    int(row['id']),
                    int(row['userId']),
                    row['shopName'],
                    row['description'] or None,
                    row['location'] or None,
                    row['profileImageUrl'] or None,
                    row['verificationStatus'],
                    float(row['rating']) if row['rating'] else 0.0,
                    int(row['totalReviews']) if row['totalReviews'] else 0,
                    row['createdAt'],
                    row['updatedAt']
                )
                
                cursor.execute(query, values)
                count += 1
                
            except Exception as e:
                print(f"  ✗ Error importing seller profile {row.get('id', 'unknown')}: {e}")
    
    print(f"  ✓ Imported {count} seller profiles")
    return count

def import_listings(cursor, csv_path):
    """Import listings from CSV"""
    print("\n📥 Importing listings...")
    count = 0
    
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                query = """
                INSERT INTO listings (
                    id, sellerId, type, strain, description, quantity,
                    priceType, fixedPrice, offerMinPrice, acceptsOffers,
                    imageUrl, images, shippingVerified, shippingPickup, status,
                    genetics, seedBank, growMethod, seedType,
                    thcContent, cbdContent, floweringTime, yieldInfo,
                    flavorProfile, origin,
                    createdAt, updatedAt
                ) VALUES (
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                    %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,
                    %s, %s, %s, %s, %s, %s, %s
                )
                ON DUPLICATE KEY UPDATE
                    description = VALUES(description),
                    quantity = VALUES(quantity),
                    fixedPrice = VALUES(fixedPrice),
                    imageUrl = VALUES(imageUrl),
                    images = VALUES(images),
                    status = VALUES(status),
                    updatedAt = VALUES(updatedAt)
                """
                
                values = (
                    int(row['id']),
                    int(row['sellerId']),
                    row['type'],
                    row['strain'],
                    row['description'] or None,
                    int(row['quantity']),
                    'offer' if row['priceType'] == 'auction' else row['priceType'],  # Convert auction to offer
                    float(row['fixedPrice']) if row['fixedPrice'] else None,
                    float(row['offerMinPrice']) if row['offerMinPrice'] else None,
                    bool(int(row['acceptsOffers'])) if row['acceptsOffers'] else False,
                    row['imageUrl'] or None,
                    row['images'] or None,
                    bool(int(row['shippingVerified'])) if row['shippingVerified'] else True,
                    bool(int(row['shippingPickup'])) if row['shippingPickup'] else False,
                    row['status'],
                    row['genetics'] or None,
                    row['seedBank'] or None,
                    row['growMethod'] or None,
                    row['seedType'] or None,
                    row['thcContent'] or None,
                    row['cbdContent'] or None,
                    row['floweringTime'] or None,
                    row['yieldInfo'] or None,
                    row['flavorProfile'] or None,
                    row['origin'] or None,
                    row['createdAt'],
                    row['updatedAt']
                )
                
                cursor.execute(query, values)
                count += 1
                
            except Exception as e:
                print(f"  ✗ Error importing listing {row.get('id', 'unknown')}: {e}")
    
    print(f"  ✓ Imported {count} listings")
    return count

def import_system_settings(cursor, csv_path):
    """Import system settings from CSV"""
    print("\n📥 Importing system settings...")
    count = 0
    
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                query = """
                INSERT INTO systemSettings (
                    settingKey, settingValue, description, category, updatedAt
                ) VALUES (
                    %s, %s, %s, %s, %s
                )
                ON DUPLICATE KEY UPDATE
                    settingValue = VALUES(settingValue),
                    updatedAt = VALUES(updatedAt)
                """
                
                values = (
                    row['key'],
                    row['value'],
                    row['description'] or None,
                    row['category'] or 'general',
                    row['updatedAt']
                )
                
                cursor.execute(query, values)
                count += 1
                
            except Exception as e:
                print(f"  ✗ Error importing setting {row.get('key', 'unknown')}: {e}")
    
    print(f"  ✓ Imported {count} system settings")
    return count

def main():
    """Main import function"""
    print("=" * 60)
    print("🚀 DeiMudda2 Data Import")
    print("=" * 60)
    
    # Parse new database URL
    new_db_config = parse_db_url(NEW_DB_URL)
    if not new_db_config:
        print("✗ Could not parse DATABASE_URL")
        return 1
    
    # Connect to new database
    conn = connect_db(new_db_config)
    if not conn:
        return 1
    
    cursor = conn.cursor()
    
    try:
        # Import data
        csv_dir = '/home/ubuntu/upload'
        
        # Import users first (required for foreign keys)
        import_users(cursor, f'{csv_dir}/users_20251031_232812.csv')
        
        # Import seller profiles
        import_seller_profiles(cursor, f'{csv_dir}/sellerProfiles_20251031_232940.csv')
        
        # Import listings
        import_listings(cursor, f'{csv_dir}/listings_20251031_232858.csv')
        
        # Import system settings
        import_system_settings(cursor, f'{csv_dir}/systemSettings_20251031_232953.csv')
        
        # Commit all changes
        conn.commit()
        
        print("\n" + "=" * 60)
        print("✅ Import completed successfully!")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n✗ Import failed: {e}")
        conn.rollback()
        return 1
    
    finally:
        cursor.close()
        conn.close()
    
    return 0

if __name__ == '__main__':
    sys.exit(main())
